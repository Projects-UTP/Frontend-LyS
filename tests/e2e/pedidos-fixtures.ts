import type { Page } from '@playwright/test';
import { productosDemo } from './fixtures';
export const localDemo = {
  id: 'caba0000-0000-4000-8000-000000000001',
  nombre: 'Leñas y Sabores — Carabayllo',
  direccion:
    'C. Turístico Los Palomares Mz. D Lt. 5, frente a la Planta Eléctrica San Benito, Carabayllo, Lima, Perú.',
  telefono: '+51947540597',
};
export async function pedidosFixture(page: Page) {
  let pedido: Record<string, unknown> | null = null;
  await page.route('**/api/database/records/locales**', (r) => r.fulfill({ json: [localDemo] }));
  await page.route('**/api/database/rpc/**', (r) => {
    const path = new URL(r.request().url()).pathname;
    const body = r.request().postDataJSON();
    if (path.endsWith('/cotizar_pedido')) {
      const items = body.p_items.map((i: { product_id: string; quantity: number }) => {
        const p = productosDemo.find((p) => p.id === i.product_id)!;
        return {
          ...i,
          nombre: p.nombre,
          precio_unitario: p.precio_base,
          subtotal: (Math.round(p.precio_base * 100) * i.quantity) / 100,
          demostracion: true,
        };
      });
      const subtotal = items.reduce((s: number, i: { subtotal: number }) => s + i.subtotal, 0);
      return r.fulfill({
        json: {
          items,
          subtotal,
          descuento: 0,
          costo_delivery: body.p_modalidad === 'DELIVERY' ? null : 0,
          total: body.p_modalidad === 'DELIVERY' ? null : subtotal,
          modalidad: body.p_modalidad,
          local_id: localDemo.id,
          local_nombre: localDemo.nombre,
          demostracion: true,
          version: 'fixture-version',
        },
      });
    }
    if (path.endsWith('/crear_pedido_web')) {
      const s = body.p_solicitud;
      const items = s.items.map((i: { product_id: string; quantity: number }) => {
        const p = productosDemo.find((p) => p.id === i.product_id)!;
        return {
          producto_id: p.id,
          nombre_producto: p.nombre,
          cantidad: i.quantity,
          precio_unitario: p.precio_base,
          subtotal: (Math.round(p.precio_base * 100) * i.quantity) / 100,
        };
      });
      const subtotal = items.reduce((n: number, i: { subtotal: number }) => n + i.subtotal, 0);
      pedido = {
        codigo: 'LYS-000001',
        modalidad: s.modalidad,
        estado_pedido: 'PENDIENTE_PAGO',
        estado_pago: 'PENDIENTE',
        metodo_previsto: s.metodo_previsto,
        subtotal,
        descuento: 0,
        costo_delivery: s.modalidad === 'DELIVERY' ? null : 0,
        total: s.modalidad === 'DELIVERY' ? null : subtotal,
        demostracion: true,
        created_at: new Date().toISOString(),
        items,
        local: localDemo,
        historial: [
          {
            accion: 'PEDIDO_CREADO',
            estado: 'PENDIENTE_PAGO',
            created_at: new Date().toISOString(),
          },
        ],
      };
      return r.fulfill({
        json: {
          codigo: 'LYS-000001',
          id: 'dd000000-0000-4000-8000-000000000001',
          reutilizado: false,
        },
      });
    }
    if (path.endsWith('/consultar_pedido'))
      return r.fulfill({ json: body.p_codigo === 'LYS-000001' ? pedido : null });
    return r.fulfill({ status: 400, json: { message: 'RPC no incluido en fixture' } });
  });
}
