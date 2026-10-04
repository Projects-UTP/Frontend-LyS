import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { operativoFixture, salonFixture, loginPersonal } from './operativo-fixtures';
test('administrador anula con motivo y conserva el pago y los fondos', async ({ browser }) => {
  test.setTimeout(90000);
  const salon = salonFixture(),
    contextos = await Promise.all([
      browser.newContext(),
      browser.newContext(),
      browser.newContext(),
    ]);
  const [mozo, caja, admin] = await Promise.all(contextos.map((c) => c.newPage()));
  try {
    await operativoFixture(mozo, salon, ['MOZO']);
    await operativoFixture(caja, salon, ['CAJA']);
    await operativoFixture(admin, salon, ['ADMINISTRADOR']);
    await loginPersonal(mozo);
    await loginPersonal(caja);
    await loginPersonal(admin);
    await mozo.getByRole('link', { name: /Mesa 01/ }).click();
    await mozo.getByRole('button', { name: 'Abrir nueva orden' }).click();
    await mozo.getByRole('button', { name: 'Añadir Un cuarto de pollo', exact: true }).click();
    await mozo.getByRole('button', { name: 'Guardar y revisar orden' }).click();
    await mozo.getByRole('button', { name: 'Confirmar y enviar a caja' }).click();
    await caja.getByRole('link', { name: 'Caja', exact: true }).click();
    await caja.getByLabel('Monto inicial (S/)', { exact: true }).fill('50');
    await caja.getByRole('button', { name: 'Abrir caja', exact: true }).click();
    await caja.getByRole('button', { name: 'Cobrar LYS-000002' }).click();
    await caja.getByLabel('Monto recibido (S/)', { exact: true }).fill('20');
    await caja.getByLabel('Confirmo que recibí y verifiqué este pago', { exact: true }).check();
    await caja.getByRole('button', { name: 'Registrar pago confirmado' }).click();
    await expect(caja.getByText('Pago registrado: APROBADO', { exact: true })).toBeVisible();
    await admin.getByRole('link', { name: 'Anulaciones', exact: true }).click();
    await admin.getByLabel('Código de pedido', { exact: true }).fill('lys-000002');
    await admin.getByRole('button', { name: 'Consultar pago', exact: true }).click();
    await expect(admin.getByRole('button', { name: 'Anular pago con motivo' })).toBeDisabled();
    await admin
      .getByLabel('Motivo de anulación', { exact: true })
      .fill('Cliente cancela antes de preparar');
    await expect(admin.getByRole('button', { name: 'Anular pago con motivo' })).toBeDisabled();
    await admin.getByLabel('Confirmo la anulación de este pago', { exact: true }).check();
    for (const width of [390, 1366]) {
      await admin.setViewportSize({ width, height: 900 });
      expect(await admin.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      expect((await new AxeBuilder({ page: admin }).analyze()).violations).toEqual([]);
      await admin.screenshot({ path: `test-results/s5-anulacion-${width}.png`, fullPage: true });
    }
    await admin.getByRole('button', { name: 'Anular pago con motivo' }).click();
    await expect(
      admin.getByText('Pago anulado; registro conservado.', { exact: true }),
    ).toBeVisible();
    await expect(
      admin.getByText('Motivo: Cliente cancela antes de preparar', { exact: true }),
    ).toBeVisible();
    expect(salon.pagos.size).toBe(1);
    expect([...salon.pagos.values()][0].estado).toBe('ANULADO');
    expect(salon.mesas[0].estado).toBe('LIBRE');
    expect(salon.caja?.fondos_anulados).toBe(19.9);
    expect(salon.caja?.total_ventas).toBe(0);
    expect(salon.caja?.efectivo_esperado).toBe(69.9);
    expect(salon.caja?.total_esperado).toBe(69.9);
    await admin.screenshot({ path: 'test-results/s5-pago-anulado.png', fullPage: true });
    await expect(admin.getByRole('button', { name: 'Anular pago con motivo' })).toHaveCount(0);
  } finally {
    await Promise.all(contextos.map((c) => c.close()));
  }
});
test('cajero no puede abrir anulaciones ni consultar su RPC', async ({ page }) => {
  await operativoFixture(page, salonFixture(), ['CAJA']);
  await loginPersonal(page);
  await expect(page.getByRole('link', { name: 'Anulaciones', exact: true })).toHaveCount(0);
  let consultas = 0;
  page.on('request', (r) => {
    if (r.url().includes('consultar_pago_administrador')) consultas++;
  });
  await page.goto('/operativo/anulaciones');
  await expect(page.getByRole('heading', { name: 'Sin acceso a anulaciones' })).toBeVisible();
  expect(consultas).toBe(0);
});
