import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { soles } from '@/features/catalogo/api';
import { useOperativo } from './context';
import {
  useCaja,
  useColaPagos,
  useOrdenOperativa,
  rpcOperativo,
  type SesionCaja,
  type Orden,
  type MetodoPago,
  type PagoConfirmado,
} from './api';
import { centimos, decimalMonetario, intentoCobro } from './moneda';
const metodos: MetodoPago[] = ['EFECTIVO', 'YAPE', 'PLIN', 'TARJETA_POS'];
const nombres: Record<MetodoPago, string> = {
  EFECTIVO: 'Efectivo',
  YAPE: 'Yape',
  PLIN: 'Plin',
  TARJETA_POS: 'Tarjeta POS',
};
export function Caja() {
  const op = useOperativo(),
    sesion = useCaja(),
    cola = useColaPagos(),
    cache = useQueryClient();
  const [seleccion, setSeleccion] = useState(''),
    [resultado, setResultado] = useState<PagoConfirmado | null>(null),
    [cerrando, setCerrando] = useState(false),
    [confirmarCierre, setConfirmarCierre] = useState(false);
  const s = sesion.data;
  const cerrar = useMutation({
    mutationFn: () =>
      rpcOperativo<SesionCaja>('cerrar_caja', { p_sesion: s!.id, p_revision: s!.revision }),
    onSuccess: (r) => {
      cache.setQueryData(['operativo', 'caja', op.local, op.usuario], r);
      setCerrando(false);
      setConfirmarCierre(false);
    },
  });
  if (!op.roles.some((r) => ['CAJA', 'ADMINISTRADOR'].includes(r)))
    return (
      <>
        <h1>Sin acceso a caja</h1>
        <p>Tu rol no permite registrar cobros ni cerrar sesiones.</p>
      </>
    );
  return (
    <>
      <div className="op-title">
        <div>
          <p className="op-kicker">COBRO Y TURNO</p>
          <h1>Caja del local</h1>
        </div>
        <button
          disabled={sesion.isFetching || cola.isFetching}
          onClick={() => {
            void sesion.refetch();
            void cola.refetch();
          }}
        >
          Actualizar caja
        </button>
      </div>
      {resultado && (
        <div className="op-success" role="status">
          <strong>Pago registrado: {resultado.estado}</strong>
          <p>
            Importe {soles(resultado.monto)} · Vuelto confirmado {soles(resultado.vuelto)}
          </p>
        </div>
      )}
      {sesion.isPending ? (
        <p role="status">Consultando sesión de caja…</p>
      ) : sesion.error ? (
        <p role="alert">{sesion.error.message}</p>
      ) : s?.estado === 'ABIERTA' ? (
        <section className="op-card">
          <div className="op-title">
            <h2>Sesión abierta</h2>
            <button onClick={() => setCerrando((v) => !v)}>
              {cerrando ? 'Volver a cobros' : 'Preparar cierre'}
            </button>
          </div>
          <ResumenCaja sesion={s} />
          {cerrando && (
            <>
              <h3>Cierre básico</h3>
              <p>
                Revisa los importes registrados. El arqueo físico y los movimientos manuales
                requieren conciliación fuera de esta pantalla.
              </p>
              <label className="op-check">
                <input
                  type="checkbox"
                  checked={confirmarCierre}
                  onChange={(e) => setConfirmarCierre(e.target.checked)}
                />
                Confirmo el cierre de esta sesión
              </label>
              {cerrar.error && <p role="alert">{cerrar.error.message}</p>}
              <button
                className="op-primary"
                disabled={!confirmarCierre || cerrar.isPending}
                onClick={() => cerrar.mutate()}
              >
                Confirmar cierre de caja
              </button>
            </>
          )}
        </section>
      ) : (
        <>
          {s && (
            <section className="op-card">
              <h2>Último cierre</h2>
              <p>
                Sesión cerrada. Resumen conservado al{' '}
                {new Intl.DateTimeFormat('es-PE', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                }).format(new Date(s.closed_at!))}
                .
              </p>
              <ResumenCaja sesion={s} />
            </section>
          )}
          <AbrirCaja
            onAbierta={(r) => cache.setQueryData(['operativo', 'caja', op.local, op.usuario], r)}
          />
        </>
      )}
      {!cerrando && (
        <div className="op-cash-layout">
          <section className="op-card">
            <h2>Pendientes de pago</h2>
            <p>Ordenados por antigüedad. Verifica el detalle antes de registrar el cobro.</p>
            {cola.isPending ? (
              <p role="status">Cargando pendientes…</p>
            ) : cola.error ? (
              <p role="alert">{cola.error.message}</p>
            ) : !cola.data?.length ? (
              <p>No hay pedidos pendientes de pago.</p>
            ) : (
              <ul className="op-payment-queue">
                {cola.data.map((p) => (
                  <li key={p.id}>
                    <div>
                      <strong>{p.codigo}</strong>
                      <p>
                        {p.mesa?.nombre ?? p.modalidad.replaceAll('_', ' ')} ·{' '}
                        {new Intl.DateTimeFormat('es-PE', { timeStyle: 'short' }).format(
                          new Date(p.created_at),
                        )}
                      </p>
                      <p>
                        Mozo: {p.mozo_nombre || (p.mozo_id ? 'personal asignado' : 'pedido web')} ·{' '}
                        {p.total === null ? 'Total pendiente' : soles(p.total)}
                      </p>
                    </div>
                    <button
                      aria-label={`Cobrar ${p.codigo}`}
                      onClick={() => {
                        setSeleccion(p.id);
                        setResultado(null);
                      }}
                    >
                      Revisar cobro
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
          {seleccion ? (
            <CobrarOrden
              key={seleccion}
              id={seleccion}
              sesion={s?.estado === 'ABIERTA' ? s : null}
              cliente={cola.data?.find((p) => p.id === seleccion)?.cliente ?? null}
              onPagado={(r) => {
                setResultado(r);
                setSeleccion('');
                cache.setQueryData(
                  ['operativo', 'cola-pagos', op.local, op.usuario],
                  (lista: Orden[] | undefined) => lista?.filter((p) => p.id !== seleccion),
                );
                void cache.invalidateQueries({ queryKey: ['operativo', 'caja'] });
                void cache.invalidateQueries({ queryKey: ['operativo', 'mesas'] });
                void cache.invalidateQueries({ queryKey: ['operativo', 'ordenes-mesa'] });
              }}
            />
          ) : (
            <section className="op-card">
              <h2>Revisar y cobrar</h2>
              <p>
                Selecciona un pedido pendiente para consultar productos e importes actuales del
                servidor.
              </p>
            </section>
          )}
        </div>
      )}
    </>
  );
}
function ResumenCaja({ sesion: s }: { sesion: SesionCaja }) {
  return (
    <>
      <p>
        Abierta{' '}
        {new Intl.DateTimeFormat('es-PE', {
          timeZone: 'America/Lima',
          dateStyle: 'short',
          timeStyle: 'short',
        }).format(new Date(s.opened_at))}
      </p>
      <dl className="op-money-summary">
        <dt>Monto inicial</dt>
        <dd>{soles(s.monto_inicial)}</dd>
        {metodos.map((m) => (
          <div key={m}>
            <dt>Ventas {nombres[m]}</dt>
            <dd>{soles(s.ventas[m] ?? 0)}</dd>
          </div>
        ))}
        <dt>Total ventas aprobadas</dt>
        <dd>{soles(s.total_ventas)}</dd>
        <dt>Efectivo esperado en caja</dt>
        <dd>{soles(s.efectivo_esperado)}</dd>
        <dt>Total esperado · todos los métodos</dt>
        <dd>{soles(s.total_esperado)}</dd>
      </dl>
      {s.fondos_anulados > 0 && (
        <p className="op-notice">
          Fondos de pagos anulados: {soles(s.fondos_anulados)}. Anular no acredita una devolución;
          concilia estos fondos. El efectivo recibido sigue en el esperado.
        </p>
      )}
    </>
  );
}
function AbrirCaja({ onAbierta }: { onAbierta: (s: SesionCaja) => void }) {
  const op = useOperativo(),
    [monto, setMonto] = useState(''),
    [error, setError] = useState(''),
    [intento] = useState(() => crypto.randomUUID());
  const abrir = useMutation({
    mutationFn: () =>
      rpcOperativo<SesionCaja>('abrir_caja', {
        p_local: op.local,
        p_monto: decimalMonetario(centimos(monto)!),
        p_intento: intento,
      }),
    onSuccess: onAbierta,
  });
  return (
    <form
      className="op-card"
      onSubmit={(e) => {
        e.preventDefault();
        if (centimos(monto) === null) {
          setError('Escribe un monto inicial válido con hasta dos decimales.');
          return;
        }
        setError('');
        abrir.mutate();
      }}
    >
      <h2>Abrir sesión de caja</h2>
      <p>Registra el efectivo inicial del turno. No se mezclan sesiones de distintos cajeros.</p>
      <label htmlFor="monto-inicial">
        Monto inicial (S/)
        <input
          id="monto-inicial"
          inputMode="decimal"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          required
        />
      </label>
      {(error || abrir.error) && <p role="alert">{error || abrir.error?.message}</p>}
      <button className="op-primary" type="submit" disabled={abrir.isPending}>
        Abrir caja
      </button>
    </form>
  );
}
function CobrarOrden({
  id,
  sesion,
  cliente,
  onPagado,
}: {
  id: string;
  sesion: SesionCaja | null | undefined;
  cliente: string | null;
  onPagado: (r: PagoConfirmado) => void;
}) {
  const op = useOperativo(),
    query = useOrdenOperativa(id),
    p = query.data;
  const [metodo, setMetodo] = useState<MetodoPago>('EFECTIVO'),
    [recibido, setRecibido] = useState(''),
    [referencia, setReferencia] = useState(''),
    [confirmado, setConfirmado] = useState(false),
    [error, setError] = useState('');
  const recibidoCentimos = centimos(recibido),
    totalCentimos = p?.total === null || p?.total === undefined ? null : Math.round(p.total * 100),
    vuelto =
      totalCentimos !== null && recibidoCentimos !== null ? recibidoCentimos - totalCentimos : null;
  const guardar = useMutation({
    mutationFn: async () => {
      const args = {
        p_id: id,
        p_revision: p!.revision,
        p_sesion: sesion!.id,
        p_metodo: metodo,
        p_recibido: metodo === 'EFECTIVO' ? decimalMonetario(recibidoCentimos!) : null,
        p_referencia: referencia.trim() || null,
        p_confirmado: confirmado,
      };
      const intento = await intentoCobro({ usuario: op.usuario, ...args });
      return rpcOperativo<PagoConfirmado>('registrar_pago', { ...args, p_intento: intento });
    },
    onSuccess: onPagado,
  });
  if (query.isPending)
    return (
      <section className="op-card">
        <h2>Detalle de cobro</h2>
        <p role="status">Consultando importes actuales…</p>
      </section>
    );
  if (query.error || !p)
    return (
      <section className="op-card">
        <h2>Detalle de cobro</h2>
        <p role="alert">{query.error?.message ?? 'La orden no está disponible.'}</p>
        <button onClick={() => void query.refetch()}>Consultar estado actual</button>
      </section>
    );
  return (
    <form
      className="op-card"
      onSubmit={(e) => {
        e.preventDefault();
        if (!sesion) {
          setError('Abre una sesión de caja antes de cobrar.');
          return;
        }
        if (
          !confirmado ||
          totalCentimos === null ||
          p.estado_pago !== 'PENDIENTE' ||
          p.estado_pedido !== 'PENDIENTE_PAGO' ||
          (metodo === 'EFECTIVO' && (vuelto === null || vuelto < 0))
        ) {
          setError('Verifica el estado, el total, el monto y la confirmación del pago.');
          return;
        }
        setError('');
        guardar.mutate();
      }}
    >
      <div className="op-title">
        <h2>{p.codigo}</h2>
        <button type="button" disabled={query.isFetching} onClick={() => void query.refetch()}>
          Consultar estado actual
        </button>
      </div>
      <p>
        {p.mesa?.nombre ?? p.modalidad.replaceAll('_', ' ')} · Pago {p.estado_pago.toLowerCase()}
      </p>
      {(p.cliente || cliente) && <p>Cliente: {p.cliente || cliente}</p>}
      {p.metodo_previsto && (
        <p>
          Método previsto: {p.metodo_previsto.replaceAll('_', ' ')}. Confirma el método recibido.
        </p>
      )}
      {p.demostracion && (
        <p className="op-notice">
          Orden y precios de demostración. Verifica el entorno antes de registrar un cobro.
        </p>
      )}
      <ul className="op-items">
        {p.items.map((i) => (
          <li key={i.producto_id}>
            <div>
              <strong>
                {i.cantidad} × {i.nombre_producto}
              </strong>
              <p>{soles(i.precio_unitario)} por unidad</p>
              {i.observaciones && <p>{i.observaciones}</p>}
            </div>
            <strong>{soles(i.subtotal)}</strong>
          </li>
        ))}
      </ul>
      <p>Subtotal: {soles(p.subtotal)}</p>
      <p className="op-total">
        Total del servidor: {p.total === null ? 'Pendiente de confirmación' : soles(p.total)}
      </p>
      {p.total === null && (
        <p className="op-notice">
          La tarifa de delivery no está confirmada. No se puede cobrar este pedido.
        </p>
      )}
      {!sesion && (
        <p className="op-notice">Necesitas una sesión de caja abierta para registrar el pago.</p>
      )}
      <label htmlFor="metodo-pago">
        Método de pago
        <select
          id="metodo-pago"
          value={metodo}
          onChange={(e) => {
            setMetodo(e.target.value as MetodoPago);
            setConfirmado(false);
          }}
          disabled={guardar.isPending}
        >
          {metodos.map((m) => (
            <option key={m} value={m}>
              {nombres[m]}
            </option>
          ))}
        </select>
      </label>
      {metodo === 'EFECTIVO' ? (
        <>
          <label htmlFor="recibido-pago">
            Monto recibido (S/)
            <input
              id="recibido-pago"
              inputMode="decimal"
              value={recibido}
              onChange={(e) => setRecibido(e.target.value)}
              disabled={guardar.isPending}
              required
            />
          </label>
          <p className="op-change">
            {vuelto === null
              ? 'Escribe el efectivo recibido.'
              : vuelto < 0
                ? `Faltan ${soles(-vuelto / 100)}`
                : `Vuelto: ${soles(vuelto / 100)}`}
          </p>
        </>
      ) : (
        <p className="op-notice">
          Verifica {nombres[metodo]} fuera de la aplicación antes de confirmar. No hay validación
          automática de transferencia o POS.
        </p>
      )}
      <label htmlFor="referencia-pago">
        Referencia de operación (opcional)
        <input
          id="referencia-pago"
          maxLength={120}
          value={referencia}
          onChange={(e) => setReferencia(e.target.value)}
          disabled={guardar.isPending}
        />
      </label>
      <p>No ingreses número completo de tarjeta, CVV ni datos sensibles.</p>
      <label className="op-check">
        <input
          type="checkbox"
          checked={confirmado}
          onChange={(e) => setConfirmado(e.target.checked)}
          disabled={guardar.isPending}
        />
        Confirmo que recibí y verifiqué este pago
      </label>
      {(error || guardar.error) && (
        <p role="alert">
          {error || guardar.error?.message} Consulta el estado antes de cambiar un intento con
          resultado incierto.
        </p>
      )}
      <button
        className="op-primary"
        type="submit"
        disabled={
          guardar.isPending ||
          query.isFetching ||
          !sesion ||
          !confirmado ||
          totalCentimos === null ||
          p.estado_pago !== 'PENDIENTE' ||
          (metodo === 'EFECTIVO' && (vuelto === null || vuelto < 0))
        }
      >
        {guardar.isPending ? 'Registrando pago…' : 'Registrar pago confirmado'}
      </button>
    </form>
  );
}
