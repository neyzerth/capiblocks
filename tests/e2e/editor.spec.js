import { test, expect } from '@playwright/test';

async function boot(page) {
  await page.goto('/');
  await page.waitForFunction(() => window.MBBlocks && window.MBBlocks.active());
}

async function addFromPalette(page, catIndex, itemIndex = 0) {
  await page.locator('.toolbox-categories button').nth(catIndex).click();
  await page.locator('#flyoutBlocks button').nth(itemIndex).click();
  const close = page.locator('#flyoutCloseBtn');
  if (await close.isVisible()) await close.click();
}

async function topBlockRects(page) {
  return page.evaluate(() => Blockly.getMainWorkspace().getTopBlocks(true).map((b) => {
    const r = b.getSvgRoot().getBoundingClientRect();
    return { type: b.type, x: r.x, y: r.y, w: r.width, h: r.height };
  }));
}

test('carga la app con el motor de bloques activo', async ({ page }) => {
  await boot(page);
  await expect(page).toHaveTitle(/capiBlocks/);
  await expect(page.locator('.toolbox-categories button')).toHaveCount(13);
  await expect(page.locator('#blocklyDiv svg.blocklySvg')).toBeVisible();
});

test('añadir un bloque con clic y ver el Python', async ({ page }) => {
  await boot(page);
  await addFromPalette(page, 1); // LED
  await expect.poll(() => page.evaluate(() => MBBlocks.count())).toBe(1);
  await expect(page.locator('#blockCountNum')).toHaveText('1');
  const py = await page.evaluate(() => MBBlocks.python());
  expect(py).toContain('cyberpi.led.on');
});

test('arrastrar un bloque desde la paleta al lienzo', async ({ page }) => {
  await boot(page);
  await page.locator('.toolbox-categories button').nth(1).click();
  const item = page.locator('#flyoutBlocks button').first();
  const from = await item.boundingBox();
  const canvas = await page.locator('#blocksCanvas').boundingBox();

  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(canvas.x + canvas.width * 0.6, canvas.y + canvas.height * 0.35, { steps: 12 });
  await page.mouse.up();

  await expect.poll(() => page.evaluate(() => MBBlocks.count())).toBe(1);
  await expect(page.locator('.flyout-drag-ghost')).toHaveCount(0);
});

test('arrastrar un bloque sobre otro los encaja en una pila', async ({ page }) => {
  await boot(page);
  await addFromPalette(page, 1, 0);
  await addFromPalette(page, 1, 1);
  await expect.poll(async () => (await topBlockRects(page)).length).toBe(2);

  const [first, second] = (await topBlockRects(page)).sort((a, b) => a.y - b.y);
  const grabX = second.x + 8;
  const grabY = second.y + 10;
  await page.mouse.move(grabX, grabY);
  await page.mouse.down();
  await page.waitForTimeout(120);
  await page.mouse.move(first.x + 8, first.y + first.h + 2 + (grabY - second.y), { steps: 14 });
  await page.mouse.up();

  await expect.poll(async () => (await topBlockRects(page)).length).toBe(1);
});

test('editor Python con resaltado de sintaxis y Tab', async ({ page }) => {
  await boot(page);
  await addFromPalette(page, 1);
  await page.locator('[data-editor-mode="python"]').click();

  const pane = page.locator('#pythonEditorPane');
  await expect(pane.locator('.CodeMirror')).toBeVisible();
  await expect(pane.locator('.cm-keyword').first()).toHaveText('import');
  await expect(pane.locator('.CodeMirror-linenumber').first()).toBeVisible();

  await pane.locator('.CodeMirror-code').click();
  await page.keyboard.press('Control+End');
  await page.keyboard.press('Tab');
  const value = await page.evaluate(() => MBPythonEditor.getValue());
  expect(value.endsWith('    ')).toBe(true);
});

test('guardar en el navegador y restaurar al recargar', async ({ page }) => {
  await boot(page);
  await addFromPalette(page, 1);
  await page.locator('#projectInput').fill('Clase IoT');
  await page.locator('#saveBtn').click();
  await expect(page.locator('#toastBanner')).toContainText(/guardado|saved/i);

  await page.reload();
  await page.waitForFunction(() => window.MBBlocks && window.MBBlocks.active());
  await expect.poll(() => page.evaluate(() => MBBlocks.count())).toBe(1);
  await expect(page.locator('#projectInput')).toHaveValue('Clase IoT');
});

test('los ejemplos cargan bloques reales y piden confirmación antes de reemplazar', async ({ page }) => {
  const openExamples = () => page.locator('[data-modal-open="examplesModal"]').click();

  await boot(page);
  await openExamples();
  await page.locator('[data-load-example="leds"]').click();
  await expect.poll(() => page.evaluate(() => MBBlocks.count())).toBe(5);
  expect(await page.evaluate(() => MBBlocks.python())).toContain('¡Hola desde ESP32!');

  await openExamples();
  await page.locator('[data-load-example="counter"]').click();
  await expect(page.locator('#replaceModal')).toBeVisible();
  await page.locator('#replaceCancelBtn').click();
  await expect.poll(() => page.evaluate(() => MBBlocks.count())).toBe(5);

  await openExamples();
  await page.locator('[data-load-example="counter"]').click();
  await page.locator('#replaceOkBtn').click();
  await expect.poll(() => page.evaluate(() => MBBlocks.count())).toBe(6);
  expect(await page.evaluate(() => MBBlocks.python())).toContain('for i in range(5)');
});

test('ESP32 es el dispositivo fijado y CyberPi se puede añadir', async ({ page }) => {
  await boot(page);
  await expect(page.locator('#deviceListCol .mtarget-card .mtarget-name')).toHaveText(['ESP32']);

  await page.locator('#addDeviceBtn').click();
  const cyber = page.locator('#deviceLibraryGrid .example-card', { hasText: 'CyberPi' });
  await cyber.getByRole('button').click();
  await expect(page.locator('#deviceListCol .mtarget-card .mtarget-name')).toHaveText(['ESP32', 'CyberPi']);
});

test('no hay scroll lateral a 390 px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('.toolbox-categories button')).toHaveCount(13);
  const overflow = await page.evaluate(() => document.scrollingElement.scrollWidth > window.innerWidth + 1);
  expect(overflow).toBe(false);
});

test('no hace peticiones a internet', async ({ page }) => {
  const external = [];
  page.on('request', (req) => {
    const url = req.url();
    if (!url.startsWith('http://127.0.0.1:') && !url.startsWith('data:')) external.push(url);
  });
  await boot(page);
  await addFromPalette(page, 1);
  await page.waitForTimeout(500);
  expect(external).toEqual([]);
});
