import { test, expect } from '@playwright/test';

/* codegen por dispositivo (T1) y paleta filtrada (T2). Los helpers buscan la
   categoría por etiqueta porque el orden del toolbox cambia con el dispositivo. */

async function boot(page) {
  await page.goto('/');
  await page.waitForFunction(() => window.MBBlocks && window.MBBlocks.active());
}

async function addFromPalette(page, label, itemIndex = 0) {
  await page.locator('.toolbox-categories button').filter({ hasText: label }).first().click();
  await page.locator('#flyoutBlocks button').nth(itemIndex).click();
  const close = page.locator('#flyoutCloseBtn');
  if (await close.isVisible()) await close.click();
}

async function addCyberPi(page) {
  await page.locator('#addDeviceBtn').click();
  await page.locator('#deviceLibraryGrid .example-card', { hasText: 'CyberPi' }).getByRole('button').click();
  await page.locator('#addDeviceModal [data-modal-close]').first().click();
  await page.locator('#deviceListCol .mtarget-card', { hasText: 'CyberPi' }).click();
}

test('ESP32 por defecto: python sin cyberpi y con sección de arranque', async ({ page }) => {
  await boot(page);
  const py = await page.evaluate(() => MBBlocks.python());
  expect(py).toContain('# capiBlocks → MicroPython (ESP32)');
  expect(py).toContain('import machine, time');
  expect(py).not.toContain('cyberpi');
  expect(py).toContain('# --- capiBlocks: arranque ---');
});

test('un sombrero en ESP32 genera def on_flag y su llamada al final', async ({ page }) => {
  await boot(page);
  await addFromPalette(page, /Events|Eventos|事件/);
  const py = await page.evaluate(() => MBBlocks.python());
  expect(py).not.toContain('cyberpi');
  expect(py).not.toContain('@event');
  expect(py).toContain('def on_flag():');
  expect(py).toContain('on_flag()');
});

test('al cambiar a CyberPi vuelve el python de cyberpi y viceversa', async ({ page }) => {
  await boot(page);
  await addFromPalette(page, /Events|Eventos|事件/);

  await addCyberPi(page);
  const py = await page.evaluate(() => MBBlocks.python());
  expect(py).toContain('import cyberpi, event, time');
  expect(py).toContain('@event.start');

  await page.locator('#deviceListCol .mtarget-card', { hasText: 'ESP32' }).click();
  const back = await page.evaluate(() => MBBlocks.python());
  expect(back).not.toContain('cyberpi');
  expect(back).toContain('def on_flag():');
});

test('con ESP32 la paleta solo muestra las categorías del ESP32', async ({ page }) => {
  await boot(page);
  await expect(page.locator('.toolbox-categories button')).toHaveCount(6);
  await expect(page.locator('.toolbox-categories button', { hasText: /LED/ })).toHaveCount(0);
  await expect(page.locator('.toolbox-categories button', { hasText: /Audio|音频/ })).toHaveCount(0);
});

test('la paleta sigue al dispositivo: CyberPi 13 categorías, ESP32 6', async ({ page }) => {
  await boot(page);
  await addCyberPi(page);
  await expect(page.locator('.toolbox-categories button')).toHaveCount(13);
  await expect(page.locator('.toolbox-categories button', { hasText: /LED/ })).toHaveCount(1);

  await page.locator('#deviceListCol .mtarget-card', { hasText: 'ESP32' }).click();
  await expect(page.locator('.toolbox-categories button')).toHaveCount(6);
});

/* --- T3: pines --- */

test('los bloques de pines generan GPIO y PWM con sus valores por defecto', async ({ page }) => {
  await boot(page);
  await addFromPalette(page, /Pins|Pines|引脚/);
  await addFromPalette(page, /Pins|Pines|引脚/, 5); // servo
  const py = await page.evaluate(() => MBBlocks.python());
  expect(py).toContain('from machine import Pin, PWM, ADC');
  expect(py).toContain('Pin(2, Pin.OUT).value(1)');
  expect(py).toContain('PWM(Pin(2), 50).duty(int(25.6 + 90 * 0.568))');
});
