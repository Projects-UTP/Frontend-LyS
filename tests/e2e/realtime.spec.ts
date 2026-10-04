import { test, expect } from '@playwright/test';
import { operativoFixture, salonFixture, loginPersonal } from './operativo-fixtures';
test('recupera consultas visibles cada treinta segundos sin sondeo por segundo', async ({
  page,
}) => {
  const salon = salonFixture();
  await operativoFixture(page, salon);
  await page.clock.install();
  let consultas = 0;
  page.on('request', (r) => {
    if (r.url().includes('/records/mesas')) consultas++;
  });
  await loginPersonal(page);
  await expect(page.getByRole('status').filter({ hasText: 'Conectado' })).toBeVisible();
  salon.conexionDisponible = false;
  salon.conexiones.forEach((c) => c());
  await expect(
    page.getByRole('status').filter({ hasText: 'Conexión en recuperación' }),
  ).toBeVisible();
  const anteriores = consultas;
  salon.mesas[0].nombre = 'Mesa de prueba actualizada';
  await page.clock.fastForward(29000);
  expect(consultas).toBe(anteriores);
  await page.clock.fastForward(2000);
  await expect(page.getByRole('link', { name: /Mesa de prueba actualizada/ })).toBeVisible();
  expect(consultas - anteriores).toBeLessThanOrEqual(1);
  salon.conexionDisponible = true;
  await page.evaluate(() => window.dispatchEvent(new Event('online')));
  await expect(page.getByRole('status').filter({ hasText: 'Conectado' })).toBeVisible();
  await page.screenshot({ path: 'test-results/s5-realtime-recuperado.png', fullPage: true });
  await page.getByRole('button', { name: 'Cerrar sesión', exact: true }).click();
  await expect(page).toHaveURL(/iniciar-sesion/);
  await expect.poll(() => salon.suscriptores.size).toBe(0);
});
