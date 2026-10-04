import { Link } from 'react-router-dom';
import { useCarrito } from './store';
import { soles, useProductos } from '@/features/catalogo/api';
import { FotoProducto } from '@/features/catalogo/Catalogo';
export function Carrito() {
  const cart = useCarrito();
  const productos = useProductos();
  const lineas = cart.items.map((i) => ({
    ...i,
    producto: productos.data?.find((p) => p.id === i.product_id),
  }));
  const valido = lineas.every((i) => i.producto?.disponible);
  const subtotal =
    lineas.reduce((s, i) => s + Math.round((i.producto?.precio_base ?? 0) * 100) * i.quantity, 0) /
    100;
  return (
    <section className="container commerce-section">
      <div className="section-top">
        <div>
          <p className="eyebrow">TU PRÓXIMO ANTOJO</p>
          <h1>Tu carrito</h1>
        </div>
        <Link to="/carta" className="text-button">
          Seguir explorando la carta
        </Link>
      </div>
      <p className="demo-banner">
        Productos y precios de demostración. El servidor confirma los importes al revisar tu pedido.
      </p>
      <p role="status" className="cart-feedback">
        {cart.mensaje}
      </p>
      {!cart.items.length ? (
        <div className="empty-state">
          <h2>Tu mesa está por llenarse</h2>
          <p>Elige algo de la carta para comenzar.</p>
          <Link className="action" to="/carta">
            VER CARTA
          </Link>
        </div>
      ) : productos.isPending ? (
        <p role="status">Cargando los productos de tu carrito…</p>
      ) : productos.error ? (
        <div role="alert">
          <p>{productos.error.message}</p>
          <button className="action" onClick={() => void productos.refetch()}>
            REINTENTAR
          </button>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-lines">
            {lineas.map((i) => (
              <article key={i.product_id} className="cart-line">
                {i.producto && (
                  <Link to={`/carta/${i.producto.slug}`} className="cart-photo">
                    <FotoProducto producto={i.producto} />
                  </Link>
                )}
                <div>
                  <h2>{i.producto?.nombre ?? 'Producto retirado'}</h2>
                  <p>{i.producto ? soles(i.producto.precio_base) : 'Ya no está en la carta'}</p>
                  {!i.producto?.disponible && (
                    <p className="field-error">No disponible. Retíralo para continuar.</p>
                  )}
                  <div
                    className="quantity-controls"
                    role="group"
                    aria-label={`Cantidad de ${i.producto?.nombre ?? 'producto retirado'}`}
                  >
                    <button
                      aria-label={`Reducir ${i.producto?.nombre ?? 'producto'}`}
                      disabled={i.quantity === 1}
                      onClick={() => cart.cantidad(i.product_id, i.quantity - 1)}
                    >
                      −
                    </button>
                    <span aria-live="polite">{i.quantity}</span>
                    <button
                      aria-label={`Aumentar ${i.producto?.nombre ?? 'producto'}`}
                      disabled={i.quantity === 50}
                      onClick={() => cart.cantidad(i.product_id, i.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="text-button"
                    onClick={() => cart.quitar(i.product_id)}
                    aria-label={`Eliminar ${i.producto?.nombre ?? 'producto'}`}
                  >
                    Eliminar
                  </button>
                </div>
                <strong>
                  {i.producto
                    ? soles((Math.round(i.producto.precio_base * 100) * i.quantity) / 100)
                    : '—'}
                </strong>
              </article>
            ))}
          </div>
          <aside className="order-summary">
            <h2>Resumen</h2>
            <dl>
              <dt>Productos</dt>
              <dd>{cart.items.reduce((s, i) => s + i.quantity, 0)}</dd>
              <dt>Subtotal referencial</dt>
              <dd>{soles(subtotal)}</dd>
              <dt>Delivery</dt>
              <dd>Por confirmar</dd>
            </dl>
            <p>La modalidad y los importes definitivos se revisan en el checkout.</p>
            {valido ? (
              <Link className="action" to="/checkout">
                CONTINUAR
              </Link>
            ) : (
              <p role="alert">Retira los productos no disponibles para continuar.</p>
            )}
          </aside>
        </div>
      )}
    </section>
  );
}
