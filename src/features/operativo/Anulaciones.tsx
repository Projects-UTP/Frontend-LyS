import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { soles } from '@/features/catalogo/api';
import { rpcOperativo, type MetodoPago } from './api';
import { useOperativo } from './context';
type PagoAdministrativo = {
  pago_id: string;
  codigo: string;
  metodo: MetodoPago;
  monto: number;
  estado: string;
  created_at: string;
  estado_pedido: string;
  sesion_estado: string;
  puede_anular: boolean;
  anulado_at: string | null;
  anulado_por: string | null;
  motivo_anulacion: string | null;
};
const fecha = (valor: string) =>
  new Intl.DateTimeFormat('es-PE', {
    timeZone: 'America/Lima',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(valor));
export function Anulaciones() {
  const op = useOperativo(),
    cache = useQueryClient();
  const [entrada, setEntrada] = useState(''),
    [codigo, setCodigo] = useState('');
  const [motivo, setMotivo] = useState(''),
    [confirmado, setConfirmado] = useState(false);
  const [error, setError] = useState('');
  const permitido = op.roles.includes('ADMINISTRADOR');
  const pago = useQuery({
    queryKey: ['operativo', 'pago-admin', op.local, op.usuario, codigo],
    enabled: permitido && !!codigo,
    queryFn: () =>
      rpcOperativo<PagoAdministrativo | null>('consultar_pago_administrador', {
        p_local: op.local,
        p_codigo: codigo,
      }),
  });
  const anular = useMutation({
    mutationFn: () =>
      rpcOperativo('anular_pago', {
        p_pago: pago.data!.pago_id,
        p_motivo: motivo.trim(),
        p_confirmado: confirmado,
      }),
    onSuccess: async () => {
      setConfirmado(false);
      await cache.invalidateQueries({ queryKey: ['operativo'] });
    },
  });
  if (!permitido)
    return (
      <>
        <h1>Sin acceso a anulaciones</h1>
        <p>Esta operación requiere una asignación de administrador en el local.</p>
      </>
    );
  const p = pago.data;
  return (
    <>
      <p className="op-kicker">CONTROL ADMINISTRATIVO</p>
      <h1>Anulación de pagos</h1>
      <p>Consulta un pago del local. Se conserva su registro y el motivo de la anulación.</p>
      <form
        className="op-card"
        onSubmit={(e) => {
          e.preventDefault();
          const valor = entrada.trim().toUpperCase();
          if (!/^LYS-[0-9]{6,12}$/.test(valor)) {
            setError('Escribe un código válido, por ejemplo LYS-000002.');
            return;
          }
          setError('');
          setMotivo('');
          setConfirmado(false);
          anular.reset();
          if (codigo === valor) void pago.refetch();
          else setCodigo(valor);
        }}
      >
        <label htmlFor="codigo-pago">
          Código de pedido
          <input
            id="codigo-pago"
            value={entrada}
            maxLength={16}
            onChange={(e) => setEntrada(e.target.value)}
            required
          />
        </label>
        {error && <p role="alert">{error}</p>}
        <button type="submit" disabled={pago.isFetching || anular.isPending}>
          Consultar pago
        </button>
      </form>
      {codigo &&
        (pago.isPending ? (
          <p role="status">Consultando pago…</p>
        ) : pago.error ? (
          <div className="op-card">
            <p role="alert">{pago.error.message}</p>
            <button onClick={() => void pago.refetch()}>Reintentar consulta</button>
          </div>
        ) : !p ? (
          <p role="status">No se encontró un pago para ese código en este local.</p>
        ) : (
          <section className="op-card" aria-labelledby="pago-consultado">
            <h2 id="pago-consultado">{p.codigo}</h2>
            <p>
              Pago {p.estado} · {p.metodo.replaceAll('_', ' ')} · {soles(p.monto)}
            </p>
            <p>Registrado {fecha(p.created_at)}</p>
            <p>
              Pedido {p.estado_pedido} · Sesión {p.sesion_estado}
            </p>
            <p className="op-notice">
              Anular no acredita una devolución. Los fondos siguen en el total esperado hasta su
              conciliación.
            </p>
            {p.estado === 'ANULADO' && (
              <div className="op-success" role="status">
                <strong>Pago anulado; registro conservado.</strong>
                <p>Motivo: {p.motivo_anulacion}</p>
                {p.anulado_at && <p>Anulado {fecha(p.anulado_at)}</p>}
                {p.anulado_por && <p>Administrador registrado: {p.anulado_por}</p>}
              </div>
            )}
            {p.puede_anular ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (confirmado && motivo.trim().length >= 3 && motivo.trim().length <= 400)
                    anular.mutate();
                }}
              >
                <label htmlFor="motivo-anulacion">
                  Motivo de anulación
                  <textarea
                    id="motivo-anulacion"
                    value={motivo}
                    minLength={3}
                    maxLength={400}
                    required
                    onChange={(e) => setMotivo(e.target.value)}
                    disabled={anular.isPending}
                  />
                </label>
                <label className="op-check">
                  <input
                    type="checkbox"
                    checked={confirmado}
                    onChange={(e) => setConfirmado(e.target.checked)}
                    disabled={anular.isPending}
                  />
                  Confirmo la anulación de este pago
                </label>
                <p>Solo se permite antes de iniciar cocina y con la sesión de caja abierta.</p>
                {anular.error && (
                  <p role="alert">
                    {anular.error.message} Consulta el estado actual antes de reintentar.
                  </p>
                )}
                <button
                  type="submit"
                  className="op-primary"
                  disabled={
                    !confirmado || motivo.trim().length < 3 || anular.isPending || pago.isFetching
                  }
                >
                  {anular.isPending ? 'Anulando…' : 'Anular pago con motivo'}
                </button>
              </form>
            ) : (
              p.estado !== 'ANULADO' && <p>Este pago no puede anularse en su estado actual.</p>
            )}
          </section>
        ))}
    </>
  );
}
