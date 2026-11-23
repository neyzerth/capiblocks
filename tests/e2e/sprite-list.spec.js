import { test, expect } from '@playwright/test';

const PLANE = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="#4c97ff"/></svg>'
);

async function boot(page) {
  await page.goto('/');
  await page.waitForFunction(() => window.MBBlocks && window.MBBlocks.active() && window.MBSprites);
}

test('lista de objetos dinámica: tarjetas, selección, borrado y "+ Añadir"', async ({ page }) => {
  await boot(page);
  await page.locator('[data-target-tab="sprites"]').click();
  await expect(page.locator('#paneSprites')).toBeVisible();

  const list = page.locator('#spriteList');
  const cards = list.locator('.mtarget-card:not(.mtarget-card--add)');
  const addCard = list.locator('.mtarget-card--add');

  // 1. Una tarjeta por sprite; Capi activo y con el capibara aprobado como miniatura.
  await expect(cards).toHaveCount(1);
  await expect(cards.first()).toHaveClass(/selected/);
  await expect(cards.first().locator('.mtarget-name')).toHaveText('Capi');
  await expect(cards.first().locator('.mtarget-thumb svg')).toHaveAttribute('viewBox', '0 0 100 120');
  await expect(list.locator('.mtarget-thumb svg circle[fill="#1d242b"]')).toHaveCount(0);

  // La tarjeta final es "+ Añadir" y apunta al modal de la biblioteca.
  await expect(addCard).toHaveCount(1);
  await expect(addCard).toHaveAttribute('data-modal-open', 'spriteLibraryModal');
  await expect(addCard.locator('.mtarget-name')).toHaveText(/Add|Añadir|添加/);
  await expect(cards.first().locator('.mtarget-delete-btn')).toHaveAttribute('aria-label', /Delete sprite|Eliminar objeto|删除角色/);

  // 2. Sprite extra (sin modal todavía): asset <img> y queda seleccionado.
  await page.evaluate((asset) => window.MBSprites.add({ name: 'Avión', x: 24, y: 12, asset }), PLANE);
  await expect(cards).toHaveCount(2);
  await expect(cards.nth(1)).toHaveClass(/selected/);
  await expect(cards.nth(1).locator('.mtarget-name')).toHaveText('Avión');
  await expect(cards.nth(1).locator('.mtarget-thumb img')).toHaveAttribute('src', /^data:image\/svg\+xml/);
  await expect(page.locator('#spriteNameInput')).toHaveValue('Avión');
  await expect(page.locator('#spriteXInput')).toHaveValue('24');
  await expect(page.locator('#spriteYInput')).toHaveValue('12');
  await expect(page.locator('#infoTargetName')).toHaveText('Avión');
  await expect(page.locator('#stageCanvasBox .stage-sprite-wrap')).toHaveCount(2);

  // 3. Click en la tarjeta de Capi: selecciona y sincroniza propiedades.
  await cards.first().click();
  await expect(cards.first()).toHaveClass(/selected/);
  await expect(cards.nth(1)).not.toHaveClass(/selected/);
  await expect(page.locator('#spriteNameInput')).toHaveValue('Capi');
  await expect(page.locator('#spriteXInput')).toHaveValue('0');
  await expect(page.locator('#spriteSizeInput')).toHaveValue('100');
  await expect(page.locator('#spriteDirInput')).toHaveValue('90');
  await expect(page.locator('#spriteVisibleCheck')).toBeChecked();
  await expect(page.locator('#infoTargetName')).toHaveText('Capi');
  await expect(cards.first().locator('.mtarget-delete-btn')).toHaveCount(1);
  await expect(cards.nth(1).locator('.mtarget-delete-btn')).toHaveCount(0);

  // 4. Renombrar el sprite activo actualiza tarjeta y cabecera.
  await page.locator('#spriteNameInput').fill('Capi 2');
  await expect(cards.first().locator('.mtarget-name')).toHaveText('Capi 2');
  await expect(page.locator('#infoTargetName')).toHaveText('Capi 2');

  // 5. Borrar: se selecciona Avión, X lo elimina y Capi queda activo.
  await cards.nth(1).click();
  await cards.nth(1).locator('.mtarget-delete-btn').click();
  await expect(cards).toHaveCount(1);
  await expect(cards.first()).toHaveClass(/selected/);
  await expect(page.locator('#spriteNameInput')).toHaveValue('Capi 2');
  await expect(page.locator('#infoTargetName')).toHaveText('Capi 2');
  await expect(page.locator('#stageCanvasBox .stage-sprite-wrap')).toHaveCount(1);

  // 6. El último sprite no se borra: X avisa y la lista sigue con 1.
  await cards.first().locator('.mtarget-delete-btn').click();
  await expect(page.locator('#toastBanner')).toHaveText(/al menos un objeto|at least one sprite|至少需要保留一个角色/);
  await expect(cards).toHaveCount(1);

  // 7. "+ Añadir" abre el modal de la biblioteca de objetos.
  await addCard.click();
  await expect(page.locator('#spriteLibraryModal')).toBeVisible();
  await page.locator('#spriteLibraryModal [data-modal-close]').first().click();
  await expect(page.locator('#spriteLibraryModal')).toBeHidden();
  await expect(page.locator('#spriteList')).toBeVisible();
});
