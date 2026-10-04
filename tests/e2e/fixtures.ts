import type { Page } from '@playwright/test';
export const categoriasDemo = [
  {
    id: 'ca000000-0000-4000-8000-000000000001',
    nombre: 'Pollos a la brasa',
    slug: 'pollos-a-la-brasa',
    orden: 1,
  },
  {
    id: 'ca000000-0000-4000-8000-000000000003',
    nombre: 'Anticuchos',
    slug: 'anticuchos',
    orden: 3,
  },
  { id: 'ca000000-0000-4000-8000-000000000005', nombre: 'Bebidas', slug: 'bebidas', orden: 5 },
];
export const productosDemo = [
  {
    id: 'ba000000-0000-4000-8000-000000000001',
    categoria_id: categoriasDemo[0].id,
    nombre: 'Pollo entero',
    slug: 'pollo-entero',
    descripcion: 'Producto de demostración. Fotografía y precio referenciales.',
    precio_base: 59.9,
    imagen_url: '/images/fav-pollo-entero.webp',
    disponible: true,
    demostracion: true,
  },
  {
    id: 'ba000000-0000-4000-8000-000000000002',
    categoria_id: categoriasDemo[0].id,
    nombre: 'Un cuarto de pollo',
    slug: 'cuarto-pollo',
    descripcion: 'Producto de demostración. Fotografía y precio referenciales.',
    precio_base: 19.9,
    imagen_url: '/images/fav-cuarto-pollo.webp',
    disponible: true,
    demostracion: true,
  },
  {
    id: 'ba000000-0000-4000-8000-000000000003',
    categoria_id: categoriasDemo[1].id,
    nombre: 'Anticuchos',
    slug: 'anticuchos',
    descripcion: 'Producto de demostración. Fotografía y precio referenciales.',
    precio_base: 25.9,
    imagen_url: '/images/fav-anticuchos.webp',
    disponible: true,
    demostracion: true,
  },
];
// Fixtures deterministas en CI; la integración real se comprueba por separado.
export async function catalogoFixture(page: Page) {
  await page.route('**/api/database/records/categorias**', (r) =>
    r.fulfill({ json: categoriasDemo }),
  );
  await page.route('**/api/database/records/productos**', (r) => {
    const slug = new URL(r.request().url()).searchParams.get('slug')?.replace(/^eq\./, '');
    return r.fulfill({ json: slug ? productosDemo.filter((p) => p.slug === slug) : productosDemo });
  });
}
