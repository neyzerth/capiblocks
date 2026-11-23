import { test, expect } from '@playwright/test';

async function boot(page) {
  await page.goto('/');
  await page.waitForFunction(() => window.MBBlocks && window.MBBlocks.active() && window.MBSprites && window.MBBackdrops);
}

async function openBackgroundTab(page) {
  await page.locator('[data-target-tab="background"]').click();
  await expect(page.locator('#paneBackground')).toBeVisible();
}

async function openBackdropLibrary(page) {
  await page.locator('#backdropList .bg-card--add').click();
  await expect(page.locator('#backdropLibraryModal')).toBeVisible();
}

test('pestaña Fondo: lista de fondos, contador, biblioteca y ciclo con "siguiente fondo"', async ({ page }) => {
  await boot(page);
  await openBackgroundTab(page);

  const modal = page.locator('#backdropLibraryModal');
  const cards = page.locator('#backdropGrid .asset-card');
  const okBtn = page.locator('#backdropLibraryOkBtn');
  const listCards = page.locator('#backdropList .bg-card:not(.bg-card--add)');
  const count = page.locator('#backdropCountText');
  const stage = page.locator('#stageCanvasBox');

  // 1. Estado inicial: un solo fondo (Lienzo blanco), activo, con swatch y contador en 1.
  await expect(listCards).toHaveCount(1);
  await expect(listCards.first()).toHaveAttribute('data-backdrop-id', 'blank');
  await expect(listCards.first()).toHaveClass(/selected/);
  await expect(listCards.first().locator('.bg-swatch')).toHaveCount(1);
  await expect(count).toHaveText(/1/);

  // 2. "+" abre el modal con los 12 fondos del catálogo, 7 pills y Aceptar apagado.
  await openBackdropLibrary(page);
  await expect(modal.locator('#backdropLibraryTitle')).toHaveText(/Backdrop Library|Biblioteca de fondos|背景库/);
  await expect(cards).toHaveCount(12);
  await expect(page.locator('#backdropCats .cat-pill')).toHaveCount(7);
  await expect(page.locator('#backdropCats .cat-pill[data-cat="all"]')).toHaveClass(/active/);
  await expect(okBtn).toBeDisabled();
  await expect(page.locator('#backdropPaintBtn')).toBeDisabled();
  await expect(page.locator('#backdropUploadBtn')).toBeDisabled();
  await expect(page.locator('#backdropPaintBtn')).toHaveAttribute('title', /próximamente|coming soon|即将推出/);

  // 3. Búsqueda sin acentos y filtro por categoría Naturaleza (sky + 4 assets).
  await page.locator('#backdropLibrarySearch').fill('bosque');
  await expect(cards).toHaveCount(1);
  await expect(cards.first().locator('.asset-name')).toHaveText('Bosque');
  await expect(cards.first().locator('img')).toHaveAttribute('src', 'assets/backdrops/forest.png');
  await page.locator('#backdropLibrarySearch').fill('');
  await page.locator('#backdropCats .cat-pill[data-cat="naturaleza"]').click();
  await expect(cards).toHaveCount(5);
  await page.locator('#backdropCats .cat-pill[data-cat="all"]').click();
  await expect(cards).toHaveCount(12);

  // 4. Elegir Bosque + Aceptar: se añade al proyecto, queda activo y pinta el escenario.
  await page.locator('#backdropLibrarySearch').fill('bosque');
  await expect(cards).toHaveCount(1);
  await cards.first().click();
  await expect(cards.first()).toHaveClass(/selected/);
  await expect(okBtn).toBeEnabled();
  await okBtn.click();
  await expect(modal).toBeHidden();
  await expect(listCards).toHaveCount(2);
  await expect(count).toHaveText(/2/);
  await expect(listCards.nth(1)).toHaveAttribute('data-backdrop-id', 'forest');
  await expect(listCards.nth(1)).toHaveClass(/selected/);
  await expect(listCards.nth(1).locator('img')).toHaveAttribute('src', 'assets/backdrops/forest.png');
  await expect(stage).toHaveCSS('background-image', /assets\/backdrops\/forest\.png/);

  // 5. Click en la miniatura de Lienzo blanco: vuelve al preset y quita la imagen.
  await listCards.first().click();
  await expect(listCards.first()).toHaveClass(/selected/);
  await expect(listCards.nth(1)).not.toHaveClass(/selected/);
  await expect(stage).toHaveCSS('background-image', 'none');

  // 6. Sin duplicados: volver a elegir Bosque solo lo activa (siguen 2 fondos).
  await openBackdropLibrary(page);
  await page.locator('#backdropLibrarySearch').fill('bosque');
  await cards.first().click();
  await okBtn.click();
  await expect(modal).toBeHidden();
  await expect(listCards).toHaveCount(2);
  await expect(listCards.nth(1)).toHaveClass(/selected/);

  // 7. El bloque real "siguiente fondo" cicla la lista del proyecto (no el catálogo).
  await page.locator('.toolbox-categories button').nth(1).click();
  await page.locator('#flyoutBlocks button').nth(2).click();
  const close = page.locator('#flyoutCloseBtn');
  if (await close.isVisible()) await close.click();
  await expect.poll(() => page.evaluate(() => MBBlocks.count())).toBe(1);
  expect(await page.evaluate(() => MBBlocks.python())).toContain('stage.next_backdrop()');

  await page.locator('#runBtn').click();
  await expect(listCards.first()).toHaveClass(/selected/);
  await expect(stage).toHaveCSS('background-image', 'none');

  await page.locator('#runBtn').click();
  await expect(listCards.nth(1)).toHaveClass(/selected/);
  await expect(stage).toHaveCSS('background-image', /assets\/backdrops\/forest\.png/);

  // 8. A 390 px el modal no genera scroll lateral y cabe en el viewport.
  await openBackdropLibrary(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(modal).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  const box = await modal.locator('.modal-box-library').boundingBox();
  expect(box.width).toBeLessThanOrEqual(390);
});
