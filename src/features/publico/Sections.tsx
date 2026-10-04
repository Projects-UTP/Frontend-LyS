import { Link } from 'react-router-dom';
import { ActionLink, Badge, Section, Container } from '@/shared/ui';
import { categoriasInicio, negocio, productosMuestra } from './contenido';
import { Icon } from './Icon';
import { BaksoText } from '@/shared/ui/BaksoText';

export function Categories() {
  return (
    <section className="discovery-band" aria-labelledby="categories-title">
      <Container className="editorial-row">
        <div className="section-intro">
          <p className="eyebrow">NUESTROS IMPERDIBLES</p>
          <h2 id="categories-title">
            <BaksoText text="Lo mejor de" />
            <br />{' '}
            <em>
              <BaksoText text="nuestra carta." />
            </em>
          </h2>
          <p>Explora nuestra propuesta de brasa, parrillas y acompañamientos.</p>
          <Link className="text-link" to="/carta">
            Ver toda la carta <Icon name="arrow" />
          </Link>
          <small>Categorías de muestra</small>
        </div>
        <div className="category-gallery">
          {categoriasInicio.map((item) => (
            <Link key={item.nombre} to={`/carta?categoria=${encodeURIComponent(item.nombre)}`}>
              <img
                src={`/images/${item.imagen}.webp`}
                width="720"
                height={item.imagen.startsWith('catalogo') ? 720 : 540}
                loading="lazy"
                alt=""
              />
              <span>
                {item.nombre}
                <Icon name="arrow" />
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
export function Promotions() {
  return (
    <section id="promociones" className="promotions-band" aria-labelledby="promotions-title">
      <Container className="editorial-row">
        <div className="section-intro">
          <p className="eyebrow">PARA COMPARTIR</p>
          <h2 id="promotions-title">
            <BaksoText text="Más brasa." />
            <br />{' '}
            <em>
              <BaksoText text="Más momentos." />
            </em>
          </h2>
          <p>Elige tu próximo antojo y consulta las promociones vigentes.</p>
          <ActionLink to="/promociones">
            VER PROMOCIONES <Icon name="arrow" />
          </ActionLink>
          <small>Presentaciones de muestra · consulta precios</small>
        </div>
        <div className="product-grid">
          {productosMuestra.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Container>
    </section>
  );
}
export function ProductCard({ product }: { product: (typeof productosMuestra)[number] }) {
  return (
    <article className="product-card">
      <div className="product-visual">
        <img
          src={`/images/${product.imagen}.webp`}
          width="720"
          height="720"
          loading="lazy"
          alt={`Presentación referencial de ${product.nombre.toLowerCase()}`}
        />
        <Badge>Muestra</Badge>
      </div>
      <div className="product-copy">
        <h3>{product.nombre}</h3>
        <p>{product.descripcion}</p>
        <a href={negocio.whatsapp} className="product-action">
          CONSULTAR <Icon name="arrow" />
        </a>
      </div>
    </article>
  );
}
export function FeaturedProducts() {
  return (
    <Section id="destacados" title="El sabor en primer plano." eyebrow="SELECCIÓN DE MUESTRA">
      <p className="sample-note">Presentaciones ilustrativas. Consulta disponibilidad y precios.</p>
      <div className="product-grid">
        {productosMuestra.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </Section>
  );
}
export function About() {
  return (
    <Section id="nosotros" title="La brasa nos reúne." eyebrow="SOMOS LEÑAS Y SABORES">
      <div className="about-grid">
        <div className="about-mark">
          <img
            src="/images/cat-combos.webp"
            width="720"
            height="540"
            loading="lazy"
            alt="Pollo a la brasa con papas, ensalada y salsas, imagen proporcionada para la web"
          />
        </div>
        <div>
          <p className="large-copy">Pollo a la brasa, parrillas y sabor peruano en Carabayllo.</p>
          <p>
            Una invitación a reunirnos alrededor de la comida. Ven con la familia, comparte con
            amigos o disfruta la brasa donde prefieras.
          </p>
          <div className="brand-values">
            <span>Brasa</span>
            <span>Sabor peruano</span>
            <span>Para compartir</span>
          </div>
          <Link className="text-link" to="/locales">
            Conoce nuestro local <Icon name="arrow" />
          </Link>
        </div>
      </div>
    </Section>
  );
}
export function Benefits() {
  const items = [
    {
      icon: 'flame',
      title: 'Sabor peruano',
      copy: 'Pollo a la brasa y parrillas para tu próximo antojo.',
    },
    {
      icon: 'people',
      title: 'Para compartir',
      copy: 'Una buena razón para reunirnos alrededor de la mesa.',
    },
    {
      icon: 'truck',
      title: 'Donde prefieras',
      copy: 'Delivery, recojo y para llevar. Consulta disponibilidad.',
    },
    {
      icon: 'pin',
      title: 'Estamos cerca',
      copy: 'Visítanos en nuestro local de Carabayllo, Lima.',
    },
  ] as const;
  return (
    <section id="modalidades" className="benefits-band" aria-labelledby="benefits-title">
      <Container className="editorial-row">
        <div className="section-intro">
          <h2 id="benefits-title">
            <BaksoText text="La brasa" />
            <br />
            <em>
              <BaksoText text="nos reúne." />
            </em>
          </h2>
          <p>Sabor peruano y momentos para disfrutar a tu manera.</p>
          <Link className="text-link" to="/nosotros">
            Conócenos <Icon name="arrow" />
          </Link>
        </div>
        <div className="benefit-grid">
          {items.map((item) => (
            <article key={item.title}>
              <span className="benefit-icon">
                <Icon name={item.icon} />
              </span>
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
export function Services() {
  return <Benefits />;
}
export function LocationSection() {
  const mapUrl =
    'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(negocio.direccion);
  return (
    <section id="local" className="location-band" aria-labelledby="location-title">
      <Container className="location-grid">
        <div>
          <p className="eyebrow">TE ESPERAMOS</p>
          <h2 id="location-title">
            <BaksoText text="Tu punto de encuentro." />
            <br />
            <em>
              <BaksoText text="Carabayllo." />
            </em>
          </h2>
          <p className="location-intro">Ven y comparte el sabor de Leñas y Sabores.</p>
          <div className="location-details">
            <div>
              <Icon name="pin" />
              <div>
                <h3>Leñas y Sabores</h3>
                <address>{negocio.direccion}</address>
              </div>
            </div>
            <div>
              <Icon name="clock" />
              <div>
                <h3>Horario de atención</h3>
                <p>{negocio.horario}</p>
              </div>
            </div>
          </div>
          <div className="location-actions">
            <ActionLink to={mapUrl}>
              CÓMO LLEGAR <Icon name="arrow" />
            </ActionLink>
            <a className="text-link" href={negocio.whatsapp}>
              Escríbenos por WhatsApp <Icon name="arrow" />
            </a>
          </div>
          <div className="location-phones">
            <a href="tel:+51947540597">{negocio.telefono}</a>
            <a href="tel:+51972193346">{negocio.adicional}</a>
          </div>
        </div>
        <figure className="location-photo">
          <img
            src="/images/cat-parrillas.webp"
            width="720"
            height="540"
            loading="lazy"
            alt="Parrilla con carnes y verduras, recurso gastronómico proporcionado"
          />
          <figcaption>La brasa nos reúne · imagen referencial</figcaption>
        </figure>
      </Container>
    </section>
  );
}
export function CallToAction() {
  return (
    <section className="closing-banner" aria-labelledby="closing-title">
      <Container>
        <div>
          <h2 id="closing-title">
            <BaksoText text="¿Listo para" />{' '}
            <em>
              <BaksoText text="disfrutar?" />
            </em>
          </h2>
          <p>Consulta nuestra carta y coordina tu pedido con el restaurante.</p>
        </div>
        <ActionLink to={negocio.whatsapp}>
          <Icon name="truck" /> ORDENAR AHORA <Icon name="arrow" />
        </ActionLink>
      </Container>
    </section>
  );
}
