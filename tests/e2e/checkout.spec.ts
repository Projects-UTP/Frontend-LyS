import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { catalogoFixture } from './fixtures';
import { pedidosFixture } from './pedidos-fixtures';
import { authFixture, usuarioDemo } from './auth-fixtures';
test.beforeEach(async ({ page }) => {
  await catalogoFixture(page);
  await pedidosFixture(page);
  await page.goto('/carta');
  await page.getByRole('button', { name: 'Agregar Pollo entero al carrito' }).click();
  await page.goto('/checkout');
  await page.getByRole('button', { name: 'CONTINUAR COMO INVITADO' }).click();
});
test('checkout invitado cotiza, conserva carrito tras fallo y reintenta con la misma clave', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'CONTINUAR', exact: true }).click();
  await page.getByRole('button', { name: 'REVISAR PEDIDO' }).click();
  await expect(page.getByRole('heading', { name: 'Revisa estos datos' })).toBeVisible();
  await page.getByLabel('Nombres y apellidos').fill('Invitado Prueba');
  await page.getByLabel('Celular', { exact: true }).fill('900000001');
  await page.getByLabel('Yape', { exact: true }).check();
  await page.getByRole('button', { name: 'REVISAR PEDIDO' }).click();
  await expect(page.getByRole('heading', { name: 'Importes del servidor' })).toBeVisible();
  for (const width of [390, 768, 1366, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    if (width === 390 || width === 1366)
      await page.screenshot({ path: `test-results/s3-checkout-${width}.png`, fullPage: true });
  }
  const claves: string[] = [];
  let llamadas = 0;
  await page.route('**/api/database/rpc/crear_pedido_web', async (r) => {
    const body = r.request().postDataJSON();
    expect(body.p_solicitud.total).toBeUndefined();
    claves.push(body.p_idempotencia);
    llamadas++;
    if (llamadas === 1) return r.fulfill({ status: 503, json: { message: 'Unavailable' } });
    await r.fallback();
  });
  await page.getByRole('button', { name: 'CONFIRMAR PEDIDO' }).click();
  await expect(page.getByRole('alert')).toContainText('Reintenta');
  expect(
    JSON.parse((await page.evaluate(() => localStorage.getItem('lys-carrito')))!).state.items,
  ).toHaveLength(1);
  await page.getByRole('button', { name: 'CONFIRMAR PEDIDO' }).click();
  await expect(page).toHaveURL(/pedido\/LYS-000001\/confirmacion/);
  await expect(page.getByRole('heading', { name: 'Tu pedido está registrado' })).toBeVisible();
  await expect(page.getByText('El pago sigue pendiente', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Tu pedido está registrado' })).toBeVisible();
  for (const width of [390, 1366]) {
    await page.setViewportSize({ width, height: 1000 });
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.screenshot({ path: `test-results/s3-confirmacion-${width}.png`, fullPage: true });
  }
  await page.getByRole('link', { name: 'VER SEGUIMIENTO' }).click();
  await expect(page.getByRole('heading', { name: 'Historial' })).toBeVisible();
  await expect(page.getByText('Pedido registrado', { exact: true })).toBeVisible();
  await page.screenshot({ path: 'test-results/s3-seguimiento.png', fullPage: true });
  await page.evaluate(() => sessionStorage.clear());
  await page.reload();
  await expect(page.getByRole('heading', { name: 'No podemos mostrar este pedido' })).toBeVisible();
  expect(claves[0]).toBe(claves[1]);
  expect(
    JSON.parse((await page.evaluate(() => localStorage.getItem('lys-carrito')))!).state.items,
  ).toHaveLength(0);
});
test('delivery exige dirección y deja el total pendiente', async ({ page }) => {
  await page.getByLabel('Delivery', { exact: true }).check();
  await page.getByRole('button', { name: 'CONTINUAR', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Revisa estos datos' })).toBeVisible();
  await page.getByLabel('Dirección', { exact: true }).fill('Calle de prueba 123');
  await page.getByLabel('Distrito', { exact: true }).fill('Carabayllo');
  await page.getByRole('button', { name: 'CONTINUAR', exact: true }).click();
  await page.getByLabel('Nombres y apellidos').fill('Invitado Prueba');
  await page.getByLabel('Celular', { exact: true }).fill('900000001');
  await page.getByRole('button', { name: 'REVISAR PEDIDO' }).click();
  await expect(
    page.getByText('Costo de delivery pendiente de confirmación.', { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('definition').filter({ hasText: 'Pendiente' })).toBeVisible();
});
test('cuenta reutiliza perfil y permite corregir solo los datos del pedido', async ({ page }) => {
  await authFixture(page);
  await page.route('**/api/database/records/perfiles_cliente**', (r) =>
    r.fulfill({
      json: [{ id: usuarioDemo.id, nombres: 'Ana', apellidos: 'García', celular: '900000001' }],
    }),
  );
  await page.goto('/iniciar-sesion');
  await page.getByLabel('Correo', { exact: true }).fill(usuarioDemo.email);
  await page.getByLabel('Contraseña', { exact: true }).fill('PruebaSegura2026');
  await page.getByRole('button', { name: 'INICIAR SESIÓN', exact: true }).click();
  await expect(page).toHaveURL(/mi-cuenta/);
  await page.goto('/checkout');
  await page.getByRole('button', { name: 'CONTINUAR', exact: true }).click();
  await expect(page.getByLabel('Nombres y apellidos')).toHaveValue('Ana García');
  await page.getByLabel('Nombres y apellidos').fill('Ana Prueba');
  await page.getByRole('button', { name: 'REVISAR PEDIDO' }).click();
  await expect(page.getByText('Ana Prueba', { exact: false })).toBeVisible();
  await page.goto('/mi-cuenta');
  await expect(page.getByText('García', { exact: true })).toBeVisible();
});
