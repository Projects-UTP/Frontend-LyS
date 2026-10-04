import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { catalogoFixture } from './fixtures';
import { authFixture } from './auth-fixtures';
test.beforeEach(async ({ page }) => {
  await catalogoFixture(page);
  await authFixture(page);
});
test('valida, verifica, conserva sesión y cierra en servidor', async ({ page }) => {
  await page.goto('/registro');
  await page.getByRole('button', { name: 'CREAR CUENTA', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Revisa estos datos' })).toBeVisible();
  await page.getByLabel('Nombres', { exact: true }).fill('Ana');
  await page.getByLabel('Apellidos', { exact: true }).fill('García');
  await page.getByLabel('Correo', { exact: true }).fill('cliente@example.test');
  await page.getByLabel('Celular', { exact: true }).fill('947540597');
  await page.getByLabel('Contraseña', { exact: true }).fill('PruebaSegura2026');
  await page.getByLabel('Confirmar contraseña', { exact: true }).fill('PruebaSegura2026');
  await page.getByRole('button', { name: 'CREAR CUENTA', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Verifica tu correo' })).toBeVisible();
  await page.getByLabel('Código de verificación').fill('111111');
  await page.getByRole('button', { name: 'VERIFICAR CORREO', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('código');
  await page.getByLabel('Código de verificación').fill('123456');
  await page.getByRole('button', { name: 'VERIFICAR CORREO', exact: true }).click();
  await expect(page).toHaveURL(/mi-cuenta/);
  await expect(page.getByText('García', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText('García', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => Object.values(localStorage))).not.toContain('PruebaSegura2026');
  await page.getByRole('button', { name: /cerrar sesión/i }).click();
  await expect(page).toHaveURL(/iniciar-sesion/);
});
test('registro accesible en móvil y escritorio', async ({ page }) => {
  for (const width of [390, 768, 1366, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/registro');
    await expect(page.getByRole('button', { name: 'CREAR CUENTA', exact: true })).toBeEnabled();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    if (width === 390 || width === 1366)
      await page.screenshot({ path: `test-results/s2-registro-${width}.png`, fullPage: true });
  }
});
