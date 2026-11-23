import { test, expect } from '@playwright/test';

/* Regresión post-merge: los `[tokens]` de las etiquetas de sprite son valores
   editables. Si falta su spec en FIELD_SPECS, messageFor descarta el hueco y el
   campo desaparece del bloque (el texto muestra "mover  pasos"). */

async function boot(page) {
  await page.goto('/');
  await page.waitForFunction(() => window.MBBlocks && window.MBBlocks.active());
}

async function addFromSpriteCategory(page, label, itemIndex = 0) {
  await page.locator('[data-target-tab="sprites"]').click();
  await page.locator('.toolbox-categories button').filter({ hasText: label }).first().click();
  await page.locator('#flyoutBlocks button').nth(itemIndex).click();
  const close = page.locator('#flyoutCloseBtn');
  if (await close.isVisible()) await close.click();
}

/* Blockly 13 no expone `rendered` en Field: se comprueba que el campo exista,
   que sea visible y que su bloque esté renderizado (el SVG del campo está en
   el DOM). */
async function fieldInfo(page, type, name) {
  return page.evaluate(([blockType, fieldName]) => {
    const block = Blockly.getMainWorkspace().getTopBlocks(true).find((b) => b.type === blockType);
    if (!block) return null;
    const field = block.getField(fieldName);
    if (!field) return { exists: false };
    const svg = field.getSvgRoot ? field.getSvgRoot() : null;
    return {
      exists: true,
      text: field.getText(),
      visible: field.isVisible(),
      rendered: !!block.rendered && !!svg && svg.ownerSVGElement !== null
    };
  }, [type, name]);
}

test('los bloques de sprite muestran sus campos editables (STEPS, TEXT, SECS, DUR)', async ({ page }) => {
  await boot(page);

  // Movimiento → "mover [20] pasos" desde la paleta.
  await addFromSpriteCategory(page, /Movimiento|Motion/);
  await expect.poll(() => page.evaluate(() => MBBlocks.count())).toBe(1);

  const steps = await fieldInfo(page, 'mb_mov_steps', 'STEPS');
  expect(steps, 'mov_steps sin campo STEPS').not.toBeNull();
  expect(steps.exists).toBe(true);
  expect(steps.rendered).toBe(true);
  expect(steps.text).toBe('20');

  // Mirada → "decir [¡Hola!] durante [2] segundos": dos campos, no uno.
  await addFromSpriteCategory(page, /Mirada|Looks/);
  await expect.poll(() => page.evaluate(() => MBBlocks.count())).toBe(2);

  const sayText = await fieldInfo(page, 'mb_look_say', 'TEXT');
  expect(sayText, 'look_say sin campo TEXT').not.toBeNull();
  expect(sayText.exists).toBe(true);
  expect(sayText.rendered).toBe(true);
  expect(sayText.text).toBe('¡Hola!');

  const saySecs = await fieldInfo(page, 'mb_look_say', 'SECS');
  expect(saySecs, 'look_say sin campo SECS').not.toBeNull();
  expect(saySecs.exists).toBe(true);
  expect(saySecs.rendered).toBe(true);
  expect(saySecs.text).toBe('2');

  // Sonido → "tocar nota [60] durante [0.25] pulsos" (CyberPi: se añade por API).
  await page.evaluate(() => MBBlocks.add('play_note'));
  await expect.poll(() => page.evaluate(() => MBBlocks.count())).toBe(3);

  const note = await fieldInfo(page, 'mb_play_note', 'NOTE');
  expect(note, 'play_note sin campo NOTE').not.toBeNull();
  expect(note.exists).toBe(true);
  expect(note.rendered).toBe(true);
  expect(note.text).toBe('60');

  const dur = await fieldInfo(page, 'mb_play_note', 'DUR');
  expect(dur, 'play_note sin campo DUR').not.toBeNull();
  expect(dur.exists).toBe(true);
  expect(dur.rendered).toBe(true);
  expect(dur.text).toBe('0.25');

  // El Python usa los valores de los campos, no literales quemados.
  const py = await page.evaluate(() => MBBlocks.python());
  expect(py).toContain('sprite.forward(20)');
  expect(py).toContain('sprite.say("¡Hola!", 2)');
  expect(py).toContain('cyberpi.audio.play_music(60, 0.25)');
});

test('el catálogo de sprite incluye girar a la izquierda', async ({ page }) => {
  await boot(page);

  await page.locator('[data-target-tab="sprites"]').click();
  await page.locator('.toolbox-categories button').filter({ hasText: /Movimiento|Motion/ }).first().click();
  const items = page.locator('#flyoutBlocks button');
  // Orden del catálogo motion: mover, girar derecha, girar izquierda.
  await expect(items).toHaveCount(3);
  await items.nth(2).click();
  const close = page.locator('#flyoutCloseBtn');
  if (await close.isVisible()) await close.click();

  await expect.poll(() => page.evaluate(() => MBBlocks.count())).toBe(1);
  const field = await fieldInfo(page, 'mb_mov_turn_left', 'DEG');
  expect(field, 'mov_turn_left sin campo DEG').not.toBeNull();
  expect(field.exists).toBe(true);
  expect(field.rendered).toBe(true);
  expect(field.text).toBe('15');

  const py = await page.evaluate(() => MBBlocks.python());
  expect(py).toContain('sprite.left(15)');

  // La acción de simulación gira al lado contrario que "girar a la derecha".
  const actions = await page.evaluate(() => MBBlocks.actions());
  expect(actions).toContainEqual({ type: 'turn', deg: -15 });
});
