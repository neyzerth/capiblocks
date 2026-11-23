# Guía de desarrollo

## Requisitos

- Node 18 o superior.
- pnpm (recomendado, versión fijada en `package.json`) o npm.
- `pnpm install` una vez: solo herramientas de desarrollo (TypeScript, esbuild, Playwright).

## Comandos

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Compila, sirve en `:8080` y recarga al guardar (`--no-open` para no abrir navegador). |
| `pnpm build` | Genera `dist/` (bundle `app.js` + `i18n.js` + vendors). |
| `pnpm preview` | Sirve `dist/` ya construido. |
| `pnpm typecheck` | TypeScript estricto, sin emitir. |
| `pnpm check` | typecheck + build + verificación (`check.mjs`). |
| `pnpm test` | Todo lo anterior + tests end-to-end. |
| `pnpm test:e2e` | Solo Playwright. |

Los tests necesitan `pnpm exec playwright install chromium` una vez por máquina.
También puede abrirse `dist/index.html` directamente (`file://`).

## Recetas

### Añadir un bloque

1. En `src/script.ts`, agrega la entrada a `BLOCKS_BY_CAT` con `id` único, `key` de traducción,
   `color`, `py` (código Python) y, si aplica, `hat: true` o `action` para el simulador.
2. Si la etiqueta tiene un hueco editable (`[color]`), agrega su spec en `FIELD_SPECS` de
   `src/blockly-app.ts` (`colour`, `text` o `number`). El campo se llama como en la spec
   (`COLOR`, `TEXT`, `SECS`…).
3. Añade las traducciones del `key` en `src/locales.ts` (en/es/zh).
4. Si el bloque lleva cuerpo (como `repeat`), agrégalo a `STATEMENT_INPUT`.
5. `pnpm test` y añade un caso si el bloque tiene comportamiento propio.

### Añadir un dispositivo

`DEVICE_LIBRARY` en `src/script.ts`: `{ id, name, desc }`. Aparece en la biblioteca
(Añadir dispositivo) y se puede fijar como activo.

### Añadir un objeto o un fondo a la biblioteca

1. Copia el archivo a `assets/sprites/` o `assets/backdrops/` (CC0 o propio) y anota su origen en
   `THIRD-PARTY-NOTICES.md`.
2. Agrega la entrada en `SPRITE_LIBRARY` o `BACKDROP_LIBRARY` (`src/sprite-library.ts`) con un **id
   nuevo**: los ids se guardan en los proyectos y renombrarlos rompe las partidas guardadas.
3. Si añades una categoría, agrégala al tipo y a `SPRITE_CATEGORIES`/`BACKDROP_CATEGORIES` con su
   `labelKey`, y traduce la clave en `src/locales.ts`.
4. `pnpm build` copia `assets/` a `dist/`; `node check.mjs` confirma que no hay URLs externas.

### Añadir un idioma

1. Copia el bloque de un idioma en `src/locales.ts` y traduce los valores.
2. `src/i18n.ts` detecta los idiomas disponibles desde `__I18N_DICTS`; añade el botón en el menú de
   idioma y en Ajustes si quieres acceso directo.

### Añadir un programa de ejemplo

1. Define los pasos en `EXAMPLES` (`src/script.ts`): `{ id, fields?, do?[] }`.
2. Agrega una tarjeta con `data-load-example="<clave>"` en el modal de ejemplos (`index.html`).
3. Los ejemplos piden confirmación si el lienzo ya tiene bloques.

### Cambiar el color de acento

Variables al inicio de `style.css` (`--HEADER-BG`, `--PRIMARY-COLOR`, `--BODY-BG`, `--BORDER-COLOR`…).
Evita tocar componentes uno por uno.

### Añadir un test

`tests/e2e/editor.spec.js`: usa los helpers `boot`, `addFromPalette` y `topBlockRects`. Prefiere
`expect.poll` sobre esperas fijas.

## Trampas conocidas

- **El flyout es un toggle**: pulsar la misma categoría dos veces lo cierra. En tests, cierra el
  flyout después de añadir o usa categorías distintas.
- **El cuerpo de un sombrero es su cadena siguiente**: al generar Python, indenta `getNextBlock()`
  del bloque con `hat`; si no, sale `def` sin cuerpo.
- **El guardado usa `{engine:'blockly', state}`**: si cambias el formato, mantén la lectura del
  formato viejo (arreglo plano). Desde los objetos y fondos, el payload lleva además `sprites`,
  `activeSpriteId`, `backdrops` y `activeBackdropId`; un proyecto sin esas claves debe seguir
  abriéndose con el Capi y el lienzo blanco.
- **CodeMirror necesita `refresh()`** cuando su contenedor pasa de oculto a visible (pestaña Python).
- **Playwright no pulsa elementos ocultos**: abre el modal antes de pulsar sus botones.
- **Los tests levantan su propio servidor en `:8123`**: `playwright.config.ts` ejecuta
  `build.mjs && serve.mjs 8123` (y reutiliza uno ya escuchando fuera de CI). Al limpiar procesos de
  prueba, mata solo el PID que arrancaste o el del puerto 8123: un `pkill -f serve.mjs` se llevó por
  delante el `serve.mjs` de otro worktree en `:8080`.
- **Las tarjetas «+ Añadir» nacen después del binding global**: `[data-modal-open]` solo se engancha
  al cargar la página, así que `renderSpriteList()` y `renderBackdropList()` añaden su propio
  `addEventListener`. El atributo queda como hook declarativo para las pruebas.
- **GitHub Pages cachea 10 minutos** (`max-age=600`): usa Ctrl+Shift+R tras desplegar.
- **pnpm 12** exige `allowBuilds` en `pnpm-workspace.yaml` para el postinstall de esbuild.

## Flujo recomendado antes de un PR

```bash
pnpm typecheck && pnpm test
```

Actualiza la documentación si cambias una API pública (`docs/ARQUITECTURA.md`) o una funcionalidad
(`docs/FUNCIONALIDADES.md`).
