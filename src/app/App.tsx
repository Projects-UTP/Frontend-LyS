import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './Layout';
import { Home } from '@/features/publico/Home';
import { NotFound } from '@/features/publico/NotFound';
import { PublicPage } from '@/features/publico/PublicPage';
export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          {(['carta', 'promociones', 'nosotros', 'locales', 'contacto'] as const).map((page) => (
            <Route key={page} path={page} element={<PublicPage page={page} />} />
          ))}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
