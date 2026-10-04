import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { loginPersonal, operativoFixture } from './operativo-fixtures';
test('mozo crea orden, revisa observaciones, envía a caja y corrige antes del pago', async ({
  page,
}) => {
  test.setTimeout(60000);
  const salon = await operativoFixture(page);
  await loginPersonal(page);
  await page.getByRole('link', { name: 'Mesa 01, LIBRE', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Nueva orden' })).toBeVisible();
  await page.screenshot({ path: 'test-results/s4-nueva-orden.png', fullPage: true });
  await page.getByRole('button', { name: 'Abrir nueva orden' }).click();
  await expect(page.getByRole('heading', { name: 'Seleccionar productos' })).toBeVisible();
  await page.getByLabel('Buscar producto', { exact: true }).fill('pollo');
  await page.getByRole('button', { name: 'Añadir Pollo entero', exact: true }).click();
  await page.getByRole('button', { name: 'Incrementar Pollo entero', exact: true }).click();
  await page.getByLabel('Observaciones de Pollo entero', { exact: true }).fill('Papas aparte');
  await page.getByLabel('Observaciones del pedido', { exact: true }).fill('Sin mayonesa');
  await page.screenshot({ path: 'test-results/s4-seleccion-productos.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 1000 });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/s4-seleccion-movil.png', fullPage: true });
  await page.getByRole('button', { name: 'Guardar y revisar orden' }).click();
  await expect(page.getByText('Total del servidor:', { exact: false })).toContainText('119.80');
  await expect(page.getByText('Papas aparte', { exact: true })).toBeVisible();
  for (const width of [360, 390, 430, 768, 1366, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    if ([390, 1366].includes(width))
      await page.screenshot({ path: `test-results/s4-resumen-${width}.png`, fullPage: true });
  }
  await page.getByRole('button', { name: 'Confirmar y enviar a caja' }).click();
  await expect(page.getByText('Orden enviada a caja.', { exact: false })).toBeVisible();
  expect(salon.orden?.estado_pago).toBe('PENDIENTE');
  await page.screenshot({ path: 'test-results/s4-pendiente-pago.png', fullPage: true });
  await page.getByRole('button', { name: 'Editar productos y observaciones' }).click();
  await page.getByRole('button', { name: 'Reducir Pollo entero', exact: true }).click();
  await page
    .getByLabel('Motivo de la corrección', { exact: true })
    .fill('Cliente pidió una unidad');
  await page.getByRole('button', { name: 'Guardar y revisar orden' }).click();
  await expect(page.getByText('Total del servidor:', { exact: false })).toContainText('59.90');
  await page.getByRole('link', { name: 'Volver al salón' }).click();
  await expect(page.getByRole('link', { name: 'Mesa 01, POR COBRAR', exact: true })).toContainText(
    'LYS-000002',
  );
});
