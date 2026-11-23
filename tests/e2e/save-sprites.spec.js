import { test, expect } from '@playwright/test';

const PLANE = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="#4c97ff"/></svg>'
);

async function boot(page) {
  await page.goto('/');
  await page.waitForFunction(() => window.MBBlocks && window.MBBlocks.active() && window.MBSprites && window.MBBackdrops);
}

/* Proyecto con 2 sprites (Capi + uno subido) y 2 fondos (blanco + bosque). */
test('guardar y recargar conserva sprites y fondos', async ({ page }) => {
  await boot(page);

  const spriteId = await page.evaluate((asset) => window.MBSprites.add({
    name: 'Avión', x: 24, y: 12, asset
  }), PLANE);
  await page.evaluate(() => window.MBBackdrops.add('forest'));
  await expect.poll(() => page.evaluate(() => window.MBBackdrops.active())).toBe('forest');
  await expect(page.locator('#stageCanvasBox')).toHaveClass(/backdrop-asset/);

  await page.locator('#projectInput').fill('Objetos y fondo');
  await page.locator('#saveBtn').click();
  await expect(page.locator('#toastBanner')).toContainText(/guardado|saved|已保存/i);

  await page.reload();
  await page.waitForFunction(() => window.MBSprites && window.MBBackdrops);

  // Sprites: los dos vuelven y el que estaba activo sigue activo.
  expect(await page.evaluate(() => window.MBSprites.active())).toBe(spriteId);
  const cards = page.locator('#spriteList .mtarget-card:not(.mtarget-card--add)');
  await expect(cards).toHaveCount(2);
  await expect(cards.nth(0).locator('.mtarget-name')).toHaveText('Capi');
  await expect(cards.nth(1).locator('.mtarget-name')).toHaveText('Avión');
  await expect(cards.nth(1)).toHaveClass(/selected/);
  await expect(cards.nth(1).locator('.mtarget-thumb img')).toHaveAttribute('src', /^data:image\/svg\+xml/);

  // Inputs de propiedades sincronizados con el sprite activo.
  await expect(page.locator('#spriteNameInput')).toHaveValue('Avión');
  await expect(page.locator('#spriteXInput')).toHaveValue('24');
  await expect(page.locator('#spriteYInput')).toHaveValue('12');

  // Fondos: los dos vuelven, el activo pinta su imagen y la lista/contador coinciden.
  expect(await page.evaluate(() => window.MBBackdrops.list())).toEqual(['blank', 'forest']);
  expect(await page.evaluate(() => window.MBBackdrops.active())).toBe('forest');
  await expect(page.locator('#stageCanvasBox')).toHaveClass(/backdrop-asset/);
  expect(await page.evaluate(() => document.querySelector('#stageCanvasBox').style.backgroundImage))
    .toContain('assets/backdrops/forest.png');
  const bgCards = page.locator('#backdropList .bg-card:not(.bg-card--add)');
  await expect(bgCards).toHaveCount(2);
  await expect(page.locator('#backdropList .bg-card[data-backdrop-id="forest"]')).toHaveClass(/selected/);
  await expect(page.locator('#backdropCountText')).toContainText('2');

  // El nombre del proyecto también sobrevive.
  await expect(page.locator('#projectInput')).toHaveValue('Objetos y fondo');
});

/* Compatibilidad hacia atrás: proyecto guardado antes de existir sprites/fondos. */
test('un payload viejo sin sprites ni fondos abre con Capi y lienzo blanco', async ({ page }) => {
  await boot(page);

  await page.evaluate(() => {
    localStorage.setItem('mblock.lastProject', JSON.stringify({
      name: 'Proyecto viejo',
      lang: 'es',
      device: 'esp32',
      blocks: [],
      savedAt: '2025-01-01T00:00:00.000Z'
    }));
  });

  const errors = [];
  page.on('pageerror', (err) => errors.push(String(err)));
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });

  await page.reload();
  await page.waitForFunction(() => window.MBSprites && window.MBBackdrops);

  const sprites = await page.evaluate(() => window.MBSprites.list());
  expect(sprites).toHaveLength(1);
  expect(sprites[0].id).toBe('capi');
  expect(sprites[0].name).toBe('Capi');
  expect(await page.evaluate(() => window.MBSprites.active())).toBe('capi');
  await expect(page.locator('#spriteList .mtarget-card:not(.mtarget-card--add)')).toHaveCount(1);
  await expect(page.locator('#spriteList .mtarget-card:not(.mtarget-card--add) .mtarget-name')).toHaveText('Capi');

  expect(await page.evaluate(() => window.MBBackdrops.list())).toEqual(['blank']);
  expect(await page.evaluate(() => window.MBBackdrops.active())).toBe('blank');
  await expect(page.locator('#backdropList .bg-card:not(.bg-card--add)')).toHaveCount(1);
  await expect(page.locator('#stageCanvasBox')).not.toHaveClass(/backdrop-asset|backdrop-grid|backdrop-sky|backdrop-night/);
  await expect(page.locator('#projectInput')).toHaveValue('Proyecto viejo');

  expect(errors).toEqual([]);
});
