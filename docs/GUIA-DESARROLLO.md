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
   (`COLOR`, `TEXT`, `SECS`…). **Un hueco sin spec no se ve**: `messageFor` lo borra del
   mensaje (queda «mover  pasos») y el bloque pierde el campo; la consola avisa una vez por
   id. Revisa los tres idiomas: cada `[token]` de `src/locales.ts` necesita su spec.
3. Añade las traducciones del `key` en `src/locales.ts` (en/es/zh).
4. Si el bloque lleva cuerpo (como `repeat`), agrégalo a `STATEMENT_INPUT`.
5. `pnpm test` y añade un caso si el bloque tiene comportamiento propio.

### Añadir un dispositivo

`DEVICE_LIBRARY` en `src/script.ts`: `{ id, name, desc, file }`, con
`file: 'assets/devices/<id>.svg'`. El nombre del archivo es el id (estable, regla 3): para una placa
nueva, crea el SVG con ese nombre y la entrada aparece en la biblioteca y en el panel lateral.

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

1. Añade una entrada al archivo de su categoría: `src/examples-iot.ts`, `src/examples-escenario.ts`
   o `src/examples-basicos.ts` (`{ id, name, desc, cat, thumb, device?, backdrops?, steps }`). Los
   pasos son `{ id, fields?, do?[] }` y cada `id` debe existir en `BLOCKS_BY_CAT`.
2. Usa un **id nuevo** (los ids son estables: renombrar rompe specs y referencias). El título se
   cambia en `name`.
3. Si usa bloques exclusivos de una placa (`devices: [...]` en el bloque), declara `device` con su
   id de `DEVICE_LIBRARY`; al cargar se añade y se activa.
4. Si el programa usa «siguiente fondo», declara `backdrops` con ids de `BACKDROP_LIBRARY`: sin
   fondos en el proyecto, el bloque cicla una lista de uno y no cambia nada.
5. Crea la miniatura `assets/examples/<id>.svg`. `node check.mjs` confirma que no hay URLs externas
   y `pnpm test` (spec data-driven) carga el ejemplo y valida su miniatura.
6. Los ejemplos piden confirmación si el lienzo ya tiene bloques.

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
- **Nada de literales `http://` en `src/`**: `check.mjs` falla si el bundle contiene una URL
  externa. Los defaults de los bloques HTTP van sin esquema (`ejemplo.com/datos`) y el helper
  MicroPython la quita con `url.split('://')[-1]`.
- **Se desarrolla en Linux, se usa en Windows**: Web Serial abstrae el puerto (COM o `/dev/tty*`
  es indistinto para la app); lo único específico del sistema es el driver USB de la placa
  (CP210x o CH340), ya explicado en el manual dentro del modal de ayuda.
- **Corre los tests con `CI=1` cuando haya otros worktree activos**: `playwright.config.ts`
  levanta su servidor en `:8123` y reutiliza cualquiera que ya escuche (fuera de CI). Si otra
  sesión del repo tiene su servidor arriba, `CI=1 pnpm exec playwright test` obliga a un puerto
  propio y truena ruidosamente en vez de probar la app del vecino sin darse cuenta.
- **Los tests levantan su propio servidor en `:8123`**: al limpiar procesos de prueba, mata solo
  el PID que arrancaste o el del puerto 8123: un `pkill -f serve.mjs` se llevó por delante el
  `serve.mjs` de otro worktree en `:8080`.
- **Las tarjetas dinámicas nacen después del binding global**: `[data-modal-open]` solo se engancha
  al cargar la página, así que `renderSpriteList()`, `renderBackdropList()` y `renderExamples()`
  añaden su propio `addEventListener` en cada render; un listener único al arranque no ve las
  tarjetas «+ Añadir» ni las `.example-card` del modal de ejemplos. Los atributos
  (`data-load-example`, `data-example-cat`, `data-example-id`) quedan como hooks declarativos para
  las pruebas.
- **Las miniaturas del modal llevan `loading="lazy"`**: justo después de abrirlo, `img.complete` y
  `naturalWidth` pueden seguir a 0. Aserta con `expect.poll` (o espera a
  `img.complete && img.naturalWidth > 0`); una comprobación inmediata con `toBe(true)` es
  intermitente.
- **`toHaveAttribute` con un array de regex no es un «alguno de»**: si el locator resuelve varias
  tarjetas, Playwright aborta por *strict mode violation* antes de evaluar el atributo. Comprueba
  una tarjeta por locator (`locator(...).nth(i)`) o lee los atributos con `evaluateAll`.
- **GitHub Pages cachea 10 minutos** (`max-age=600`): usa Ctrl+Shift+R tras desplegar.
- **pnpm 12** exige `allowBuilds` en `pnpm-workspace.yaml` para el postinstall de esbuild.
- **El cierre de modales y del panel de bloques es asíncrono (~190 ms)**: `hideElAnimated()` anima
  la salida con la clase `.closing` y aplica `hidden` cuando termina. No fijes `hidden` a mano
  sobre un `.modal-backdrop` ni sobre `#blocklyFlyout`: abre y cierra siempre con
  `openModal`/`closeAllModals`/`showElAnimated`, y en las pruebas usa aserciones que reintentan
  (`toBeHidden()`).

## Flujo recomendado antes de un PR

```bash
pnpm typecheck && pnpm test
```

Actualiza la documentación si cambias una API pública (`docs/ARQUITECTURA.md`) o una funcionalidad
(`docs/FUNCIONALIDADES.md`).
