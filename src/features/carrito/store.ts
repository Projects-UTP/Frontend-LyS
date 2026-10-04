import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Producto } from '@/features/catalogo/api';
export type ItemCarrito = { product_id: string; quantity: number };
const uuid = /^[0-9a-f-]{36}$/i;
export function sanearItems(value: unknown): ItemCarrito[] {
  if (!Array.isArray(value)) return [];
  const ids = new Set<string>();
  return value.slice(0, 30).flatMap((v) => {
    if (
      !v ||
      typeof v.product_id !== 'string' ||
      !uuid.test(v.product_id) ||
      ids.has(v.product_id) ||
      !Number.isInteger(v.quantity) ||
      v.quantity < 1 ||
      v.quantity > 50
    )
      return [];
    ids.add(v.product_id);
    return [{ product_id: v.product_id, quantity: v.quantity }];
  });
}
type Carrito = {
  items: ItemCarrito[];
  mensaje: string;
  agregar: (p: Producto) => void;
  cantidad: (id: string, n: number) => void;
  quitar: (id: string) => void;
  vaciar: () => void;
};
// Persistimos solo identificadores y cantidades. Los precios siempre se vuelven a consultar.
export const useCarrito = create<Carrito>()(
  persist(
    (set, get) => ({
      items: [],
      mensaje: '',
      agregar: (p) => {
        if (!p.disponible) {
          set({ mensaje: 'Este producto no está disponible.' });
          return;
        }
        const actual = get().items.find((i) => i.product_id === p.id);
        if ((actual?.quantity ?? 0) >= 50 || (!actual && get().items.length >= 30)) {
          set({ mensaje: 'Llegaste al límite de unidades o productos por pedido.' });
          return;
        }
        set({
          items: actual
            ? get().items.map((i) =>
                i.product_id === p.id ? { ...i, quantity: i.quantity + 1 } : i,
              )
            : [...get().items, { product_id: p.id, quantity: 1 }],
          mensaje: `${p.nombre} agregado al carrito.`,
        });
      },
      cantidad: (id, n) => {
        if (Number.isInteger(n) && n >= 1 && n <= 50)
          set({
            items: get().items.map((i) => (i.product_id === id ? { ...i, quantity: n } : i)),
            mensaje: 'Cantidad actualizada.',
          });
      },
      quitar: (id) =>
        set({
          items: get().items.filter((i) => i.product_id !== id),
          mensaje: 'Producto eliminado del carrito.',
        }),
      vaciar: () => set({ items: [], mensaje: 'Carrito vacío.' }),
    }),
    {
      name: 'lys-carrito',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items }),
      merge: (persistido, actual) => ({
        ...actual,
        items: sanearItems((persistido as { items?: unknown } | undefined)?.items),
      }),
      migrate: (p) => ({ items: sanearItems((p as { items?: unknown } | undefined)?.items) }),
    },
  ),
);
