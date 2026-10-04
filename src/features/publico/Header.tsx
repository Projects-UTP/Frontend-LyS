import { useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Container, ActionLink } from '@/shared/ui';
import { Brand } from './Brand';
import { negocio, navegacion } from './contenido';
export function Header() {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  const close = () => {
    setOpen(false);
  };
  return (
    <header className="site-header" key={location.pathname}>
      <Container className="header-inner">
        <Brand />
        <button
          ref={button}
          className="menu-toggle"
          aria-controls="menu-publico"
          aria-expanded={open}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setOpen(!open)}
        >
          <span aria-hidden="true">{open ? '×' : '☰'}</span>
        </button>
        <nav
          id="menu-publico"
          className={`navigation ${open ? 'is-open' : ''}`}
          aria-label="Navegación principal"
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              close();
              button.current?.focus();
            }
          }}
        >
          {navegacion.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} onClick={close}>
              {item.label}
            </NavLink>
          ))}
          <span className="account-future">
            Mi cuenta <small>Próximamente</small>
          </span>
          <ActionLink to={negocio.whatsapp}>ORDENAR AHORA</ActionLink>
        </nav>
      </Container>
    </header>
  );
}
