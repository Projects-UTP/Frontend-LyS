import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { authFixture, usuarioDemo } from './auth-fixtures';
import { localDemo } from './pedidos-fixtures';
export async function loginPersonal(page: Page) {
  await page.goto('/operativo/mesas');
  await page.getByLabel('Correo', { exact: true }).fill(usuarioDemo.email);
  await page.getByLabel('Contraseña', { exact: true }).fill('PruebaSegura2026');
  await page.getByRole('button', { name: 'INICIAR SESIÓN', exact: true }).click();
}
test('mapa de mesas responsive, filtros y paginación configurable', async ({ page }) => {
  test.setTimeout(60000);
  await authFixture(page);
  await page.route('**/api/database/records/locales**', (r) => r.fulfill({ json: [localDemo] }));
  await page.route('**/api/database/records/empleados**', (r) =>
    r.fulfill({ json: [{ local_id: localDemo.id, rol: 'MOZO' }] }),
  );
  await page.route('**/api/database/records/mesas**', (r) =>
    r.fulfill({
      json: Array.from({ length: 100 }, (_, i) => ({
        id: `cc000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`,
        local_id: localDemo.id,
        numero: i + 1,
        nombre: `Mesa ${String(i + 1).padStart(2, '0')}`,
        zona: 'Salón de demostración',
        estado: i === 1 ? 'OCUPADA' : i === 2 ? 'POR_COBRAR' : 'LIBRE',
        capacidad: null,
        demostracion: true,
        activo: true,
      })),
    }),
  );
  await loginPersonal(page);
  await expect(page.getByRole('heading', { name: 'Mesas del local' })).toBeVisible();
  await expect(page.getByText('100 mesas', { exact: true })).toBeVisible();
  for (const width of [360, 390, 430, 768, 1366, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    if ([390, 1366].includes(width))
      await page.screenshot({ path: `test-results/s4-mesas-${width}.png`, fullPage: true });
  }
  await page.getByRole('button', { name: 'Mostrar más mesas' }).click();
  await expect(page.getByRole('link', { name: 'Mesa 100, LIBRE', exact: true })).toBeVisible();
  await page.getByRole('combobox', { name: /^Estado/ }).selectOption('POR_COBRAR');
  await expect(page.getByText('1 mesas', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Mesa 03, POR COBRAR', exact: true })).toBeVisible();
});
test('cliente sin rol no accede al mapa operativo', async ({ page }) => {
  await authFixture(page);
  await page.route('**/api/database/records/empleados**', (r) => r.fulfill({ json: [] }));
  await loginPersonal(page);
  await expect(page.getByRole('heading', { name: 'Acceso de personal' })).toBeVisible();
  await expect(
    page.getByText('Tu cuenta no tiene una asignación activa.', { exact: false }),
  ).toBeVisible();
});
