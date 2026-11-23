import { test, expect } from '@playwright/test';

/* e2e de la conexión serial (T12): un puerto falso implementa el REPL crudo de
   MicroPython tal como lo hace la placa real (Ctrl-A → '>', código + EOT →
   'OK' y '\x04>', Ctrl-B → amigable, Ctrl-D → banner + '>>> '). El fake se
   inyecta ANTES de que cargue la app, así MBSerial nunca ve un puerto nativo. */

async function boot(page) {
  await page.goto('/');
  await page.waitForFunction(() => window.MBBlocks && window.MBBlocks.active());
}

async function fakeSerial(page) {
  await page.addInitScript(() => {
    const log = [];
    window.__serialWrites = log;
    let mode = 'friendly';

    class FakePort {
      constructor() {
        this.readable = new ReadableStream({
          start(controller) {
            window.__fakeCtrl = controller;
          }
        });
        this.writable = new WritableStream({
          write(chunk) {
            const text = new TextDecoder().decode(chunk);
            log.push(text);
            const emit = (s) => window.__fakeCtrl.enqueue(new TextEncoder().encode(s));
            if (text.includes('\x01')) {
              mode = 'raw';
              emit('>');
              return;
            }
            if (text.includes('\x02')) {
              mode = 'friendly';
              emit('>>> ');
              return;
            }
            if (mode === 'raw') {
              if (text.endsWith('\x04')) {
                emit('OK');
                setTimeout(() => {
                  if (window.__fakeCtrl) emit('\x04>');
                }, 30);
              }
              return;
            }
            if (text === '\x04') {
              emit('MicroPython v1.29.0 on esp32\r\n>>> ');
              return;
            }
            emit('>>> ');
          }
        });
        this.open = async () => {
          window.__fakeOpened = true;
          // Una placa real imprime su banner al abrir el puerto (auto-reset).
          window.__fakeCtrl.enqueue(new TextEncoder().encode('MicroPython v1.29.0 on esp32\r\n'));
          window.__fakeCtrl.enqueue(new TextEncoder().encode('>>> '));
        };
        this.close = async () => {};
      }
    }

    Object.defineProperty(navigator, 'serial', {
      value: { requestPort: async () => new FakePort(), getPorts: async () => [] },
      configurable: true
    });
  });
}

/* Programa Live mínimo: sombrero + salida a un pin + bucle infinito que además
   pinta la tira LED (así se nota si la app simuló en vez de usar el puerto). */
async function loadLiveProgram(page) {
  const n = await page.evaluate(() =>
    MBBlocks.loadProgram([
      { id: 'evt_flag' },
      { id: 'esp32_pin_out', fields: { PIN: '2', LEVEL: '1' } },
      {
        id: 'ctrl_forever',
        do: [
          { id: 'esp32_neopixel_fill', fields: { PIN: '16', N: 8, COLOR: '#ff5252' } },
          { id: 'ctrl_wait', fields: { SECS: 0.5 } }
        ]
      }
    ])
  );
  expect(n).toBe(5);
}

const lastWrite = () => window.__serialWrites[window.__serialWrites.length - 1];

test('sin Web Serial el botón Conectar se deshabilita y lo explica', async ({ page }) => {
  await page.addInitScript(() => {
    delete Navigator.prototype.serial;
    delete navigator.serial;
  });
  await boot(page);

  const btn = page.locator('#serialConnectBtn');
  await expect(btn).toBeDisabled();
  await expect(btn).toHaveAttribute('title', /Web Serial/);
  await expect(btn).toHaveAttribute('title', /no soporta|does not support/);
  await expect(page.locator('#uploadToDeviceBtn')).toBeDisabled();
  await expect(page.locator('#serialConsoleBtn')).toBeDisabled();
});

test('conectar abre el puerto falso y la UI pasa a conectada', async ({ page }) => {
  await fakeSerial(page);
  await boot(page);

  await expect(page.locator('#deviceStatusText')).toHaveText(/Connect your device|Conecta tu dispositivo/);
  await expect(page.locator('#uploadToDeviceBtn')).toBeDisabled();

  await page.locator('#serialConnectBtn').click();

  await expect(page.locator('#serialConnectLabel')).toHaveText(/Connected|Conectado/);
  await expect(page.locator('#deviceStatusText')).toHaveText(/Device connected|Placa conectada/);
  await expect(page.locator('#uploadToDeviceBtn')).toBeEnabled();
  await expect(page.locator('#serialConsoleBtn')).toBeEnabled();
  expect(await page.evaluate(() => window.__fakeOpened)).toBe(true);
});

test('Live: con la placa conectada el programa va por el REPL y no al escenario', async ({ page }) => {
  await fakeSerial(page);
  await boot(page);
  await page.locator('#serialConnectBtn').click();
  await expect(page.locator('#serialConnectLabel')).toHaveText(/Connected|Conectado/);

  await loadLiveProgram(page);
  await page.locator('#runBtn').click();

  // replRun envía el código generado por el REPL crudo hasta el EOT.
  await expect
    .poll(() =>
      page.evaluate(() => {
        const w = window.__serialWrites;
        return w.some((t) => t.includes('while True:') && t.includes('Pin(2, Pin.OUT).value(1)'));
      })
    )
    .toBe(true);
  expect(await page.evaluate(() => window.__serialWrites.some((t) => t === '\x04'))).toBe(true);

  // La simulación del escenario no corre: la tira LED sigue oculta.
  await page.waitForTimeout(700);
  await expect(page.locator('#stageLedStrip')).toBeHidden();

  // replRun terminó (salió del REPL crudo con Ctrl-B) antes de detener.
  await expect
    .poll(() => page.evaluate(() => window.__serialWrites.some((t) => t === '\x02')))
    .toBe(true);

  await page.locator('#stopBtn').evaluate((el) => el.click());
  await expect.poll(() => page.evaluate(lastWrite)).toBe('\x03');
});

test('Subir: escribe main.py en base64 y termina con el soft reset', async ({ page }) => {
  await fakeSerial(page);
  await boot(page);
  await page.locator('#serialConnectBtn').click();
  await expect(page.locator('#uploadToDeviceBtn')).toBeEnabled();

  await page.locator('#uploadToDeviceBtn').click();

  await expect
    .poll(() => page.evaluate(() => window.__serialWrites.some((t) => t.includes('ubinascii.a2b_base64('))))
    .toBe(true);
  expect(
    await page.evaluate(() => window.__serialWrites.some((t) => t.includes("open('main.py','wb')")))
  ).toBe(true);

  // El flujo acaba con Ctrl-B (salir de crudo) y después Ctrl-D (soft reset).
  await expect
    .poll(() =>
      page.evaluate(() => {
        const w = window.__serialWrites;
        const i = w.lastIndexOf('\x02');
        return i > 0 && w.slice(i + 1).join('') === '\x04';
      })
    )
    .toBe(true);
});

test('la consola recibe la salida de la placa y envía líneas con CRLF', async ({ page }) => {
  await fakeSerial(page);
  await boot(page);
  await page.locator('#serialConnectBtn').click();

  const consoleBtn = page.locator('#serialConsoleBtn');
  await expect(consoleBtn).toBeEnabled();
  await consoleBtn.click();

  const modal = page.locator('#serialConsoleModal');
  await expect(modal).toBeVisible();
  await expect(page.locator('#serialConsoleOut')).toContainText('MicroPython v1.29.0 on esp32');

  await page.locator('#serialConsoleInput').fill('print(1)');
  await page.locator('#serialConsoleInput').press('Enter');
  await expect.poll(() => page.evaluate(lastWrite)).toBe('print(1)\r\n');
});
