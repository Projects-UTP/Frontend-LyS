import { useEffect, useState } from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/autenticacion/context';
import { useLocales } from '@/features/pedidos/api';
import { useAsignaciones } from './api';
import { OperativoContext } from './context';
import './operativo.css';
import { ActualizacionOperativa } from './ActualizacionOperativa';
export function OperativoLayout() {
  const auth = useAuth(),
    asignaciones = useAsignaciones(),
    locales = useLocales(),
    location = useLocation();
  const [seleccion, setSeleccion] = useState(''),
    [error, setError] = useState('');
  const validas = asignaciones.data ?? [];
  const ids = [...new Set(validas.map((a) => a.local_id))];
  const local = ids.includes(seleccion) ? seleccion : (ids[0] ?? '');
  const roles = validas.filter((a) => a.local_id === local).map((a) => a.rol);
  useEffect(() => {
    document.title = 'Operación | Leñas y Sabores';
    document.querySelector('meta[name="robots"]')?.setAttribute('content', 'noindex,nofollow');
  }, [location.pathname]);
  if (auth.cargando) return <p role="status">Comprobando sesión…</p>;
  if (!auth.usuario)
    return (
      <Navigate replace to={`/iniciar-sesion?volver=${encodeURIComponent(location.pathname)}`} />
    );
  if (asignaciones.isPending) return <p role="status">Comprobando permisos…</p>;
  if (asignaciones.error)
    return (
      <section className="op-shell">
        <h1>Acceso de personal</h1>
        <p role="alert">{asignaciones.error.message}</p>
        <button onClick={() => void asignaciones.refetch()}>Reintentar</button>
      </section>
    );
  if (!local)
    return (
      <section className="op-shell">
        <h1>Acceso de personal</h1>
        <p>
          Tu cuenta no tiene una asignación activa. Solicita al administrador que confirme tu rol y
          local.
        </p>
        <Link to="/mi-cuenta">Mi cuenta</Link>
      </section>
    );
  return (
    <OperativoContext.Provider value={{ local, roles, usuario: auth.usuario.id }}>
      <a className="skip-link" href="#operacion">
        Saltar al contenido
      </a>
      <div className="op-app">
        <header className="op-header">
          <Link to="/">Leñas y Sabores</Link>
          <span>OPERACIÓN · {roles.join(' / ')}</span>
          <label>
            Local
            <select value={local} onChange={(e) => setSeleccion(e.target.value)}>
              {ids.map((id) => (
                <option key={id} value={id}>
                  {locales.data?.find((l) => l.id === id)?.nombre ?? 'Local asignado'}
                </option>
              ))}
            </select>
          </label>
          <button
            onClick={() =>
              void auth.salir().catch(() => setError('No se pudo cerrar la sesión. Reintenta.'))
            }
          >
            Cerrar sesión
          </button>
        </header>
        <nav className="op-nav" aria-label="Operación">
          {roles.some((r) => ['CAJA', 'ADMINISTRADOR'].includes(r)) && (
            <Link to="/operativo/caja">Caja</Link>
          )}
          {roles.some((r) => ['MOZO', 'CAJA', 'ADMINISTRADOR'].includes(r)) && (
            <Link to="/operativo/mesas">Mesas</Link>
          )}
          {roles.some((r) => ['COCINA', 'ADMINISTRADOR'].includes(r)) && (
            <Link to="/operativo/cocina">Cocina</Link>
          )}
          {roles.some((r) => ['MOZO', 'ADMINISTRADOR'].includes(r)) && (
            <Link to="/operativo/listos">Pedidos listos</Link>
          )}
          <Link to="/mi-cuenta">Mi cuenta</Link>
          {roles.includes('ADMINISTRADOR') && <Link to="/operativo/anulaciones">Anulaciones</Link>}
        </nav>
        <main id="operacion" className="op-shell">
          <ActualizacionOperativa key={`${local}:${auth.usuario.id}`} />
          {error && <p role="alert">{error}</p>}
          <Outlet key={local} />
        </main>
      </div>
    </OperativoContext.Provider>
  );
}
