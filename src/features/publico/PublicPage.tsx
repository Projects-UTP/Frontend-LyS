import { Link, useSearchParams } from 'react-router-dom';
import { Container, ActionLink } from '@/shared/ui';
import { About, Promotions, LocationSection, ProductCard } from './Sections';
import { negocio, productosMuestra } from './contenido';
import { BaksoText } from '@/shared/ui/BaksoText';
const titles = {
  carta: 'Nuestra carta de muestra.',
  promociones: 'Un buen plan empieza aquí.',
  nosotros: 'La brasa nos reúne.',
  locales: 'Te esperamos en Carabayllo.',
  contacto: 'Conversemos.',
};
export function PublicPage({ page }: { page: keyof typeof titles }) {
  const [params] = useSearchParams();
  const category = params.get('categoria');
  const products = productosMuestra.filter((item) => !category || item.categoria === category);
  return (
    <>
      <div className="page-heading">
        <Container>
          <p className="eyebrow">LEÑAS Y SABORES · {page.toUpperCase()}</p>
          <h1>
            <BaksoText text={titles[page]} />
          </h1>
        </Container>
      </div>
      {page === 'carta' ? (
        <Container className="catalog">
          <p className="sample-note">
            Catálogo ilustrativo. Productos, disponibilidad y precios pendientes de confirmación.
          </p>
          {category && (
            <p className="filter-note">
              Categoría: {category} · <Link to="/carta">Ver todas</Link>
            </p>
          )}
          {products.length ? (
            <div className="product-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h2>Estamos preparando esta selección.</h2>
              <p>Aún no hay productos de muestra en esta categoría.</p>
              <ActionLink to={negocio.whatsapp}>CONSULTAR POR WHATSAPP</ActionLink>
            </div>
          )}
        </Container>
      ) : page === 'promociones' ? (
        <Promotions />
      ) : page === 'nosotros' ? (
        <About />
      ) : (
        <LocationSection />
      )}
    </>
  );
}
