import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { crearClienteInsforge } from '@/shared/lib/insforge';
import { useOperativo } from './context';
import { rpcOperativo, useListos, type Orden, type Mesa, type OrdenMesa } from './api';
import { fusionarCola, leerEvento } from './eventos';

export function ActualizacionOperativa() {
  const op = useOperativo(),
    cache = useQueryClient(),
    listos = useListos();
  const roles = [...op.roles].sort().join(','),
    ambito = `${op.local}:${op.usuario}:${roles}`;
  const [conexion, setConexion] = useState({ ambito: '', estado: 'conectando' });
  const estado = conexion.ambito === ambito ? conexion.estado : 'conectando';
  useEffect(() => {
    const realtime = crearClienteInsforge().realtime;
    const canales = roles.split(',').map((r) => `lys-operativo:${op.local}:${r}`);
    let terminado = false,
      enVivo = false,
      suscribiendo = false,
      errorAnunciado = false;
    const revisiones = new Map<string, number>();
    const mostrar = (estado: string) => {
      if (!terminado) setConexion({ ambito, estado });
    };
    const refrescar = () => {
      if (terminado) return;
      void cache.invalidateQueries({
        predicate: (q) =>
          q.queryKey[0] === 'operativo' &&
          q.queryKey[2] === op.local &&
          q.queryKey[3] === op.usuario,
        refetchType: 'active',
      });
    };
    const fallo = () => {
      if (terminado) return;
      enVivo = false;
      mostrar('recuperando');
      if (!errorAnunciado) {
        console.warn('[operativo]', 'REALTIME_NO_DISPONIBLE');
        errorAnunciado = true;
      }
    };
    const suscribir = async () => {
      if (terminado || suscribiendo) return;
      suscribiendo = true;
      try {
        const respuestas = await Promise.all(canales.map((c) => realtime.subscribe(c)));
        if (terminado) return;
        if (respuestas.some((r) => !r.ok)) {
          fallo();
          return;
        }
        enVivo = true;
        errorAnunciado = false;
        mostrar('conectado');
        refrescar();
      } catch {
        fallo();
      } finally {
        suscribiendo = false;
      }
    };
    const actualizar = async (valor: unknown) => {
      const e = leerEvento(valor, op.local, canales);
      if (terminado || !e || e.revision <= (revisiones.get(e.id) ?? 0)) return;
      revisiones.set(e.id, e.revision);
      try {
        // El evento no contiene datos críticos: una lectura individual autorizada decide el cambio.
        const soloCocina = roles.split(',').every((r) => r === 'COCINA');
        const p = await rpcOperativo<Orden | null>(
          soloCocina ? 'consultar_cocina' : 'consultar_orden_operativa',
          { p_id: e.id },
        );
        if (
          terminado ||
          (p && (p.local_id !== op.local || p.revision < (revisiones.get(e.id) ?? 0)))
        )
          return;
        const actualizarCola = (nombre: string, filtro: (orden: Orden) => boolean) =>
          cache.setQueryData<Orden[]>(['operativo', nombre, op.local, op.usuario], (vieja) =>
            fusionarCola(vieja, p, e.id, filtro),
          );
        actualizarCola(
          'cocina',
          (orden) =>
            orden.estado_pago === 'APROBADO' &&
            ['CONFIRMADO', 'EN_PREPARACION', 'LISTO'].includes(orden.estado_pedido),
        );
        actualizarCola(
          'cola-pagos',
          (orden) => orden.estado_pedido === 'PENDIENTE_PAGO' && orden.estado_pago === 'PENDIENTE',
        );
        actualizarCola(
          'listos',
          (orden) => orden.estado_pedido === 'LISTO' && orden.estado_pago === 'APROBADO',
        );
        if (!p) return;
        const previa = cache.getQueryData<Orden>([
          'operativo',
          'orden',
          op.local,
          op.usuario,
          p.id,
        ]);
        if (
          p.estado_pago === 'ANULADO' ||
          (p.estado_pago === 'APROBADO' && previa?.estado_pago !== 'APROBADO')
        )
          void cache.invalidateQueries(
            { queryKey: ['operativo', 'caja', op.local, op.usuario] },
            { cancelRefetch: false },
          );
        const activa = !['FINALIZADO', 'ANULADO'].includes(p.estado_pedido);
        cache.setQueryData<Orden | null>(
          ['operativo', 'orden', op.local, op.usuario, p.id],
          (vieja) => (vieja && vieja.revision > p.revision ? vieja : p),
        );
        if (p.mesa_id && p.mesa) {
          cache.setQueryData<Orden | null>(
            ['operativo', 'mesa', op.local, op.usuario, p.mesa_id],
            (vieja) => (vieja && vieja.revision > p.revision ? vieja : activa ? p : null),
          );
          cache.setQueryData<Mesa[]>(['operativo', 'mesas', op.local, op.usuario], (viejas) =>
            viejas?.map((m) => (m.id === p.mesa_id ? { ...m, estado: p.mesa!.estado } : m)),
          );
          cache.setQueryData<OrdenMesa[]>(
            ['operativo', 'ordenes-mesa', op.local, op.usuario],
            (viejas) =>
              viejas
                ? [
                    ...viejas.filter((x) => x.mesa_id !== p.mesa_id),
                    ...(activa
                      ? [
                          {
                            mesa_id: p.mesa_id!,
                            codigo: p.codigo,
                            estado_pago: p.estado_pago,
                            estado_pedido: p.estado_pedido,
                          },
                        ]
                      : []),
                  ]
                : viejas,
          );
        }
      } catch {
        fallo();
      }
    };
    const conectado = () => {
      void suscribir();
    };
    const conectar = () => {
      void realtime.connect().then(conectado).catch(fallo);
    };
    const recuperar = () => {
      refrescar();
      if (!realtime.isConnected) {
        realtime.disconnect();
        conectar();
      } else if (!enVivo) conectado();
    };
    const visible = () => {
      if (document.visibilityState === 'visible') recuperar();
    };
    realtime.on('pedido_actualizado', actualizar);
    realtime.on('connect', conectado);
    realtime.on('disconnect', fallo);
    realtime.on('connect_error', fallo);
    realtime.on('error', fallo);
    conectar();
    // Red solo cada 30 s en fallback y con la pestaña visible. El reloj del KDS es independiente.
    const timer = window.setInterval(() => {
      if (!enVivo && document.visibilityState === 'visible') recuperar();
    }, 30_000);
    window.addEventListener('online', recuperar);
    document.addEventListener('visibilitychange', visible);
    return () => {
      terminado = true;
      clearInterval(timer);
      window.removeEventListener('online', recuperar);
      document.removeEventListener('visibilitychange', visible);
      realtime.off('pedido_actualizado', actualizar);
      realtime.off('connect', conectado);
      realtime.off('disconnect', fallo);
      realtime.off('connect_error', fallo);
      realtime.off('error', fallo);
      canales.forEach((c) => realtime.unsubscribe(c));
      realtime.disconnect();
    };
  }, [op.local, op.usuario, roles, ambito, cache]);
  return (
    <aside className="op-connection" aria-label="Actualización de operación">
      <p role="status">
        {estado === 'conectado'
          ? 'Conectado · actualización automática'
          : estado === 'conectando'
            ? 'Conectando actualización de pedidos…'
            : 'Conexión en recuperación. Consultamos cada 30 segundos mientras esta pestaña está visible.'}
      </p>
      <button onClick={() => void cache.invalidateQueries({ queryKey: ['operativo'] })}>
        Actualizar operación
      </button>
      {op.roles.some((r) => ['MOZO', 'ADMINISTRADOR'].includes(r)) && (
        <p role="status">
          {listos.error
            ? 'No se pudieron consultar los avisos.'
            : `${listos.data?.length ?? 0} pedidos listos para entregar`}
          {!!listos.data?.length && (
            <>
              {' '}
              · <Link to="/operativo/listos">Ver pedidos listos</Link>
            </>
          )}
        </p>
      )}
    </aside>
  );
}
