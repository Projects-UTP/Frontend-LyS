import { Link } from 'react-router-dom';
import { Container } from '@/shared/ui';
import { Brand } from './Brand';
import { negocio, navegacion } from './contenido';
export function Footer() {
  return (
    <footer className="site-footer">
      <Container>
        <div className="footer-grid">
          <div>
            <Brand light />
            <p>
              Sabor peruano.
              <br />
              Momentos para compartir.
            </p>
            <small>{negocio.razonSocial}</small>
          </div>
          <nav aria-label="Navegación del pie">
            <h2>Explora</h2>
            {navegacion.map((item) => (
              <Link key={item.to} to={item.to}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div>
            <h2>Visítanos</h2>
            <p>{negocio.direccion}</p>
            <p>{negocio.horario}</p>
          </div>
          <div>
            <h2>Conversemos</h2>
            <a href="tel:+51947540597">{negocio.telefono}</a>
            <a href="tel:+51972193346">{negocio.adicional}</a>
            <a href={negocio.whatsapp}>WhatsApp</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Leñas y Sabores</span>
          <span>
            Privacidad · Términos · Libro de reclamaciones <small>(próximamente)</small>
          </span>
        </div>
      </Container>
    </footer>
  );
}
