import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Layout } from './Layout';
import { Home } from '@/features/publico/Home';
import { NotFound } from '@/features/publico/NotFound';
import { PublicPage } from '@/features/publico/PublicPage';
import { Providers } from './Providers';
const Carrito = lazy(() =>
  import('@/features/carrito/Carrito').then((m) => ({ default: m.Carrito })),
);
const Checkout = lazy(() =>
  import('@/features/checkout/Checkout').then((m) => ({ default: m.Checkout })),
);
const Pedido = lazy(() => import('@/features/pedidos/Pedido').then((m) => ({ default: m.Pedido })));
const OperativoLayout = lazy(() =>
  import('@/features/operativo/OperativoLayout').then((m) => ({ default: m.OperativoLayout })),
);
const Mesas = lazy(() => import('@/features/operativo/Mesas').then((m) => ({ default: m.Mesas })));
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
            <Route path="operativo" element={<OperativoLayout />}>
              <Route index element={<Mesas />} />
              <Route path="mesas" element={<Mesas />} />
            </Route>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="carta" element={<Carta />} />
              <Route path="carrito" element={<Carrito />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="pedido/:codigo/confirmacion" element={<Pedido confirmacion />} />
              <Route path="pedido/:codigo" element={<Pedido />} />
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
