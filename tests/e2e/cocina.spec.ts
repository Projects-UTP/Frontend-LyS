import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {
  operativoFixture,
  salonFixture,
  loginPersonal,
  notificarSalon,
} from './operativo-fixtures';
test('mozo caja cocina mozo finalizan la misma orden y liberan su mesa', async ({ browser }) => {
  test.setTimeout(90000);
  const salon = salonFixture();
  const contextos = await Promise.all([
    browser.newContext(),
    browser.newContext(),
    browser.newContext(),
  ]);
  const [mozo, caja, cocina] = await Promise.all(contextos.map((c) => c.newPage()));
  await operativoFixture(mozo, salon, ['MOZO']);
  await operativoFixture(caja, salon, ['CAJA']);
  await operativoFixture(cocina, salon, ['COCINA']);
  try {
    await loginPersonal(mozo);
    await loginPersonal(caja);
    await loginPersonal(cocina);
    await cocina.getByRole('link', { name: 'Cocina', exact: true }).click();
    await expect(cocina.getByRole('status').filter({ hasText: 'Conectado' })).toBeVisible();
    await expect(cocina.getByRole('article')).toHaveCount(0);
    await mozo.getByRole('link', { name: /Mesa 01/, exact: false }).click();
    await mozo.getByRole('button', { name: 'Abrir nueva orden' }).click();
    await mozo.getByRole('button', { name: 'Añadir Un cuarto de pollo', exact: true }).click();
    await mozo
      .getByLabel('Observaciones de Un cuarto de pollo', { exact: true })
      .fill('Papas aparte');
    await mozo.getByLabel('Observaciones del pedido', { exact: true }).fill('Sin sal');
    await mozo.getByRole('button', { name: 'Guardar y revisar orden' }).click();
    await mozo.getByRole('button', { name: 'Confirmar y enviar a caja' }).click();
    await expect(mozo.getByText('Orden enviada a caja.', { exact: false })).toBeVisible();
    await cocina.getByRole('button', { name: 'Actualizar cocina' }).click();
    await expect(cocina.getByRole('article')).toHaveCount(0);
    await caja.getByRole('link', { name: 'Caja', exact: true }).click();
    await caja.getByLabel('Monto inicial (S/)', { exact: true }).fill('0');
    await caja.getByRole('button', { name: 'Abrir caja', exact: true }).click();
    await caja.getByRole('button', { name: 'Cobrar LYS-000002' }).click();
    await caja.getByRole('combobox', { name: /Método de pago/ }).selectOption('YAPE');
    await caja.getByLabel('Confirmo que recibí y verifiqué este pago', { exact: true }).check();
    await caja.getByRole('button', { name: 'Registrar pago confirmado' }).click();
    await expect(caja.getByText('Pago registrado: APROBADO', { exact: true })).toBeVisible();
    const tarjeta = cocina.getByRole('article', { name: 'Pedido LYS-000002' });
    await expect(tarjeta).toContainText('Papas aparte');
    await expect(tarjeta).toContainText('Sin sal');
    let lecturas = 0;
    cocina.on('request', (r) => {
      if (r.url().endsWith('/consultar_cocina')) lecturas++;
    });
    notificarSalon(salon);
    notificarSalon(salon);
    await expect(tarjeta).toContainText('Papas aparte');
    expect(lecturas).toBe(0);
    for (const width of [768, 1024, 1366, 1920]) {
      await cocina.setViewportSize({ width, height: 1000 });
      expect(await cocina.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      expect((await new AxeBuilder({ page: cocina }).analyze()).violations).toEqual([]);
      if (width === 1366)
        await cocina.screenshot({ path: 'test-results/s5-kds-nuevo.png', fullPage: true });
    }
    await cocina.getByRole('button', { name: 'Iniciar preparación LYS-000002' }).click();
    await expect(
      cocina.getByRole('region', { name: 'En preparación' }).getByRole('article'),
    ).toHaveCount(1);
    expect(lecturas).toBe(1);
    await cocina.screenshot({ path: 'test-results/s5-kds-preparacion.png', fullPage: true });
    await cocina.getByRole('button', { name: 'Marcar listo LYS-000002' }).click();
    await expect(cocina.getByRole('region', { name: 'Listos' }).getByRole('article')).toHaveCount(
      1,
    );
    await cocina.screenshot({ path: 'test-results/s5-kds-listo.png', fullPage: true });
    expect(salon.mesas[0].estado).toBe('OCUPADA');
    await expect(
      mozo.getByRole('status').filter({ hasText: '1 pedidos listos para entregar' }),
    ).toBeVisible();
    await mozo.getByRole('link', { name: 'Pedidos listos', exact: true }).click();
    await expect(mozo.getByRole('article')).toContainText('LYS-000002');
    await mozo.setViewportSize({ width: 390, height: 844 });
    expect((await new AxeBuilder({ page: mozo }).analyze()).violations).toEqual([]);
    await mozo.screenshot({ path: 'test-results/s5-aviso-mozo.png', fullPage: true });
    await expect(mozo.getByRole('button', { name: 'Registrar entrega LYS-000002' })).toBeDisabled();
    await mozo.getByLabel('Confirmo la entrega de LYS-000002').check();
    await mozo.getByRole('button', { name: 'Registrar entrega LYS-000002' }).click();
    await expect(
      mozo.getByRole('status').filter({ hasText: '0 pedidos listos', hasNotText: 'para entregar' }),
    ).toBeVisible();
    expect(salon.orden?.estado_pedido).toBe('FINALIZADO');
    expect(salon.mesas[0].estado).toBe('LIBRE');
    await mozo.getByRole('link', { name: 'Mesas', exact: true }).click();
    await expect(mozo.getByRole('link', { name: /Mesa 01/ })).toContainText(/LIBRE/i);
    await mozo.screenshot({ path: 'test-results/s5-mesa-liberada.png', fullPage: true });
  } finally {
    await Promise.all(contextos.map((c) => c.close()));
  }
});
