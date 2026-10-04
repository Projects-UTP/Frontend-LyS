import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { Header } from '@/features/publico/Header';
import { Footer } from '@/features/publico/Footer';

export function Layout() {
  const location = useLocation();
  const main = useRef<HTMLElement>(null);
  const previous = useRef(location.pathname);
  useEffect(() => {
    const titles: Record<string, string> = {
      '/': 'Pollo a la brasa en Carabayllo',
      '/carta': 'Carta de muestra',
      '/promociones': 'Promociones',
      '/nosotros': 'Nosotros',
      '/locales': 'Nuestro local',
      '/contacto': 'Contacto',
    };
    document.title = `${titles[location.pathname] ?? 'Página no encontrada'} | Leñas y Sabores`;
    document
      .querySelector('meta[name="robots"]')
      ?.setAttribute('content', titles[location.pathname] ? 'index,follow' : 'noindex,follow');
    if (previous.current !== location.pathname) {
      window.scrollTo(0, 0);
      main.current?.focus();
      previous.current = location.pathname;
    }
  }, [location.pathname]);
  return (
    <>
      <a href="#contenido" className="skip-link">
        Saltar al contenido
      </a>
      <Header key={location.pathname} />
      <main id="contenido" tabIndex={-1} ref={main}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
