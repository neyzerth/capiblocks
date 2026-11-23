import { test, expect } from '@playwright/test';

/* Catálogo de ejemplos: carga data-driven, pestañas de categoría y buscador
   sin acentos. `window.MBExamples` es la ventana de pruebas de src/examples.ts. */

async function boot(page) {
  await page.goto('/');
  await page.waitForFunction(() => window.MBBlocks && window.MBBlocks.active() && window.MBExamples);
}

async function openExamples(page) {
  await page.locator('[data-modal-open="examplesModal"]').click();
  await expect(page.locator('#examplesModal')).toBeVisible();
}

test('cada ejemplo carga bloques, genera Python y tiene su miniatura', async ({ page }) => {
  await boot(page);
  const examples = await page.evaluate(() => window.MBExamples.list());
  expect(examples.length).toBeGreaterThanOrEqual(4);

  // Los 4 ids estables siguen en el catálogo (regla 3 de AGENTS.md). Se comprueba
  // como subconjunto: las olas de contenido añaden ejemplos nuevos.
  expect(examples.map((ex) => ex.id)).toEqual(
    expect.arrayContaining(['counter', 'esp32-wifi', 'leds', 'panda'])
  );

  // El modal pinta una tarjeta por ejemplo y todas las miniaturas cargan.
  await openExamples(page);
  await expect(page.locator('#examplesGrid .example-card')).toHaveCount(examples.length);
  await expect.poll(() => page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('#examplesGrid .example-thumb img'));
    return imgs.length > 0 && imgs.every((img) => img.complete && img.naturalWidth > 0);
  }), { message: 'miniaturas del modal sin cargar' }).toBe(true);
  await page.locator('#examplesModal [data-modal-close]').click();
  await expect(page.locator('#examplesModal')).toBeHidden();

  for (const ex of examples) {
    const loaded = await page.evaluate((id) => window.MBExamples.load(id, { force: true }), ex.id);
    expect(loaded, `ejemplo ${ex.id} no cargó`).toBe(true);

    const count = await page.evaluate(() => window.MBBlocks.count());
    expect(count, `ejemplo ${ex.id} dejó el lienzo vacío`).toBeGreaterThan(0);

    const py = await page.evaluate(() => window.MBBlocks.python());
    expect(py.length, `ejemplo ${ex.id} no generó Python`).toBeGreaterThan(0);

    // Miniatura servida por HTTP (no file://) con contenido real.
    const ok = await page.evaluate((src) => new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img.naturalWidth > 0);
      img.onerror = () => resolve(false);
      img.src = src;
    }), ex.thumb);
    expect(ok, `miniatura ${ex.thumb}`).toBe(true);

    // Un ejemplo con placa ESP32 declarada la deja añadida y activa.
    if (ex.device === 'esp32') {
      await expect(page.locator('#deviceListCol .mtarget-card.selected .mtarget-name')).toHaveText('ESP32');
    }
  }
});

test('las pestañas filtran por categoría', async ({ page }) => {
  await boot(page);
  await openExamples(page);
  const cards = page.locator('#examplesGrid .example-card');
  const tabs = page.locator('#exampleCats .library-tab');
  const examples = await page.evaluate(() => window.MBExamples.list());
  const idsFor = (cat) => examples
    .filter((ex) => cat === 'all' || ex.cat === cat)
    .map((ex) => ex.id)
    .sort();

  // Todos + las tres categorías, con "Todos" activo al abrir.
  await expect(tabs).toHaveCount(4);
  await expect(tabs.first()).toHaveClass(/active/);
  await expect(cards).toHaveCount(idsFor('all').length);

  for (const cat of ['iot', 'escenario', 'basico']) {
    await page.locator(`#exampleCats [data-example-cat="${cat}"]`).click();
    await expect(cards).toHaveCount(idsFor(cat).length);
    const visible = await cards.evaluateAll((list) => list.map((c) => c.dataset.exampleId).sort());
    expect(visible, `filtro ${cat}`).toEqual(idsFor(cat));
  }

  await page.locator('#exampleCats [data-example-cat="all"]').click();
  await expect(cards).toHaveCount(idsFor('all').length);
});

test('el buscador ignora los acentos y muestra el estado vacío', async ({ page }) => {
  await boot(page);
  await openExamples(page);
  const cards = page.locator('#examplesGrid .example-card');

  // "arcoiris" (sin tilde) encuentra "Arcoíris".
  await page.locator('#examplesSearch').fill('arcoiris');
  await expect.poll(() => cards.count()).toBeGreaterThanOrEqual(1);
  await expect(cards.first()).toHaveAttribute('data-example-id', 'leds');
  await expect(cards.first().locator('h3')).toHaveText('ESP32: Arcoíris LED');

  // Sin coincidencias: grid oculto y mensaje de vacío visible.
  await page.locator('#examplesSearch').fill('zzzz');
  await expect(cards).toHaveCount(0);
  await expect(page.locator('#examplesEmpty')).toBeVisible();

  await page.locator('#examplesSearch').fill('');
  await expect(page.locator('#examplesEmpty')).toBeHidden();
  const total = await page.evaluate(() => window.MBExamples.list().length);
  await expect(cards).toHaveCount(total);
});

test('doble clic en una tarjeta carga el ejemplo', async ({ page }) => {
  await boot(page);
  await openExamples(page);
  await page.locator('#examplesGrid .example-card[data-example-id="panda"] h3').dblclick();
  await expect.poll(() => page.evaluate(() => window.MBBlocks.count())).toBe(4);
  await expect(page.locator('#examplesModal')).toBeHidden();
});
