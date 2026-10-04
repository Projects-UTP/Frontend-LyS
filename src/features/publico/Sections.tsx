import { Link } from 'react-router-dom';
import { ActionLink, Badge, Section } from '@/shared/ui';
import { categorias, negocio, productosMuestra } from './contenido';

export function Categories() {
  return (
    <Section id="categorias" title="¿Qué se te antoja?" eyebrow="DESCUBRE NUESTRA PROPUESTA">
      <p className="sample-note">Carta de muestra · categorías pendientes de confirmar.</p>
      <div className="category-list">
        {categorias.map((item, index) => (
          <Link key={item} to={`/carta?categoria=${encodeURIComponent(item)}`}>
            <small>0{index + 1}</small>
            <span>{item}</span>
            <span aria-hidden="true">↗</span>
          </Link>
        ))}
      </div>
    </Section>
  );
}
export function Promotions() {
  return (
    <Section id="promociones" title="Más razones para compartir." eyebrow="PROMOCIONES">
      <p className="sample-note">
        Contenido de muestra. Consulta las promociones y precios vigentes por WhatsApp.
      </p>
      <div className="promotion-grid">
        <article className="promotion-feature">
          <div>
            <Badge>Propuesta de muestra</Badge>
            <h3>
              La mesa sabe mejor
              <br />
              cuando estamos juntos.
            </h3>
            <p>Consulta las opciones para compartir con los tuyos.</p>
            <ActionLink to={negocio.whatsapp}>CONSULTAR PROMOCIONES ↗</ActionLink>
          </div>
          <img
            src="/images/brasa-640.webp"
            width="640"
            height="256"
            loading="lazy"
            alt="Imagen referencial de pollo a la brasa y acompañamientos"
          />
        </article>
        <article className="promotion-aside">
          <p className="eyebrow">TU PRÓXIMO PLAN</p>
          <h3>
            Una pausa.
            <br />
            Mucho sabor.
          </h3>
          <p>Escríbenos y descubre qué opciones tenemos hoy.</p>
          <Link to="/contacto">
            Hablemos <span aria-hidden="true">→</span>
          </Link>
        </article>
      </div>
    </Section>
  );
}
export function About() {
  return (
    <Section
      id="nosotros"
      title="Una mesa. Buenas conversaciones. Mucho sabor."
      eyebrow="SOMOS LEÑAS Y SABORES"
    >
      <div className="about-grid">
        <div className="about-mark" aria-hidden="true">
          <img src="/images/isotipo.webp" width="128" height="128" loading="lazy" alt="" />
          <span>
            LA BRASA
            <br />
            NOS REÚNE.
          </span>
        </div>
        <div>
          <p className="large-copy">
            Nuestra propuesta reúne pollo a la brasa, parrillas y sabor peruano en Carabayllo.
          </p>
          <p>
            Ven con la familia, comparte una mesa con amigos o disfruta la brasa donde prefieras.
            Leñas y Sabores es una invitación a reunirnos alrededor de la comida.
          </p>
          <div className="brand-values">
            <span>Brasa</span>
            <span>Sabor peruano</span>
            <span>Para compartir</span>
          </div>
          <Link className="text-link" to="/locales">
            Conoce nuestro local →
          </Link>
        </div>
      </div>
    </Section>
  );
}
export function ProductCard({ product }: { product: (typeof productosMuestra)[number] }) {
  return (
    <article className="product-card">
      <div className={`product-visual ${product.imagen ? '' : 'illustration'}`}>
        {product.imagen ? (
          <img
            src="/images/brasa-640.webp"
            width="640"
            height="256"
            loading="lazy"
            alt="Imagen referencial de pollo a la brasa, papas y ensalada"
          />
        ) : (
          <>
            <img src="/images/isotipo.webp" width="64" height="64" loading="lazy" alt="" />
            <span>La brasa inspira</span>
          </>
        )}
        <Badge>Muestra</Badge>
      </div>
      <div className="product-copy">
        <p className="eyebrow">{product.categoria}</p>
        <h3>{product.nombre}</h3>
        <p>{product.descripcion}</p>
        <a href={negocio.whatsapp} className="text-link">
          Consultar disponibilidad →
        </a>
      </div>
    </article>
  );
}
export function FeaturedProducts() {
  return (
    <Section id="destacados" title="El sabor en primer plano." eyebrow="SELECCIÓN DE MUESTRA">
      <p className="sample-note">
        Presentaciones ilustrativas, sin precios oficiales. La oferta final se confirmará con el
        restaurante.
      </p>
      <div className="product-grid">
        {productosMuestra.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </Section>
  );
}
export function Services() {
  const modes = [
    ['01', 'En nuestro local', 'Una mesa para compartir en Carabayllo.'],
    ['02', 'Delivery propio', 'Consulta cobertura y disponibilidad antes de ordenar.'],
    ['03', 'Recojo en tienda', 'Coordina tu recojo directamente con el restaurante.'],
    ['04', 'Para llevar', 'Disfruta la brasa donde prefieras.'],
  ];
  return (
    <Section id="modalidades" title="Tu mesa, donde tú quieras." eyebrow="FORMAS DE ATENCIÓN">
      <div className="service-grid">
        {modes.map(([number, title, copy]) => (
          <article key={number}>
            <span>{number}</span>
            <h3>{title}</h3>
            <p>{copy}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}
export function LocationSection() {
  const mapUrl =
    'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(negocio.direccion);
  return (
    <Section id="local" title="Nos vemos en Carabayllo." eyebrow="LOCAL Y CONTACTO">
      <div className="location-grid">
        <div>
          <h3>Leñas y Sabores</h3>
          <address>{negocio.direccion}</address>
          <a className="text-link" href={mapUrl}>
            CÓMO LLEGAR ↗
          </a>
        </div>
        <div>
          <p className="eyebrow">HORARIO DE ATENCIÓN</p>
          <p className="hours">{negocio.horario}</p>
          <a href="tel:+51947540597">{negocio.telefono}</a>
          <a href="tel:+51972193346">{negocio.adicional}</a>
          <ActionLink to={negocio.whatsapp}>CONVERSAR POR WHATSAPP ↗</ActionLink>
        </div>
      </div>
    </Section>
  );
}
