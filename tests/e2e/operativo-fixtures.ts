import type { Page } from '@playwright/test';
import { authFixture, usuarioDemo } from './auth-fixtures';
import { catalogoFixture, productosDemo } from './fixtures';
import { localDemo } from './pedidos-fixtures';
import type { Orden, Mesa, SesionCaja, MetodoPago } from '../../src/features/operativo/api';
export async function loginPersonal(page: Page) {
  await page.goto('/operativo/mesas');
  await page.getByLabel('Correo', { exact: true }).fill(usuarioDemo.email);
  await page.getByLabel('Contraseña', { exact: true }).fill('PruebaSegura2026');
  await page.getByRole('button', { name: 'INICIAR SESIÓN', exact: true }).click();
  await page.waitForURL('**/operativo/mesas');
  await page.getByRole('link', { name: 'Mi cuenta', exact: true }).waitFor();
}
export function salonFixture() {
  return {
    orden: null as Orden | null,
    caja: null as SesionCaja | null,
    pagos: new Map<
      string,
      { pago_id: string; estado: string; monto: number; vuelto: number; reutilizado: boolean }
    >(),
    mesas: Array.from({ length: 20 }, (_, i) => ({
      id: `cc000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`,
      local_id: localDemo.id,
      numero: i + 1,
      nombre: `Mesa ${String(i + 1).padStart(2, '0')}`,
      zona: 'Salón de demostración',
      capacidad: null,
      estado: 'LIBRE',
      demostracion: true,
      activo: true,
    })) as Mesa[],
  };
}
export async function operativoFixture(page: Page, salon = salonFixture(), roles = ['MOZO']) {
  await catalogoFixture(page);
  await authFixture(page);
  await page.route('**/api/database/records/locales**', (r) => r.fulfill({ json: [localDemo] }));
  await page.route('**/api/database/records/empleados**', (r) =>
    r.fulfill({ json: roles.map((rol) => ({ local_id: localDemo.id, rol })) }),
  );
  await page.route('**/api/database/records/mesas**', (r) => r.fulfill({ json: salon.mesas }));
  await page.route('**/api/database/rpc/**', (r) => {
    const path = new URL(r.request().url()).pathname,
      body = r.request().postDataJSON();
    if (path.endsWith('/mi_caja')) return r.fulfill({ json: salon.caja });
    if (path.endsWith('/cola_pagos'))
      return r.fulfill({
        json: salon.orden?.estado_pedido === 'PENDIENTE_PAGO' ? [salon.orden] : [],
      });
    if (path.endsWith('/orden_operativa'))
      return r.fulfill({ json: salon.orden?.id === body.p_id ? salon.orden : null });
    if (path.endsWith('/abrir_caja')) {
      if (!roles.includes('CAJA'))
        return r.fulfill({ status: 403, json: { message: 'SIN_PERMISO' } });
      salon.caja = {
        id: 'ce000000-0000-4000-8000-000000000001',
        local_id: localDemo.id,
        estado: 'ABIERTA',
        revision: 1,
        opened_at: new Date().toISOString(),
        closed_at: null,
        monto_inicial: Number(body.p_monto),
        ventas: {},
        total_ventas: 0,
        fondos_anulados: 0,
        efectivo_esperado: Number(body.p_monto),
        total_esperado: Number(body.p_monto),
      };
      return r.fulfill({ json: salon.caja });
    }
    if (path.endsWith('/registrar_pago')) {
      if (!roles.includes('CAJA'))
        return r.fulfill({ status: 403, json: { message: 'SIN_PERMISO' } });
      const anterior = salon.pagos.get(body.p_intento);
      if (anterior) return r.fulfill({ json: { ...anterior, reutilizado: true } });
      if (
        !salon.caja ||
        salon.caja.estado !== 'ABIERTA' ||
        !salon.orden ||
        salon.orden.estado_pago !== 'PENDIENTE'
      )
        return r.fulfill({ status: 400, json: { message: 'PEDIDO_YA_COBRADO_O_INVALIDO' } });
      const monto = salon.orden.total!,
        metodo = body.p_metodo as MetodoPago;
      const pago = {
        pago_id: 'cf000000-0000-4000-8000-000000000001',
        estado: 'APROBADO',
        monto,
        vuelto:
          metodo === 'EFECTIVO'
            ? (Math.round(Number(body.p_recibido) * 100) - Math.round(monto * 100)) / 100
            : 0,
        reutilizado: false,
      };
      salon.pagos.set(body.p_intento, pago);
      salon.orden.estado_pago = 'APROBADO';
      salon.orden.estado_pedido = 'CONFIRMADO';
      salon.orden.revision++;
      if (salon.orden.mesa) salon.orden.mesa.estado = 'OCUPADA';
      salon.mesas.find((m) => m.id === salon.orden!.mesa_id)!.estado = 'OCUPADA';
      salon.caja.revision++;
      salon.caja.ventas[metodo] =
        Math.round(((salon.caja.ventas[metodo] ?? 0) + monto) * 100) / 100;
      salon.caja.total_ventas = Math.round((salon.caja.total_ventas + monto) * 100) / 100;
      if (metodo === 'EFECTIVO')
        salon.caja.efectivo_esperado =
          Math.round((salon.caja.efectivo_esperado + monto) * 100) / 100;
      salon.caja.total_esperado = salon.caja.efectivo_esperado;
      return r.fulfill({ json: pago });
    }
    if (path.endsWith('/cerrar_caja')) {
      salon.caja!.estado = 'CERRADA';
      salon.caja!.closed_at = new Date().toISOString();
      salon.caja!.revision++;
      return r.fulfill({ json: salon.caja });
    }
    if (path.endsWith('/listar_pedidos_mesa'))
      return r.fulfill({ json: salon.orden ? [salon.orden] : [] });
    if (path.endsWith('/pedido_de_mesa'))
      return r.fulfill({ json: salon.orden?.mesa_id === body.p_mesa ? salon.orden : null });
    if (path.endsWith('/abrir_pedido_mesa')) {
      if (!roles.includes('MOZO'))
        return r.fulfill({ status: 403, json: { message: 'SIN_PERMISO' } });
      const mesa = salon.mesas.find((m) => m.id === body.p_mesa)!;
      mesa.estado = 'OCUPADA';
      salon.orden = {
        id: 'df000000-0000-4000-8000-000000000001',
        codigo: 'LYS-000002',
        local_id: localDemo.id,
        mesa_id: mesa.id,
        mozo_id: usuarioDemo.id,
        modalidad: 'CONSUMO_LOCAL',
        estado_pedido: 'BORRADOR',
        estado_pago: 'PENDIENTE',
        revision: 1,
        subtotal: 0,
        total: 0,
        demostracion: true,
        observaciones: '',
        created_at: new Date().toISOString(),
        mesa: { numero: mesa.numero, nombre: mesa.nombre, estado: mesa.estado },
        items: [],
      };
      return r.fulfill({ json: salon.orden });
    }
    if (path.endsWith('/editar_pedido_mesa')) {
      if (!salon.orden || !roles.includes('MOZO') || salon.orden.estado_pago !== 'PENDIENTE')
        return r.fulfill({ status: 403, json: { message: 'SIN_PERMISO' } });
      if (body.p_revision !== salon.orden.revision)
        return r.fulfill({ status: 400, json: { message: 'REVISION_CONFLICTO' } });
      salon.orden.items = body.p_items.map(
        (i: { product_id: string; quantity: number; observaciones: string }) => {
          const p = productosDemo.find((p) => p.id === i.product_id)!;
          return {
            producto_id: p.id,
            nombre_producto: p.nombre,
            cantidad: i.quantity,
            precio_unitario: p.precio_base,
            subtotal: (Math.round(p.precio_base * 100) * i.quantity) / 100,
            observaciones: i.observaciones,
          };
        },
      );
      salon.orden.total = salon.orden.subtotal = salon.orden.items.reduce(
        (s, i) => s + i.subtotal,
        0,
      );
      salon.orden.observaciones = body.p_observaciones;
      salon.orden.revision++;
      return r.fulfill({ json: salon.orden });
    }
    if (path.endsWith('/enviar_pedido_caja')) {
      salon.orden!.estado_pedido = 'PENDIENTE_PAGO';
      salon.orden!.revision++;
      salon.orden!.mesa!.estado = 'POR_COBRAR';
      salon.mesas.find((m) => m.id === salon.orden!.mesa_id)!.estado = 'POR_COBRAR';
      return r.fulfill({ json: salon.orden });
    }
    return r.fulfill({ status: 400, json: { message: 'RPC no incluida en fixture' } });
  });
  return salon;
}
