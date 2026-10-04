import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { catalogoFixture } from './fixtures';
test.beforeEach(async ({ page }) => catalogoFixture(page));
test('Carta: buscar, limpiar, categoría y detalle', async ({ page }) => {
  await page.goto('/carta');
  await expect(page.locator('.catalog-card')).toHaveCount(3);
  await expect(page.getByRole('link', { name: 'VER PRODUCTO' }).first()).toBeVisible();
  await page.getByLabel('Buscar en la carta').fill('pollo');
  await expect(page.locator('.catalog-card')).toHaveCount(2);
  await page.getByRole('button', { name: 'Limpiar búsqueda' }).click();
  await page.getByRole('button', { name: 'Anticuchos', exact: true }).click();
  await expect(page.locator('.catalog-card')).toHaveCount(1);
  await page.getByRole('link', { name: 'VER PRODUCTO' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Anticuchos' })).toBeVisible();
  await expect(page.locator('.product-detail .price')).toContainText('25.90');
  await page.goto('/carta/desconocido');
  await expect(page.getByRole('heading', { name: 'Producto no encontrado' })).toBeVisible();
});
test('Carta maneja error y recuperación', async ({ page }) => {
  await page.route('**/api/database/records/productos**', (r) =>
    r.fulfill({ status: 503, json: { message: 'Fixture temporal' } }),
  );
  await page.goto('/carta');
  await expect(page.getByRole('alert')).toContainText('No pudimos cargar');
  await page.unroute('**/api/database/records/productos**');
  await catalogoFixture(page);
  await page.getByRole('button', { name: 'REINTENTAR' }).click();
  await expect(page.locator('.catalog-card')).toHaveCount(3);
});
test('Carta y detalle adaptables y accesibles', async ({ page }) => {
  for (const width of [390, 768, 1366, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of ['/carta', '/carta/pollo-entero']) {
      await page.goto(route);
      await expect(page.locator('.catalog-card,.product-detail').first()).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      expect(
        (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze())
          .violations,
      ).toEqual([]);
      if (width === 390 || width === 1366)
        await page.screenshot({
          path: `test-results/s2-${route.includes('pollo') ? 'detalle' : 'carta'}-${width}.png`,
          fullPage: true,
        });
    }
  }
});
