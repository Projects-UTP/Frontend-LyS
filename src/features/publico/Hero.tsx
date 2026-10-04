import { ActionLink, Container } from '@/shared/ui';
import { negocio } from './contenido';
export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <Container className="hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">POLLOS & PARRILLAS · CARABAYLLO</p>
          <h1 id="hero-title">
            Sabor peruano
            <br /> <em>en cada brasa.</em>
          </h1>
          <p className="hero-description">
            Pollo a la brasa, parrillas y una buena razón para reunirnos alrededor de la mesa.
          </p>
          <div className="hero-actions">
            <ActionLink to={negocio.whatsapp}>
              ORDENAR AHORA <span aria-hidden="true">↗</span>
            </ActionLink>
            <ActionLink to="/carta" className="action-outline">
              EXPLORAR LA CARTA
            </ActionLink>
          </div>
          <p className="hero-note">Atendemos de 12:00 p. m. a 12:00 a. m.</p>
        </div>
        <div className="hero-media">
          <img
            src="/images/brasa-1024.webp"
            srcSet="/images/brasa-640.webp 640w, /images/brasa-1024.webp 1024w"
            sizes="(max-width: 800px) 100vw, 65vw"
            width="1024"
            height="409"
            fetchPriority="high"
            alt="Pollo a la brasa con papas, ensalada, salsas e Inca Kola en el banner de Leñas y Sabores"
          />
        </div>
      </Container>
    </section>
  );
}
