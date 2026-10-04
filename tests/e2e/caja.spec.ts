import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { operativoFixture, salonFixture, loginPersonal } from './operativo-fixtures';
import { productosDemo } from './fixtures';
import { localDemo } from './pedidos-fixtures';
test('caja abre turno, verifica total, calcula vuelto, reintenta y cierra', async ({ page }) => {
  test.setTimeout(60000);
  const salon = salonFixture(),
    mesa = salon.mesas[0],
    producto = productosDemo[0];
  mesa.estado = 'POR_COBRAR';
  salon.orden = {
    id: 'df000000-0000-4000-8000-000000000001',
    codigo: 'LYS-000002',
    local_id: localDemo.id,
    mesa_id: mesa.id,
    mozo_id: 'aa000000-0000-4000-8000-000000000001',
    modalidad: 'CONSUMO_LOCAL',
    estado_pedido: 'PENDIENTE_PAGO',
    estado_pago: 'PENDIENTE',
    revision: 3,
    subtotal: producto.precio_base,
    total: producto.precio_base,
    demostracion: true,
    observaciones: 'Papas aparte',
    created_at: new Date().toISOString(),
    mesa: { numero: 1, nombre: mesa.nombre, estado: 'POR_COBRAR' },
    items: [
      {
        producto_id: producto.id,
        nombre_producto: producto.nombre,
        cantidad: 1,
        precio_unitario: producto.precio_base,
        subtotal: producto.precio_base,
        observaciones: '',
      },
    ],
  };
  await operativoFixture(page, salon, ['CAJA']);
  await loginPersonal(page);
  await page.getByRole('link', { name: 'Caja', exact: true }).click();
  await page.getByLabel('Monto inicial (S/)', { exact: true }).fill('50,00');
  await page.getByRole('button', { name: 'Abrir caja', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Sesión abierta' })).toBeVisible();
  await page.screenshot({ path: 'test-results/s5-cola-caja.png', fullPage: true });
  await page.getByRole('button', { name: 'Cobrar LYS-000002' }).click();
  await expect(page.getByText('Total del servidor:', { exact: false })).toContainText('59.90');
  await page.getByLabel('Monto recibido (S/)', { exact: true }).fill('100,00');
  await expect(page.getByText('Vuelto:', { exact: false })).toContainText('40.10');
  for (const width of [390, 768, 1024, 1366, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    if ([390, 1366].includes(width))
      await page.screenshot({ path: `test-results/s5-efectivo-${width}.png`, fullPage: true });
  }
  await page.getByRole('combobox', { name: /Método de pago/ }).selectOption('YAPE');
  await expect(
    page.getByText('Verifica Yape fuera de la aplicación', { exact: false }),
  ).toBeVisible();
  await page.screenshot({ path: 'test-results/s5-yape.png', fullPage: true });
  await page.getByRole('combobox', { name: /Método de pago/ }).selectOption('PLIN');
  await page.screenshot({ path: 'test-results/s5-plin.png', fullPage: true });
  await page.getByRole('combobox', { name: /Método de pago/ }).selectOption('EFECTIVO');
  await page.getByLabel('Confirmo que recibí y verifiqué este pago', { exact: true }).check();
  const claves: string[] = [];
  let intentos = 0;
  await page.route('**/api/database/rpc/registrar_pago', async (r) => {
    const body = r.request().postDataJSON();
    expect(body.p_total).toBeUndefined();
    claves.push(body.p_intento);
    if (++intentos === 1) return r.fulfill({ status: 503, json: { message: 'Unavailable' } });
    await r.fallback();
  });
  await page.getByRole('button', { name: 'Registrar pago confirmado' }).click();
  await expect(page.getByRole('alert')).toContainText('Consulta el estado');
  await page.getByRole('button', { name: 'Registrar pago confirmado' }).click();
  await expect(page.getByText('Pago registrado: APROBADO', { exact: true })).toBeVisible();
  expect(claves[0]).toBe(claves[1]);
  expect(salon.pagos.size).toBe(1);
  await page.getByRole('button', { name: 'Preparar cierre' }).click();
  await page.getByLabel('Confirmo el cierre de esta sesión', { exact: true }).check();
  await page.screenshot({ path: 'test-results/s5-cierre-basico.png', fullPage: true });
  await page.getByRole('button', { name: 'Confirmar cierre de caja' }).click();
  await expect(page.getByRole('heading', { name: 'Último cierre' })).toBeVisible();
});
test('mozo no encuentra acciones de cobro ni cierre', async ({ page }) => {
  await operativoFixture(page);
  await loginPersonal(page);
  await page.goto('/operativo/caja');
  await expect(page.getByRole('heading', { name: 'Sin acceso a caja' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Registrar pago confirmado' })).toHaveCount(0);
});
