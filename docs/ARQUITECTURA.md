# Arquitectura de capiBlocks

capiBlocks es una **página estática** (sin backend) que se sirve desde cualquier carpeta o desde
GitHub Pages. Todo el estado vive en el navegador. El código de la app está en TypeScript y se
compila con esbuild a un único bundle IIFE.

## Capas en tiempo de ejecución

```
index.html
 ├─ style.css, codemirror.css        presentación
 ├─ blockly.min.js (vendor)          motor de bloques (global Blockly)
 ├─ codemirror*.js (vendor)          editor de código (global CodeMirror)
 └─ app.js                           bundle generado por esbuild
     ├─ locales.ts                   diccionarios es / en / zh
     ├─ i18n.ts                      window.t(), cambio de idioma, data-t
     ├─ blockly-app.ts               window.MBBlocks: bloques, Python, acciones
     ├─ python-editor.ts             window.MBPythonEditor: CodeMirror
     └─ script.ts                    UI, estado, eventos, guardado, ejemplos
```

`privacy.html` carga solo `i18n.js` (bundle reducido de locales + i18n) y su propio script inline.

## Flujo de datos

1. `script.ts` define el catálogo `BLOCKS_BY_CAT` (id, color, `py`, `action`, `hat`).
2. `MBBlocks.init()` registra un tipo de Blockly por entrada (`mb_<id>`) y monta el workspace
   (renderer `zelos`).
3. La paleta (flyout propio) añade bloques con clic (`MBBlocks.add`) o arrastre (`MBBlocks.addAt`).
4. Cada cambio del workspace dispara `onChange` → contador de bloques + regeneración del Python.
5. `MBBlocks.python()` recorre la pila y emite código; `MBBlocks.actions()` hace lo mismo para el
   simulador del escenario (LEDs, pantalla, sonido, movimiento).
6. Guardar: `MBBlocks.serialize()` dentro de `localStorage` (`mblock.lastProject`) o archivo `.json`.
   Al arrancar, `restoreLastProject()` vuelve a cargar nombre, dispositivo y bloques.

## API pública en `window`

### `MBBlocks`

| Método | Qué hace |
|---|---|
| `init({blocksByCat,labelFor,lang,device,onChange})` | Registra bloques y monta el workspace. |
| `relabel(labelFor)` | Reconstruye los bloques con otro idioma conservando el programa. |
| `add(id)` | Añade un bloque debajo del contenido actual. |
| `addAt(id, clientX, clientY)` | Añade un bloque en el punto donde se suelta (arrastre). |
| `loadProgram(steps)` | Carga un programa de ejemplo (`{id, fields?, do?[]}`). |
| `count()` / `refreshCount()` | Número de bloques / actualiza el contador visible. |
| `setDevice(id)` | Fija el dispositivo activo: decide el codegen de `python()`. |
| `python()` | Código Python de la pila actual, según el dispositivo activo. |
| `actions()` | Lista de acciones para el simulador. |
| `serialize()` / `load(state)` | Estado del workspace para guardar/restaurar. |
| `clear()`, `undo()`, `redo()`, `zoomIn/Out/Reset()`, `cleanUp()`, `resize()` | Controles del lienzo. |

### Codegen por dispositivo

Cada entrada de `BLOCKS_BY_CAT` puede declarar `esp32` (código MicroPython) y
`devices` (lista de placas donde el bloque aparece en la paleta; ausente = universal).
Con `esp32` activo, `python()` emite un encabezado propio, `import machine, time` +
`from machine import Pin, PWM, ADC`, imports extra solo si el programa los usa
(`network`, `ntptime`) y los helpers de los bloques presentes; los sombreros de evento
se vuelven `def on_flag():` / `def on_start():` y se llaman al final, bajo
`# --- capiBlocks: arranque ---`. Para cualquier otro dispositivo la salida es la de
siempre (`import cyberpi, event, time` + decoradores).

### `MBPythonEditor`

`mount(textarea)`, `mountPreview(el)`, `setValue(v)`, `getValue()`, `setPreview(v)`, `refresh()`,
`focus()`. Si CodeMirror no está disponible, la UI cae al `<textarea>` original.

## Formato de proyecto guardado

```json
{
  "name": "Clase IoT",
  "lang": "es",
  "device": "esp32",
  "blocks": { "engine": "blockly", "state": { "blocks": { "blocks": [ ... ] } } },
  "savedAt": "2026-11-23T20:00:00.000Z"
}
```

Los proyectos viejos con `blocks` como arreglo plano se siguen leyendo (modo sin motor).

## Build y verificación

```
src/*.ts ──esbuild──▶ dist/app.js, dist/i18n.js
index.html, style.css, privacy.html, favicons ──copiar──▶ dist/
vendor/blockly, vendor/codemirror ──copiar──▶ dist/
```

- `node build.mjs` reconstruye `dist/` (requiere `pnpm install` una vez).
- `node check.mjs` valida archivos, referencias, ausencia de URLs externas y que el bundle exponga
  las APIs.
- `pnpm typecheck` ejecuta `tsc --noEmit`.
- `tests/e2e/editor.spec.js` prueba el comportamiento real en Chromium (Playwright).

## Reglas de diseño

1. **Cero recursos externos**: nada de CDN, fuentes web ni APIs remotas. Debe funcionar en `file://`.
2. **IDs de bloque estables** (`mb_<id>`): cambiarlos rompe proyectos guardados.
3. **Una sola mascota**: el capibara es un SVG aprobado; reutilízalo con
   `<g transform="translate(...) scale(...)">`.
4. **Acento en variables CSS** (`--HEADER-BG`, `--PRIMARY-COLOR`, `--BODY-BG`…): rebrandear es
   editar variables, no componentes.
5. **La fuente de verdad del programa es el workspace** de Blockly, no `state.blocks` (que solo se
   usa como respaldo cuando no hay motor).
