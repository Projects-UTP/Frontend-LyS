import { Link, useParams } from 'react-router-dom';
import { useAuth } from '@/features/autenticacion/context';
import { soles } from '@/features/catalogo/api';
import { usePedido } from './api';
const estados: Record<string, string> = {
  PENDIENTE_PAGO: 'Pago pendiente',
  CONFIRMADO: 'Confirmado',
  EN_PREPARACION: 'En preparación',
  LISTO: 'Listo',
  ENTREGADO: 'Entregado',
  FINALIZADO: 'Finalizado',
  ANULADO: 'Anulado',
};
export function Pedido({ confirmacion = false }: { confirmacion?: boolean }) {
  const { codigo = '' } = useParams();
  const auth = useAuth();
  const query = usePedido(codigo);
  const p = query.data;
  if (!/^LYS-[0-9]{6,}$/.test(codigo))
    return (
      <section className="container commerce-section empty-state">
        <h1>Código no válido</h1>
        <Link className="action" to="/carta">
          VOLVER A LA CARTA
        </Link>
      </section>
    );
  if (auth.cargando || query.isPending)
    return (
      <p className="container commerce-state" role="status">
        Consultando tu pedido…
      </p>
    );
  if (query.error)
    return (
      <section className="container commerce-section">
        <h1>Consulta tu pedido</h1>
        <div role="alert">
          <p>{query.error.message}</p>
          <button className="action" onClick={() => void query.refetch()}>
            REINTENTAR
          </button>
        </div>
      </section>
    );
  if (!p)
    return (
      <section className="container commerce-section empty-state">
        <h1>No podemos mostrar este pedido</h1>
        <p>El código no existe o no tienes acceso a su resumen.</p>
        <p>
          Si pediste como invitado, utiliza la pestaña donde lo creaste. El acceso vence a los siete
          días. Si usaste tu cuenta, inicia sesión como propietario.
        </p>
        <Link
          className="action"
          to={`/iniciar-sesion?volver=${encodeURIComponent(`/pedido/${codigo}`)}`}
        >
          INICIAR SESIÓN
        </Link>
        <Link className="text-button" to="/carta">
          Volver a la carta
        </Link>
      </section>
    );
  return (
    <section className="container commerce-section pedido-shell">
      <p className="eyebrow">LEÑAS Y SABORES · TU PEDIDO</p>
      <h1>{confirmacion ? 'Tu pedido está registrado' : 'Seguimiento de tu pedido'}</h1>
      <div className="order-status-row">
        <strong className="order-code">{p.codigo}</strong>
        <span className="order-state">{estados[p.estado_pedido] ?? 'Estado por consultar'}</span>
        <button
          className="text-button"
          disabled={query.isFetching}
          onClick={() => void query.refetch()}
        >
          {query.isFetching ? 'Actualizando…' : 'Actualizar estado'}
        </button>
      </div>
      {p.demostracion && (
        <p className="demo-banner">Pedido de demostración. Productos y precios referenciales.</p>
      )}
      <div className="delivery-note">
        <strong>
          {p.estado_pago === 'PENDIENTE'
            ? 'El pago sigue pendiente'
            : p.estado_pago === 'APROBADO'
              ? 'Pago confirmado por caja'
              : 'Estado del pago: ' + p.estado_pago}
        </strong>
        <p>
          {p.estado_pago === 'PENDIENTE'
            ? 'El método previsto no acredita un cobro ni una transferencia. Confirma las instrucciones con el restaurante.'
            : 'Consulta el historial para conocer el avance del pedido.'}
        </p>
      </div>
      <div className="review-layout">
        <div>
          <h2>Resumen del pedido</h2>
          <ul className="review-items">
            {p.items.map((i) => (
              <li key={i.producto_id}>
                <span>
                  {i.cantidad} × {i.nombre_producto}
                  <small>{soles(i.precio_unitario)} por unidad</small>
                </span>
                <strong>{soles(i.subtotal)}</strong>
              </li>
            ))}
          </ul>
          <h2>{p.modalidad === 'RECOJO_LOCAL' ? 'Recojo en el local' : 'Delivery'}</h2>
          <p>{p.local.nombre}</p>
          <p>{p.local.direccion}</p>
          <p>
            <a href={`tel:${p.local.telefono}`}>Consultar al restaurante</a>
          </p>
          <h2>Método previsto</h2>
          <p>{p.metodo_previsto}</p>
        </div>
        <aside className="order-summary">
          <h2>Importes registrados</h2>
          <dl>
            <dt>Subtotal</dt>
            <dd>{soles(p.subtotal)}</dd>
            <dt>Descuento</dt>
            <dd>{soles(p.descuento)}</dd>
            <dt>Delivery</dt>
            <dd>{p.costo_delivery === null ? 'Por confirmar' : soles(p.costo_delivery)}</dd>
            <dt>Total</dt>
            <dd>{p.total === null ? 'Pendiente' : soles(p.total)}</dd>
          </dl>
          {p.costo_delivery === null && (
            <p>Costo de delivery pendiente de confirmación. Aún no hay un total definitivo.</p>
          )}
        </aside>
      </div>
      {!confirmacion && (
        <section className="order-history">
          <h2>Historial</h2>
          <ol>
            {p.historial.map((e, i) => (
              <li key={`${e.created_at}-${i}`}>
                <strong>
                  {e.accion === 'PEDIDO_CREADO'
                    ? 'Pedido registrado'
                    : (estados[e.estado] ?? 'Pedido actualizado')}
                </strong>
                <time dateTime={e.created_at}>
                  {new Intl.DateTimeFormat('es-PE', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                    timeZone: 'America/Lima',
                  }).format(new Date(e.created_at))}
                </time>
              </li>
            ))}
          </ol>
          <p>
            No se ha estimado un tiempo de entrega. Consulta al local para confirmar disponibilidad
            y atención.
          </p>
        </section>
      )}
      <div className="checkout-actions">
        {confirmacion ? (
          <Link className="action" to={`/pedido/${p.codigo}`}>
            VER SEGUIMIENTO
          </Link>
        ) : (
          <Link className="action action-outline" to={`/pedido/${p.codigo}/confirmacion`}>
            VER RESUMEN
          </Link>
        )}
        <Link className="text-button" to="/carta">
          Volver a la carta
        </Link>
      </div>
    </section>
  );
}
