import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { catalogoFixture } from './fixtures';
import { authFixture } from './auth-fixtures';
test('recuperación mantiene respuesta genérica y valida el código antes de cambiar contraseña', async ({
  page,
}) => {
  await catalogoFixture(page);
  await authFixture(page);
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto('/recuperar-acceso');
  await page.getByLabel('Correo', { exact: true }).fill('cliente@example.test');
  await page.getByRole('button', { name: 'ENVIAR CÓDIGO' }).click();
  await expect(page.getByText('Si existe una cuenta', { exact: false })).toBeVisible();
  await page.getByLabel('Código de recuperación').fill('111111');
  await page.getByLabel('Nueva contraseña').fill('OtraClaveSegura2026');
  await page.getByLabel('Confirmar contraseña').fill('OtraClaveSegura2026');
  await page.getByRole('button', { name: 'CAMBIAR CONTRASEÑA' }).click();
  await expect(page.getByRole('alert')).toContainText('no es válido');
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({ path: 'test-results/s2-recuperacion.png', fullPage: true });
  await page.getByLabel('Código de recuperación').fill('123456');
  await page.getByRole('button', { name: 'CAMBIAR CONTRASEÑA' }).click();
  await expect(page.getByRole('heading', { name: 'Contraseña actualizada' })).toBeVisible();
  expect(
    await page.evaluate(
      () => JSON.stringify({ ...localStorage, ...sessionStorage }) + location.href,
    ),
  ).not.toContain('fixture-reset');
});
