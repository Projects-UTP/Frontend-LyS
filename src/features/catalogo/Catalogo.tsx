import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Container, ActionLink } from '@/shared/ui';
import { BaksoText } from '@/shared/ui/BaksoText';
import { negocio } from '@/features/publico/contenido';
import { useSeo } from '@/shared/lib/seo';
import { normalizar, soles, useCategorias, useProducto, useProductos, type Producto } from './api';

export function FotoProducto({ producto, eager = false }: { producto: Producto; eager?: boolean }) {
  const url = producto.imagen_url ?? '/images/imagotipo.webp';
  const cloud = url.startsWith('https://res.cloudinary.com/') && url.includes('/upload/');
  const variant = (width: number) => url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
  return (
    <img
      src={cloud ? variant(800) : url}
      srcSet={cloud ? `${variant(400)} 400w, ${variant(800)} 800w` : undefined}
      sizes="(max-width: 650px) 100vw, 33vw"
      alt={`${producto.nombre} · fotografía referencial`}
      width="800"
      height="800"
      loading={eager ? 'eager' : 'lazy'}
    />
  );
}
function Estado({
  loading,
  error,
  retry,
}: {
  loading: boolean;
  error: Error | null;
  retry: () => void;
}) {
  if (loading)
    return (
      <p className="commerce-state" role="status">
        Preparando la carta…
      </p>
    );
  if (error)
    return (
      <div className="commerce-state" role="alert">
        <p>{error.message}</p>
        <button className="action" onClick={retry}>
          REINTENTAR
        </button>
      </div>
    );
  return null;
}
export function Carta() {
  useSeo(
    'Carta de demostración',
    'Explora categorías, productos y precios referenciales de Leñas y Sabores en Carabayllo.',
  );
  const categories = useCategorias();
  const products = useProductos();
  const [params, setParams] = useSearchParams();
  const category = params.get('categoria') ?? '';
  const search = params.get('buscar') ?? '';
  const filtered =
    products.data?.filter(
      (p) =>
        (!category ||
          categories.data?.some(
            (c) => c.id === p.categoria_id && (c.slug === category || c.nombre === category),
          )) &&
        normalizar(p.nombre).includes(normalizar(search)),
    ) ?? [];
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };
  return (
    <>
      <div className="page-heading">
        <Container>
          <p className="eyebrow">LEÑAS Y SABORES · CARTA</p>
          <h1>
            <BaksoText text="Nuestra carta de muestra." />
          </h1>
          <p>Elige tu próximo antojo.</p>
        </Container>
      </div>
      <Container className="commerce-section">
        <p className="demo-banner">
          Carta de demostración: productos, fotografías y precios referenciales. No representa una
          oferta comercial vigente.
        </p>
        <div className="catalog-tools">
          <label htmlFor="buscar-carta">
            Buscar en la carta
            <input
              id="buscar-carta"
              type="search"
              value={search}
              onChange={(e) => update('buscar', e.target.value)}
              placeholder="¿Pollo o anticuchos?"
            />
          </label>
          <button className="text-button" onClick={() => update('buscar', '')} disabled={!search}>
            Limpiar búsqueda
          </button>
        </div>
        <nav className="category-filters" aria-label="Filtrar por categoría">
          <Link
            to={search ? `/carta?buscar=${encodeURIComponent(search)}` : '/carta'}
            aria-current={!category ? 'page' : undefined}
          >
            Ver todas
          </Link>
          {categories.data?.map((c) => (
            <button
              key={c.id}
              aria-pressed={category === c.slug || category === c.nombre}
              onClick={() => update('categoria', c.slug)}
            >
              {c.nombre}
            </button>
          ))}
        </nav>
        <Estado
          loading={products.isPending || categories.isPending}
          error={products.error || categories.error}
          retry={() => {
            void products.refetch();
            void categories.refetch();
          }}
        />
        {!products.isPending && !categories.isPending && !products.error && !categories.error && (
          <>
            <p role="status" className="result-count">
              {filtered.length} {filtered.length === 1 ? 'producto' : 'productos'}
            </p>
            {filtered.length ? (
              <div className="product-grid catalog-grid">
                {filtered.map((p) => (
                  <article className="product-card catalog-card" key={p.id}>
                    <Link className="product-visual" to={`/carta/${p.slug}`}>
                      <FotoProducto producto={p} />
                      <span className="badge">Demostración</span>
                    </Link>
                    <div className="product-copy">
                      <p className="catalog-category">
                        {categories.data?.find((c) => c.id === p.categoria_id)?.nombre}
                      </p>
                      <h2>
                        <Link to={`/carta/${p.slug}`}>{p.nombre}</Link>
                      </h2>
                      <p>{p.descripcion}</p>
                      <div className="price-row">
                        <span className="price">{soles(p.precio_base)}</span>
                        <small>{p.disponible ? 'Disponible · demo' : 'No disponible'}</small>
                      </div>
                      <ActionLink to={`/carta/${p.slug}`}>VER PRODUCTO</ActionLink>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h2>Estamos preparando esta selección.</h2>
                <p>No encontramos productos. Prueba otra búsqueda o categoría.</p>
                <ActionLink to="/carta">VER TODA LA CARTA</ActionLink>
              </div>
            )}
          </>
        )}
      </Container>
    </>
  );
}
export function DetalleProducto() {
  const { slug = '' } = useParams();
  const query = useProducto(slug);
  const categories = useCategorias();
  const p = query.data;
  useSeo(
    p?.nombre ?? 'Detalle de producto',
    p?.descripcion ?? 'Consulta la carta de demostración.',
  );
  return (
    <Container className="commerce-section">
      <nav className="breadcrumbs" aria-label="Ruta de navegación">
        <Link to="/">Inicio</Link> / <Link to="/carta">Carta</Link> /{' '}
        <span>{p?.nombre ?? 'Producto'}</span>
      </nav>
      <Estado loading={query.isPending} error={query.error} retry={() => void query.refetch()} />
      {!query.isPending &&
        !query.error &&
        (p ? (
          <>
            <p className="demo-banner">
              Producto y precio de demostración · fotografía referencial.
            </p>
            <div className="product-detail">
              <div className="detail-photo">
                <FotoProducto producto={p} eager />
              </div>
              <div>
                <p className="eyebrow">
                  {categories.data?.find((c) => c.id === p.categoria_id)?.nombre}
                </p>
                <h1>{p.nombre}</h1>
                <p>{p.descripcion}</p>
                <p className="price">{soles(p.precio_base)}</p>
                <p>{p.disponible ? 'Disponible para demostración' : 'No disponible actualmente'}</p>
                <ActionLink to={negocio.whatsapp}>CONSULTAR AL RESTAURANTE</ActionLink>
                <p className="muted">Confirma la carta vigente con el restaurante.</p>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <h1>Producto no encontrado</h1>
            <p>Puede haber cambiado o ya no estar disponible.</p>
            <ActionLink to="/carta">VOLVER A LA CARTA</ActionLink>
          </div>
        ))}
    </Container>
  );
}
