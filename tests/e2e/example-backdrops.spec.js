import { test, expect } from '@playwright/test';

/* Regresión post-merge: el ejemplo "Saludo con fondos" usa "siguiente fondo",
   pero el proyecto arrancaba con un solo fondo (`blank`): ciclar una lista de
   uno no cambia nada. El ejemplo debe traer sus fondos al cargarse. */

async function boot(page) {
  await page.goto('/');
  await page.waitForFunction(() => window.MBBlocks && window.MBBlocks.active() && window.MBExamples);
}

test('cargar "esc-fondos-saludo" trae tres fondos y la bandera los cicla', async ({ page }) => {
  await boot(page);

  const loaded = await page.evaluate(() => window.MBExamples.load('esc-fondos-saludo', { force: true }));
  expect(loaded).toBe(true);

  // Tres tarjetas en el panel de fondos (el "+" no cuenta).
  await page.locator('[data-target-tab="background"]').click();
  const cards = page.locator('#backdropList .bg-card:not(.bg-card--add)');
  await expect(cards).toHaveCount(3);
  await expect(cards.nth(0)).toHaveAttribute('data-backdrop-id', 'blank');
  await expect(cards.nth(1)).toHaveAttribute('data-backdrop-id', 'grid');
  await expect(cards.nth(2)).toHaveAttribute('data-backdrop-id', 'sky');

  // Normaliza el estado: detén la simulación que arrancó el ejemplo y pon el
  // lienzo blanco como fondo activo.
  await page.locator('#stopBtn').click();
  await cards.first().click();
  const stage = page.locator('#stageCanvasBox');
  await expect(stage).not.toHaveClass(/backdrop-grid|backdrop-sky/);
  const before = await stage.getAttribute('class');

  // Bandera: el bucle "siguiente fondo" cambia el fondo visible.
  await page.locator('#runBtn').click();
  await expect.poll(() => stage.getAttribute('class'), {
    message: 'la bandera no cambió el fondo del escenario'
  }).not.toBe(before);
  await expect(stage).toHaveClass(/backdrop-grid|backdrop-sky/);
});
