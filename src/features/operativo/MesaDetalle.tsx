import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCategorias, useProductos, normalizar, soles } from '@/features/catalogo/api';
import { useMesas, useOrdenMesa, rpcOperativo, type Orden } from './api';
import { useOperativo } from './context';
type ItemOrden = { product_id: string; quantity: number; observaciones: string };
export function MesaDetalle() {
  const { id = '' } = useParams(),
    op = useOperativo(),
    mesas = useMesas(),
    query = useOrdenMesa(id),
    cache = useQueryClient();
  const [intento] = useState(() => crypto.randomUUID()),
    [fase, setFase] = useState<'editar' | 'resumen'>('resumen');
  const puedeEditar = op.roles.some((r) => ['MOZO', 'ADMINISTRADOR'].includes(r));
  const mesa = mesas.data?.find((m) => m.id === id),
    orden = query.data;
  const abrir = useMutation({
    mutationFn: () => rpcOperativo<Orden>('abrir_pedido_mesa', { p_mesa: id, p_intento: intento }),
    onSuccess: (p) => {
      cache.setQueryData(['operativo', 'mesa', op.local, op.usuario, id], p);
      setFase('editar');
      void cache.invalidateQueries({ queryKey: ['operativo', 'mesas'] });
      void cache.invalidateQueries({ queryKey: ['operativo', 'ordenes-mesa'] });
    },
  });
  const enviar = useMutation({
    mutationFn: () =>
      rpcOperativo<Orden>('enviar_pedido_caja', { p_id: orden!.id, p_revision: orden!.revision }),
    onSuccess: (p) => {
      cache.setQueryData(['operativo', 'mesa', op.local, op.usuario, id], p);
      void cache.invalidateQueries({ queryKey: ['operativo', 'mesas'] });
      void cache.invalidateQueries({ queryKey: ['operativo', 'ordenes-mesa'] });
    },
  });
  if (!op.roles.some((r) => ['MOZO', 'CAJA', 'ADMINISTRADOR'].includes(r)))
    return (
      <>
        <h1>Sin acceso a mesas</h1>
        <p>Tu rol no permite consultar esta orden.</p>
      </>
    );
  if (mesas.isPending || query.isPending) return <p role="status">Consultando mesa y orden…</p>;
  if (mesas.error || query.error)
    return (
      <>
        <h1>Consultar mesa</h1>
        <p role="alert">{mesas.error?.message ?? query.error?.message}</p>
        <button
          onClick={() => {
            void mesas.refetch();
            void query.refetch();
          }}
        >
          Reintentar
        </button>
      </>
    );
  if (!mesa)
    return (
      <>
        <h1>Mesa no disponible</h1>
        <Link to="/operativo/mesas">Volver al salón</Link>
      </>
    );
  return (
    <>
      <Link to="/operativo/mesas">Volver al salón</Link>
      <div className="op-title">
        <div>
          <p className="op-kicker">{mesa.zona}</p>
          <h1>{mesa.nombre}</h1>
        </div>
        <span className="op-badge">{orden?.mesa?.estado ?? mesa.estado}</span>
      </div>
      {mesa.demostracion && (
        <p className="op-notice">Mesa de demostración. Productos y precios referenciales.</p>
      )}
      {(abrir.error || enviar.error) && (
        <p role="alert">{abrir.error?.message ?? enviar.error?.message}</p>
      )}
      {!orden ? (
        <section className="op-card">
          <h2>Nueva orden</h2>
          <p>Abre una orden para ocupar la mesa y comenzar la toma del pedido.</p>
          {puedeEditar && mesa.estado === 'LIBRE' ? (
            <button
              className="op-primary"
              disabled={abrir.isPending}
              onClick={() => abrir.mutate()}
            >
              Abrir nueva orden
            </button>
          ) : (
            <p>Esta mesa no admite una nueva orden con tu acceso actual.</p>
          )}
        </section>
      ) : (
        <>
          <div className="op-order-heading">
            <strong>{orden.codigo}</strong>
            <span>
              {orden.estado_pedido.replaceAll('_', ' ')} · Pago {orden.estado_pago.toLowerCase()}
            </span>
            <button disabled={query.isFetching} onClick={() => void query.refetch()}>
              Actualizar orden
            </button>
          </div>
          {fase === 'editar' && puedeEditar && orden.estado_pago === 'PENDIENTE' ? (
            <EditorOrden
              key={`${orden.id}-${orden.revision}`}
              orden={orden}
              onGuardado={(p) => {
                cache.setQueryData(['operativo', 'mesa', op.local, op.usuario, id], p);
                setFase('resumen');
                void cache.invalidateQueries({ queryKey: ['operativo', 'ordenes-mesa'] });
              }}
            />
          ) : (
            <section className="op-card">
              <h2>Resumen de orden</h2>
              <p>
                Abierta{' '}
                {new Intl.DateTimeFormat('es-PE', { timeStyle: 'short' }).format(
                  new Date(orden.created_at),
                )}{' '}
                · Responsable: {orden.mozo_id === op.usuario ? 'tú' : 'personal del local'}
              </p>
              <ul className="op-items">
                {orden.items.map((i) => (
                  <li key={i.producto_id}>
                    <div>
                      <strong>
                        {i.cantidad} × {i.nombre_producto}
                      </strong>
                      <p>{soles(i.precio_unitario)} por unidad</p>
                      {i.observaciones && <p className="op-observation">{i.observaciones}</p>}
                    </div>
                    <strong>{soles(i.subtotal)}</strong>
                  </li>
                ))}
              </ul>
              {orden.items.length === 0 && <p>La orden aún no tiene productos.</p>}
              <p className="op-observation">
                {orden.observaciones || 'Sin observaciones de orden'}
              </p>
              <p className="op-total">
                Total del servidor: {orden.total === null ? 'Pendiente' : soles(orden.total)}
              </p>
              {puedeEditar &&
                orden.estado_pago === 'PENDIENTE' &&
                ['BORRADOR', 'PENDIENTE_PAGO'].includes(orden.estado_pedido) && (
                  <div className="op-actions">
                    <button onClick={() => setFase('editar')}>
                      Editar productos y observaciones
                    </button>
                    {orden.estado_pedido === 'BORRADOR' && (
                      <button
                        className="op-primary"
                        disabled={!orden.items.length || enviar.isPending}
                        onClick={() => enviar.mutate()}
                      >
                        Confirmar y enviar a caja
                      </button>
                    )}
                  </div>
                )}
              {orden.estado_pedido === 'PENDIENTE_PAGO' && (
                <p className="op-notice">
                  Orden enviada a caja. El pago permanece pendiente y todavía no se envía a cocina.
                </p>
              )}
              {orden.estado_pago !== 'PENDIENTE' && (
                <p>Los productos de una orden pagada no pueden editarse libremente.</p>
              )}
            </section>
          )}
        </>
      )}
    </>
  );
}
function EditorOrden({ orden, onGuardado }: { orden: Orden; onGuardado: (p: Orden) => void }) {
  const productos = useProductos(),
    categorias = useCategorias();
  const [buscar, setBuscar] = useState(''),
    [categoria, setCategoria] = useState('');
  const [items, setItems] = useState<ItemOrden[]>(() =>
    orden.items.map((i) => ({
      product_id: i.producto_id,
      quantity: i.cantidad,
      observaciones: i.observaciones,
    })),
  );
  const [observaciones, setObservaciones] = useState(orden.observaciones),
    [motivo, setMotivo] = useState(''),
    [error, setError] = useState('');
  const guardar = useMutation({
    mutationFn: () =>
      rpcOperativo<Orden>('editar_pedido_mesa', {
        p_id: orden.id,
        p_revision: orden.revision,
        p_items: items,
        p_observaciones: observaciones,
        p_motivo: motivo.trim() || 'Toma inicial de productos',
      }),
    onSuccess: onGuardado,
  });
  const disponibles = (productos.data ?? []).filter(
    (p) =>
      p.disponible &&
      (!categoria || p.categoria_id === categoria) &&
      normalizar(p.nombre).includes(normalizar(buscar)),
  );
  function agregar(id: string) {
    const viejo = items.find((i) => i.product_id === id);
    if (viejo?.quantity === 50 || (!viejo && items.length === 30)) {
      setError('Límite: 50 unidades por producto y 30 productos distintos.');
      return;
    }
    setError('');
    setItems((v) =>
      viejo
        ? v.map((i) => (i.product_id === id ? { ...i, quantity: i.quantity + 1 } : i))
        : [...v, { product_id: id, quantity: 1, observaciones: '' }],
    );
  }
  return (
    <form
      className="op-editor"
      onSubmit={(e) => {
        e.preventDefault();
        if (!items.length) {
          setError('Agrega al menos un producto antes de guardar.');
          return;
        }
        if (orden.estado_pedido === 'PENDIENTE_PAGO' && !motivo.trim()) {
          setError('Indica el motivo de la corrección.');
          return;
        }
        setError('');
        guardar.mutate();
      }}
    >
      <section className="op-card">
        <h2>Seleccionar productos</h2>
        <div className="op-filters">
          <label htmlFor="buscar-producto">
            Buscar producto
            <input
              id="buscar-producto"
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
            />
          </label>
          <label htmlFor="categoria-producto">
            Categoría
            <select
              id="categoria-producto"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              <option value="">Todas</option>
              {categorias.data?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </label>
        </div>
        {productos.isPending ? (
          <p role="status">Cargando productos…</p>
        ) : productos.error ? (
          <p role="alert">{productos.error.message}</p>
        ) : (
          <div className="op-products">
            {disponibles.map((p) => (
              <button
                type="button"
                key={p.id}
                onClick={() => agregar(p.id)}
                aria-label={`Añadir ${p.nombre}`}
              >
                <strong>{p.nombre}</strong>
                <span>{soles(p.precio_base)}</span>
              </button>
            ))}
          </div>
        )}
        {!productos.isPending && !disponibles.length && (
          <p>No hay productos disponibles con este filtro.</p>
        )}
      </section>
      <section className="op-card">
        <h2>Productos de la orden</h2>
        {(error || guardar.error) && <p role="alert">{error || guardar.error?.message}</p>}
        {items.map((i) => {
          const nombre =
            productos.data?.find((p) => p.id === i.product_id)?.nombre ??
            orden.items.find((p) => p.producto_id === i.product_id)?.nombre_producto ??
            'Producto';
          return (
            <div key={i.product_id} className="op-edit-item">
              <strong>{nombre}</strong>
              <div className="op-quantity">
                <button
                  type="button"
                  aria-label={`Reducir ${nombre}`}
                  disabled={i.quantity <= 1}
                  onClick={() =>
                    setItems((v) =>
                      v.map((x) =>
                        x.product_id === i.product_id ? { ...x, quantity: x.quantity - 1 } : x,
                      ),
                    )
                  }
                >
                  −
                </button>
                <output aria-label={`Cantidad de ${nombre}`}>{i.quantity}</output>
                <button
                  type="button"
                  aria-label={`Incrementar ${nombre}`}
                  disabled={i.quantity >= 50}
                  onClick={() => agregar(i.product_id)}
                >
                  +
                </button>
                <button
                  type="button"
                  aria-label={`Quitar ${nombre}`}
                  onClick={() => setItems((v) => v.filter((x) => x.product_id !== i.product_id))}
                >
                  Quitar
                </button>
              </div>
              <label htmlFor={`obs-${i.product_id}`}>
                Observaciones de {nombre}
                <input
                  id={`obs-${i.product_id}`}
                  maxLength={240}
                  value={i.observaciones}
                  onChange={(e) =>
                    setItems((v) =>
                      v.map((x) =>
                        x.product_id === i.product_id ? { ...x, observaciones: e.target.value } : x,
                      ),
                    )
                  }
                />
              </label>
            </div>
          );
        })}
        <label htmlFor="obs-orden">
          Observaciones del pedido
          <textarea
            id="obs-orden"
            maxLength={400}
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            rows={3}
          />
        </label>
        <p>{observaciones.length}/400 caracteres</p>
        {orden.items.length > 0 && (
          <label htmlFor="motivo-correccion">
            Motivo de la corrección
            <input
              id="motivo-correccion"
              maxLength={400}
              required={orden.estado_pedido === 'PENDIENTE_PAGO'}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            />
          </label>
        )}
        <p>El total se calcula y valida en el servidor al guardar. Guardar no acredita un pago.</p>
        <button className="op-primary" disabled={guardar.isPending || !items.length} type="submit">
          {guardar.isPending ? 'Guardando…' : 'Guardar y revisar orden'}
        </button>
      </section>
    </form>
  );
}
