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
  formato viejo (arreglo plano).
- **CodeMirror necesita `refresh()`** cuando su contenedor pasa de oculto a visible (pestaña Python).
- **Playwright no pulsa elementos ocultos**: abre el modal antes de pulsar sus botones.
- **Nada de literales `http://` en `src/`**: `check.mjs` falla si el bundle contiene una URL
  externa. Los defaults de los bloques HTTP van sin esquema (`ejemplo.com/datos`) y el helper
  MicroPython la quita con `url.split('://')[-1]`.
- **Se desarrolla en Linux, se usa en Windows**: Web Serial abstrae el puerto (COM o `/dev/tty*`
  es indistinto para la app); lo único específico del sistema es el driver USB de la placa
  (CP210x o CH340), ya explicado en el manual dentro del modal de ayuda.
- **GitHub Pages cachea 10 minutos** (`max-age=600`): usa Ctrl+Shift+R tras desplegar.
- **pnpm 12** exige `allowBuilds` en `pnpm-workspace.yaml` para el postinstall de esbuild.

## Flujo recomendado antes de un PR

```bash
pnpm typecheck && pnpm test
```

Actualiza la documentación si cambias una API pública (`docs/ARQUITECTURA.md`) o una funcionalidad
(`docs/FUNCIONALIDADES.md`).
