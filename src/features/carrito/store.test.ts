import { it, expect } from 'vitest';
import { sanearItems, useCarrito } from './store';
import type { Producto } from '@/features/catalogo/api';
const id = 'ba000000-0000-4000-8000-000000000001';
it('descarta persistencia corrupta, duplicados y campos sensibles', () => {
  expect(
    sanearItems([
      { product_id: id, quantity: 2, precio: 0.01, correo: 'privado' },
      { product_id: id, quantity: 3 },
      { product_id: 'bad', quantity: 1 },
      { product_id: 'ba000000-0000-4000-8000-000000000002', quantity: -1 },
    ]),
  ).toEqual([{ product_id: id, quantity: 2 }]);
});
it('no acepta cantidad negativa ni borra al reducir hasta cero', () => {
  useCarrito.getState().vaciar();
  useCarrito.getState().agregar({ id, disponible: true, nombre: 'Producto' } as Producto);
  useCarrito.getState().cantidad(id, 0);
  expect(useCarrito.getState().items[0].quantity).toBe(1);
  useCarrito.getState().cantidad(id, 51);
  expect(useCarrito.getState().items[0].quantity).toBe(1);
  useCarrito.getState().quitar(id);
  expect(useCarrito.getState().items).toEqual([]);
});
