import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Layout } from './Layout';
import { Home } from '@/features/publico/Home';
import { NotFound } from '@/features/publico/NotFound';
import { PublicPage } from '@/features/publico/PublicPage';
import { Providers } from './Providers';
import { Carta, DetalleProducto } from '@/features/catalogo/Catalogo';
const RegistroCliente = lazy(() =>
  import('@/features/autenticacion/Registro').then((m) => ({ default: m.RegistroCliente })),
);
const MiCuenta = lazy(() =>
  import('@/features/autenticacion/MiCuenta').then((m) => ({ default: m.MiCuenta })),
);
const IniciarSesion = lazy(() =>
  import('@/features/autenticacion/Login').then((m) => ({ default: m.IniciarSesion })),
);
const RecuperarAcceso = lazy(() =>
  import('@/features/autenticacion/Recuperacion').then((m) => ({ default: m.RecuperarAcceso })),
);
export function App() {
  return (
    <Providers>
      <BrowserRouter>
        <Suspense
          fallback={
            <p className="container commerce-state" role="status">
              Cargando página…
            </p>
          }
        >
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="carta" element={<Carta />} />
              <Route path="carta/:slug" element={<DetalleProducto />} />
              <Route path="registro" element={<RegistroCliente />} />
              <Route path="iniciar-sesion" element={<IniciarSesion />} />
              <Route path="recuperar-acceso" element={<RecuperarAcceso />} />
              <Route path="mi-cuenta" element={<MiCuenta />} />
              {(['promociones', 'nosotros', 'locales', 'contacto'] as const).map((page) => (
                <Route key={page} path={page} element={<PublicPage page={page} />} />
              ))}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </Providers>
  );
}
