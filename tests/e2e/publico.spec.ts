import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('Portada, imágenes y acciones reales', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('.site-header .brand img')).toHaveAttribute(
    'src',
    '/images/imagotipo.webp',
  );
  await page.locator('.category-gallery').scrollIntoViewIfNeeded();
  for (const img of await page.locator('.category-gallery img,.product-visual img').all()) {
    await expect
      .poll(() => img.evaluate((item: HTMLImageElement) => item.complete && item.naturalWidth > 0))
      .toBe(true);
  }
  await expect(page.getByRole('link', { name: 'EXPLORAR LA CARTA' })).toHaveAttribute(
    'href',
    '/carta',
  );
  await expect(page.getByRole('link', { name: 'ORDENAR AHORA' }).first()).toHaveAttribute(
    'href',
    /https:\/\/wa.me\/51947540597/,
  );
  await expect(page.locator('.hero-media img')).toBeVisible();
  expect(
    await page
      .locator('.hero-media img')
      .evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0),
  ).toBe(true);
  await expect(page.locator('a[href=""],a[href="#"]')).toHaveCount(0);
});
test('Rutas, categoría vacía y recuperación de 404', async ({ page }) => {
  for (const route of ['carta', 'promociones', 'nosotros', 'locales', 'contacto']) {
    await page.goto('/' + route);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page).toHaveTitle(/Leñas y Sabores/);
  }
  await page.goto('/carta?categoria=Bebidas');
  await expect(page.getByText('Estamos preparando esta selección.')).toBeVisible();
  await page.getByRole('link', { name: 'Ver todas' }).click();
  await expect(page.locator('.product-card')).toHaveCount(3);
  await page.goto('/no-existe');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,follow');
  await page.getByRole('link', { name: 'VOLVER AL INICIO' }).click();
  await expect(page).toHaveURL('/');
});
test('Menú móvil con teclado y cambio de ruta', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const button = page.getByRole('button', { name: 'Abrir menú' });
  await button.click();
  await expect(page.getByRole('navigation', { name: 'Navegación principal' })).toBeVisible();
  await page
    .getByRole('navigation', { name: 'Navegación principal' })
    .getByRole('link', { name: 'Carta', exact: true })
    .focus();
  await page.keyboard.press('Escape');
  await expect(button).toBeFocused();
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await button.click();
  await page
    .getByRole('navigation', { name: 'Navegación principal' })
    .getByRole('link', { name: 'Contacto', exact: true })
    .click();
  await expect(page).toHaveURL('/contacto');
  await expect(button).toHaveAttribute('aria-expanded', 'false');
});
test('Sin desbordamientos desde móvil hasta 4K y texto ampliado', async ({ page }) => {
  await page.goto('/');
  for (const width of [320, 375, 390, 430, 768, 1024, 1366, 1440, 1920, 2560, 3840]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addStyleTag({ content: 'html {font-size:200%}' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});
test('Accesibilidad automática en escritorio y móvil', async ({ page }) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of ['/', '/carta', '/contacto', '/no-existe']) {
      await page.goto(route);
      const result = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(result.violations).toEqual([]);
    }
  }
});
test('Capturas y preferencia de movimiento reducido', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: 'test-results/inicio-escritorio.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'test-results/inicio-movil.png', fullPage: true });
  for (const width of [768, 1024]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.screenshot({ path: `test-results/inicio-${width}.png`, fullPage: true });
  }
});
