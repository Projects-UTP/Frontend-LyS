import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { catalogoFixture } from './fixtures';
import { authFixture } from './auth-fixtures';
test.beforeEach(async ({ page }) => {
  await catalogoFixture(page);
  await authFixture(page);
});
test('login rechaza credenciales, bloquea redirect externo y conserva identidad si logout falla', async ({
  page,
}) => {
  await page.route('**/api/auth/sessions', (r) =>
    r.request().postDataJSON().password === 'incorrecta'
      ? r.fulfill({ status: 401, json: { statusCode: 401, message: 'Invalid credentials' } })
      : r.fallback(),
  );
  await page.goto('/mi-cuenta');
  await expect(page).toHaveURL(/iniciar-sesion/);
  await page.goto('/iniciar-sesion?volver=https://externo.example');
  await page.getByLabel('Correo', { exact: true }).fill('cliente@example.test');
  await page.getByLabel('Contraseña', { exact: true }).fill('incorrecta');
  await page.getByRole('button', { name: 'INICIAR SESIÓN', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('no son correctos');
  await page.getByLabel('Contraseña', { exact: true }).fill('PruebaSegura2026');
  await page.getByRole('button', { name: 'INICIAR SESIÓN', exact: true }).click();
  await expect(page).toHaveURL(/mi-cuenta/);
  await page.getByLabel('Nombres', { exact: true }).fill('Ana');
  await page.getByLabel('Apellidos', { exact: true }).fill('García');
  await page.getByLabel('Celular', { exact: true }).fill('947540597');
  await page.getByRole('button', { name: 'GUARDAR DATOS' }).click();
  await expect(page.getByText('García', { exact: true })).toBeVisible();
  await page.screenshot({ path: 'test-results/s2-perfil.png', fullPage: true });
  await page.route('**/api/auth/logout', (r) =>
    r.fulfill({ status: 503, json: { message: 'Unavailable' } }),
  );
  await page.getByRole('button', { name: 'CERRAR SESIÓN' }).click();
  await expect(page.getByRole('alert')).toContainText('No pudimos cerrar');
  await expect(page).toHaveURL(/mi-cuenta/);
  await page.unroute('**/api/auth/logout');
  await page.getByRole('button', { name: 'CERRAR SESIÓN' }).click();
  await expect(page).toHaveURL(/iniciar-sesion/);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Iniciar sesión', exact: true })).toBeVisible();
});
test('login accesible y responsive', async ({ page }) => {
  for (const width of [390, 768, 1366, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/iniciar-sesion');
    await expect(page.getByRole('button', { name: 'INICIAR SESIÓN', exact: true })).toBeEnabled();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    if (width === 390 || width === 1366)
      await page.screenshot({ path: `test-results/s2-login-${width}.png`, fullPage: true });
  }
});
