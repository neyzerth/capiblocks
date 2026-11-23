import { test, expect } from '@playwright/test';

async function boot(page) {
  await page.goto('/');
  await page.waitForFunction(() => window.MBBlocks && window.MBBlocks.active() && window.MBSprites);
}

async function openLibrary(page) {
  await page.locator('[data-target-tab="sprites"]').click();
  await page.locator('#spriteList .mtarget-card--add').click();
  await expect(page.locator('#spriteLibraryModal')).toBeVisible();
}

test('biblioteca de objetos: grid, búsqueda, categorías, selección, alta y borrado', async ({ page }) => {
  await boot(page);
  await openLibrary(page);

  const modal = page.locator('#spriteLibraryModal');
  const grid = page.locator('#spriteGrid');
  const cards = grid.locator('.asset-card');
  const okBtn = page.locator('#spriteLibraryOkBtn');
  const list = page.locator('#spriteList');
  const listCards = list.locator('.mtarget-card:not(.mtarget-card--add)');
  const wraps = page.locator('#stageCanvasBox .stage-sprite-wrap');

  // 1. Modal con las 24 tarjetas del catálogo, pills de categorías y Aceptar apagado.
  await expect(modal.locator('#spriteLibraryTitle')).toHaveText(/Sprite Library|Biblioteca de objetos|角色库/);
  await expect(cards).toHaveCount(24);
  await expect(page.locator('#spriteCats .cat-pill')).toHaveCount(9);
  await expect(page.locator('#spriteCats .cat-pill').first()).toHaveClass(/active/);
  await expect(okBtn).toBeDisabled();

  // 2. Búsqueda sin acentos: "avion" deja solo Avión.
  await page.locator('#spriteLibrarySearch').fill('avion');
  await expect(cards).toHaveCount(1);
  await expect(cards.first().locator('.asset-name')).toHaveText('Avión');
  await expect(cards.first().locator('img')).toHaveAttribute('src', 'assets/sprites/plane.png');

  // 3. Pill de categoría: Transporte muestra 3; "Todas" vuelve a 24.
  await page.locator('#spriteLibrarySearch').fill('');
  await page.locator('#spriteCats .cat-pill[data-cat="transporte"]').click();
  await expect(cards).toHaveCount(3);
  await page.locator('#spriteCats .cat-pill[data-cat="all"]').click();
  await expect(cards).toHaveCount(24);

  // 4. Un clic marca la tarjeta y habilita Aceptar.
  await page.locator('#spriteLibrarySearch').fill('avion');
  await expect(cards).toHaveCount(1);
  await cards.first().click();
  await expect(cards.first()).toHaveClass(/selected/);
  await expect(okBtn).toBeEnabled();

  // 5. Aceptar añade el sprite, lo selecciona, cierra y limpia búsqueda/selección.
  await okBtn.click();
  await expect(modal).toBeHidden();
  await expect(listCards).toHaveCount(2);
  await expect(listCards.nth(1)).toHaveClass(/selected/);
  await expect(listCards.nth(1).locator('.mtarget-name')).toHaveText('Avión');
  await expect(page.locator('#spriteNameInput')).toHaveValue('Avión');
  await expect(page.locator('#spriteXInput')).toHaveValue('72');
  await expect(wraps).toHaveCount(2);

  await openLibrary(page);
  await expect(page.locator('#spriteLibrarySearch')).toHaveValue('');
  await expect(okBtn).toBeDisabled();

  // 6. Doble clic añade sin pasar por Aceptar ("coche" → Coche).
  await page.locator('#spriteLibrarySearch').fill('coche');
  await expect(cards).toHaveCount(1);
  await cards.first().dblclick();
  await expect(modal).toBeHidden();
  await expect(listCards).toHaveCount(3);
  await expect(listCards.nth(2).locator('.mtarget-name')).toHaveText('Coche');
  await expect(wraps).toHaveCount(3);

  // 7. Subir una imagen real: data-URI, pestaña "Mis objetos" y sprite nuevo.
  await openLibrary(page);
  await page.locator('#spriteUploadInput').setInputFiles('assets/sprites/car.png');
  await expect(modal.locator('.library-tab[data-sprite-tab="mine"]')).toHaveClass(/active/);
  await expect(cards).toHaveCount(1);
  await expect(cards.first().locator('img')).toHaveAttribute('src', /^data:image\/png;base64,/);
  await expect(listCards).toHaveCount(4);
  await expect(listCards.nth(3).locator('.mtarget-name')).toHaveText('car');
  await expect(listCards.nth(3).locator('.mtarget-thumb img')).toHaveAttribute('src', /^data:image\/png;base64,/);

  await modal.locator('.modal-btn-secondary', { hasText: /Cancel|Cancelar|取消/ }).click();
  await expect(modal).toBeHidden();

  // 8. Borrar el sprite activo con la X deja la lista y la escena en 3.
  await listCards.nth(3).locator('.mtarget-delete-btn').click();
  await expect(listCards).toHaveCount(3);
  await expect(wraps).toHaveCount(3);

  // 9. "Mis objetos" vacío muestra el estado amable (sin clones de mascota).
  await openLibrary(page);
  await page.locator('.library-tab[data-sprite-tab="mine"]').click();
  await expect(page.locator('#spriteLibraryEmpty')).toBeVisible();
  await expect(page.locator('#spriteLibraryEmptyText')).toHaveText(/objetos propios|your own sprites|自己的角色/);
  await expect(page.locator('#spriteLibraryEmpty svg').first()).toBeVisible();

  // 10. A 390 px el modal no genera scroll lateral en la página.
  await page.locator('.library-tab[data-sprite-tab="library"]').click();
  await expect(page.locator('#spriteGrid')).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(modal).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  const box = await modal.locator('.modal-box-library').boundingBox();
  expect(box.width).toBeLessThanOrEqual(390);
});
