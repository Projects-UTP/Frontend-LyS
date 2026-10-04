import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './Layout';
import { Home } from '@/features/publico/Home';
import { NotFound } from '@/features/publico/NotFound';
export function App() {
  return <BrowserRouter><Routes><Route element={<Layout />}><Route index element={<Home />} /><Route path="*" element={<NotFound />} /></Route></Routes></BrowserRouter>;
}
