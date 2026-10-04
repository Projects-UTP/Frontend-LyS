import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { catalogoFixture } from './fixtures';
test('carrito persiste solo IDs/cantidades y permite corregirlo', async ({ page }) => {
  await catalogoFixture(page);
  await page.goto('/carta');
  await page.getByRole('button', { name: 'Agregar Pollo entero al carrito' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'agregado al carrito' })).toBeVisible();
  await page.goto('/carrito');
  await page.getByRole('button', { name: 'Aumentar Pollo entero' }).click();
  await expect(page.getByText('S/ 119.80', { exact: true }).first()).toBeVisible();
  await page.reload();
  await expect(page.getByText('S/ 119.80', { exact: true }).first()).toBeVisible();
  const storage = JSON.parse((await page.evaluate(() => localStorage.getItem('lys-carrito')))!);
  expect(storage.version).toBe(1);
  expect(Object.keys(storage.state)).toEqual(['items']);
  expect(Object.keys(storage.state.items[0]).sort()).toEqual(['product_id', 'quantity']);
  for (const width of [390, 768, 1366, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    if (width === 390 || width === 1366)
      await page.screenshot({ path: `test-results/s3-carrito-${width}.png`, fullPage: true });
  }
  await page.getByRole('button', { name: 'Reducir Pollo entero' }).click();
  await expect(page.getByRole('button', { name: 'Reducir Pollo entero' })).toBeDisabled();
  await page.getByRole('button', { name: 'Eliminar Pollo entero' }).click();
  await expect(page.getByRole('heading', { name: 'Tu mesa está por llenarse' })).toBeVisible();
});
