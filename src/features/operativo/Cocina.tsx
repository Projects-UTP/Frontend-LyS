import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import { rpcOperativo, useColaCocina, useListos, type Orden } from './api';
import { useOperativo } from './context';

const estados = ['CONFIRMADO', 'EN_PREPARACION', 'LISTO'] as const;
const etiquetas = { CONFIRMADO: 'Por preparar', EN_PREPARACION: 'En preparación', LISTO: 'Listos' };
const horaOperativa = (fecha: string) =>
  new Intl.DateTimeFormat('es-PE', {
    timeZone: 'America/Lima',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(fecha));
function umbral(valor: string | undefined) {
  const n = Number(valor);
  return Number.isFinite(n) && n > 0 ? n : null;
}
const atencion = umbral(import.meta.env.VITE_KDS_ATENCION_MIN),
  demora = umbral(import.meta.env.VITE_KDS_DEMORA_MIN);
export function InicioOperativo() {
  const { roles } = useOperativo();
  return (
    <Navigate
      replace
      to={
        roles.includes('MOZO') || roles.includes('ADMINISTRADOR')
          ? '/operativo/mesas'
          : roles.includes('CAJA')
            ? '/operativo/caja'
            : '/operativo/cocina'
      }
    />
  );
}
export function Cocina() {
  const { roles } = useOperativo(),
    cola = useColaCocina();
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setAhora(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);
  if (!roles.some((r) => ['COCINA', 'ADMINISTRADOR'].includes(r)))
    return (
      <>
        <h1>Sin acceso a cocina</h1>
        <p>Tu rol no permite consultar KDS.</p>
      </>
    );
  return (
    <>
      <div className="op-title">
        <div>
          <p className="op-kicker">COCINA · KDS</p>
          <h1>Pedidos de cocina</h1>
        </div>
        <button disabled={cola.isFetching} onClick={() => void cola.refetch()}>
          Actualizar cocina
        </button>
      </div>
      <p>Solo pedidos con pago aprobado. Las observaciones acompañan cada producto.</p>
      <p className="op-notice">
        {atencion !== null && demora !== null && demora > atencion
          ? `Avisos configurados: atención desde ${atencion} min y demora desde ${demora} min. No representan un plazo prometido al cliente.`
          : 'Sin umbrales de tiempo configurados. Se muestra el tiempo transcurrido, sin prometer plazos.'}
      </p>
      {cola.isPending ? (
        <p role="status">Consultando cocina…</p>
      ) : cola.error ? (
        <p role="alert">{cola.error.message}</p>
      ) : (
        <div className="op-kds">
          {estados.map((estado) => (
            <section
              className={`op-kds-column op-kds-${estado.toLowerCase()}`}
              key={estado}
              aria-label={etiquetas[estado]}
            >
              <h2>
                {etiquetas[estado]}{' '}
                <span>({cola.data?.filter((p) => p.estado_pedido === estado).length ?? 0})</span>
              </h2>
              {(cola.data ?? [])
                .filter((p) => p.estado_pedido === estado)
                .map((p) => (
                  <TarjetaOrden key={`${p.id}-${p.revision}`} orden={p} ahora={ahora} />
                ))}
              {!cola.data?.some((p) => p.estado_pedido === estado) && (
                <p className="op-empty">Sin pedidos en esta etapa.</p>
              )}
            </section>
          ))}
        </div>
      )}
    </>
  );
}
export function Listos() {
  const { roles } = useOperativo(),
    cola = useListos();
  const [ahora] = useState(() => Date.now());
  if (!roles.some((r) => ['MOZO', 'ADMINISTRADOR'].includes(r)))
    return (
      <>
        <h1>Sin acceso a entregas</h1>
        <p>Tu rol no registra entregas.</p>
      </>
    );
  return (
    <>
      <div className="op-title">
        <div>
          <p className="op-kicker">AVISOS AL MOZO</p>
          <h1>Pedidos listos para entregar</h1>
        </div>
        <button onClick={() => void cola.refetch()} disabled={cola.isFetching}>
          Actualizar listos
        </button>
      </div>
      <p>
        Verifica la mesa y sus observaciones. Registrar la entrega finaliza consumo local/recojo y
        libera su mesa.
      </p>
      {cola.isPending ? (
        <p role="status">Consultando listos…</p>
      ) : cola.error ? (
        <p role="alert">{cola.error.message}</p>
      ) : (
        <>
          <p role="status">{cola.data?.length ?? 0} pedidos listos</p>
          <div className="op-ready-grid">
            {cola.data?.map((p) => (
              <TarjetaOrden key={`${p.id}-${p.revision}`} orden={p} ahora={ahora} entrega />
            ))}
          </div>
          {!cola.data?.length && <p className="op-empty">No hay pedidos listos para entregar.</p>}
        </>
      )}
    </>
  );
}
function TarjetaOrden({
  orden: p,
  ahora,
  entrega = false,
}: {
  orden: Orden;
  ahora: number;
  entrega?: boolean;
}) {
  const op = useOperativo(),
    cache = useQueryClient();
  const [confirmar, setConfirmar] = useState(false);
  const destino = entrega
    ? 'ENTREGADO'
    : p.estado_pedido === 'CONFIRMADO'
      ? 'EN_PREPARACION'
      : 'LISTO';
  const cambiar = useMutation({
    mutationFn: () =>
      rpcOperativo<Orden>('cambiar_estado_pedido', {
        p_id: p.id,
        p_revision: p.revision,
        p_estado: destino,
      }),
    onSuccess: () => {
      for (const nombre of ['cocina', 'listos', 'mesa', 'mesas', 'ordenes-mesa'])
        void cache.invalidateQueries({ queryKey: ['operativo', nombre, op.local, op.usuario] });
    },
  });
  const minutos = Math.max(
    0,
    Math.floor((ahora - new Date(p.confirmed_at ?? p.created_at).getTime()) / 60000),
  );
  const color =
    atencion !== null && demora !== null && demora > atencion
      ? minutos >= demora
        ? 'demora'
        : minutos >= atencion
          ? 'atencion'
          : 'normal'
      : '';
  return (
    <article className={`op-card op-ticket ${color}`} aria-label={`Pedido ${p.codigo}`}>
      <div className="op-ticket-heading">
        {entrega ? <h2>{p.codigo}</h2> : <h3>{p.codigo}</h3>}
        <strong>{p.mesa?.nombre ?? p.modalidad.replaceAll('_', ' ')}</strong>
      </div>
      <p>
        Confirmado {horaOperativa(p.confirmed_at ?? p.created_at)} ·{' '}
        <strong>{minutos} min transcurridos</strong>
        {color === 'atencion' ? ' · Atención' : color === 'demora' ? ' · Demorado' : ''}
      </p>
      <p>Mozo: {p.mozo_nombre || (p.mozo_id ? 'Personal asignado' : 'Pedido web')}</p>
      {p.preparation_started_at && <p>Preparación: {horaOperativa(p.preparation_started_at)}</p>}
      {p.ready_at && <p>Listo: {horaOperativa(p.ready_at)}</p>}
      <ul className="op-ticket-items">
        {p.items.map((i) => (
          <li key={i.producto_id}>
            <strong>
              <span className="op-ticket-qty">{i.cantidad} ×</span> {i.nombre_producto}
            </strong>
            {i.observaciones && <p className="op-observation">{i.observaciones}</p>}
          </li>
        ))}
      </ul>
      {p.observaciones && (
        <p className="op-observation">
          <strong>Orden:</strong> {p.observaciones}
        </p>
      )}
      {p.demostracion && <p className="op-demo">Orden de demostración</p>}
      {cambiar.error && (
        <p role="alert">{cambiar.error.message} Actualiza la cola antes de reintentar.</p>
      )}
      {entrega && (
        <label className="op-check">
          <input
            type="checkbox"
            checked={confirmar}
            onChange={(e) => setConfirmar(e.target.checked)}
          />
          Confirmo la entrega de {p.codigo}
        </label>
      )}
      {(p.estado_pedido !== 'LISTO' || entrega) && (
        <button
          className="op-primary"
          disabled={cambiar.isPending || (entrega && !confirmar)}
          onClick={() => cambiar.mutate()}
          aria-label={`${entrega ? 'Registrar entrega' : destino === 'EN_PREPARACION' ? 'Iniciar preparación' : 'Marcar listo'} ${p.codigo}`}
        >
          {cambiar.isPending
            ? 'Guardando…'
            : entrega
              ? 'Registrar entrega'
              : destino === 'EN_PREPARACION'
                ? 'Iniciar preparación'
                : 'Marcar listo'}
        </button>
      )}
      {p.estado_pedido === 'LISTO' && !entrega && (
        <p className="op-feedback">Listo · pendiente de entrega por mozo</p>
      )}
    </article>
  );
}
