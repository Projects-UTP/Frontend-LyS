import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './Layout';
import { Home } from '@/features/publico/Home';
import { NotFound } from '@/features/publico/NotFound';
import { PublicPage } from '@/features/publico/PublicPage';
import { Providers } from './Providers';
import { Carta, DetalleProducto } from '@/features/catalogo/Catalogo';
import { RegistroCliente } from '@/features/autenticacion/Registro';
import { MiCuenta } from '@/features/autenticacion/MiCuenta';
import { IniciarSesion } from '@/features/autenticacion/Login';
export function App() {
  return (
    <Providers>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="carta" element={<Carta />} />
            <Route path="carta/:slug" element={<DetalleProducto />} />
            <Route path="registro" element={<RegistroCliente />} />
            <Route path="iniciar-sesion" element={<IniciarSesion />} />
            <Route path="mi-cuenta" element={<MiCuenta />} />
            {(['promociones', 'nosotros', 'locales', 'contacto'] as const).map((page) => (
              <Route key={page} path={page} element={<PublicPage page={page} />} />
            ))}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Providers>
  );
}
