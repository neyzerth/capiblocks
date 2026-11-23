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
     ├─ serial.ts                    window.MBSerial: Web Serial + REPL crudo
     ├─ python-editor.ts             window.MBPythonEditor: CodeMirror
     ├─ sprite-library.ts            catálogo CC0 de objetos y fondos
     ├─ examples.ts                  catálogo de programas de ejemplo (fuente única)
     │   ├─ examples-iot.ts          datos de la categoría IoT
     │   ├─ examples-escenario.ts    datos de la categoría Escenario
     │   └─ examples-basicos.ts      datos de la categoría Básicos
     └─ script.ts                    UI, estado, escena, bibliotecas, guardado, ejemplos
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
   Al arrancar, `restoreLastProject()` vuelve a cargar nombre, dispositivo, bloques y escena.

## Objetos y fondos

El escenario tiene **varios objetos** (sprites) y **varios fondos** por proyecto.

- `state.sprites[]` guarda `{ id, name, x, y, size, dir, visible, hue, asset }`. `asset` es `'capi'`
  (el SVG aprobado) o la ruta/`data:` de una imagen. `state.activeSpriteId` marca el objeto que
  editan los inputs y mueven los bloques; `activeSprite()` lo devuelve y cae al primero si su id
  ya no existe.
- `renderSprites()` crea un `<div class="stage-sprite-wrap">` por objeto en `#stageCanvasBox`;
  `updateStage()` solo reaplica transformaciones, visibilidad y color cuando la lista no cambió, y
  así conserva la transición CSS. El capibara se clona una vez desde `#stageSprite`
  (`capiTemplateSvg`) y se reutiliza en escena y miniaturas (regla 4).
- `renderSpriteList()` pinta la pestaña Objetos: una tarjeta por objeto, × para borrar el activo
  (nunca el último) y una tarjeta «+ Añadir» al final.
- `state.backdrops` es una lista de ids del catálogo y `state.activeBackdropId` el fondo visible.
  `renderBackdropList()` pinta las miniaturas y el contador; `applyBackdropVisual()` aplica la clase
  CSS de un preset o el `background-image` local de un asset.

El catálogo vive en `src/sprite-library.ts`: `SPRITE_LIBRARY` (24 objetos) y `BACKDROP_LIBRARY`
(12 fondos: 4 presets CSS y 8 imágenes), más `SPRITE_CATEGORIES`/`BACKDROP_CATEGORIES` para las
píldoras del modal (`labelKey` es la clave i18n). Los `id` son estables porque se guardan en el
proyecto: no se renombran. Todos los assets son CC0 de Kenney y su procedencia está en
`THIRD-PARTY-NOTICES.md`; `build.mjs` copia `assets/` a `dist/`.

Dos modales comparten la plantilla `.library-modal`:

- `#spriteLibraryModal`: buscador que ignora acentos, píldoras por categoría, un clic para marcar y
  doble clic para añadir, subida de PNG/SVG (queda como `data:` en el sprite) y pestaña «Mis
  objetos» con los sprites subidos.
- `#backdropLibraryModal`: píldoras, buscador y rejilla de los fondos del catálogo. La subida de
  fondos propios está pendiente.

Al aceptar, el objeto se añade con posición escalonada (+72 px), nombre único y queda seleccionado.

## Programas de ejemplo

El catálogo vive en `src/examples.ts`, que fija el contrato y concatena los datos (mismo patrón que
`sprite-library.ts`):

- `Example` declara `{ id, name, desc, cat, thumb, device?, backdrops?, steps }`. `id` es **estable** (lo usan
  los specs y los cuatro ids originales —`panda`, `leds`, `counter`, `esp32-wifi`— se conservan);
  `thumb` es una ruta relativa `assets/examples/<id>.svg`; `steps` es una lista de
  `ExampleStep` (`{ id, fields?, do?[] }`) que alimenta `MBBlocks.loadProgram`; `backdrops` trae
  los fondos del proyecto (ids de `BACKDROP_LIBRARY`) cuando el ejemplo usa «siguiente fondo».
- `EXAMPLE_CATEGORIES` define las píldoras del modal (`iot`, `escenario`, `basico`) con su
  `labelKey` i18n: solo el chrome del modal se traduce; `name`/`desc` van en español directo, como
  los nombres de objetos y fondos.
- `EXAMPLES` concatena `EXAMPLES_IOT`, `EXAMPLES_ESCENARIO` y `EXAMPLES_BASICOS`, un archivo de
  datos por categoría (`examples-iot.ts`, `examples-escenario.ts`, `examples-basicos.ts`) para que
  la edición de contenido toque archivos disjuntos.
- `device` nombra la placa que el ejemplo necesita (id de `DEVICE_LIBRARY`) cuando usa bloques
  exclusivos de una familia.

En `script.ts`, `renderExamples()` pinta las pestañas, el buscador (con `normalizeSearchText`, que
ignora acentos) y una `.example-card` por ejemplo: miniatura `<img loading="lazy">`, botón Cargar
(`data-load-example`, que conservan los specs viejos) y doble clic. El grid se reconstruye en cada
render, así que los listeners se pegan **por tarjeta**, no en el arranque.

`loadExampleProgram(id, { force })` es el único camino de carga: pide confirmación con `askReplace`
si el lienzo tiene trabajo (salvo `force`), cierra los modales, llama a `applyExampleDevice(ex)` —que
añade la placa declarada a `state.addedDevices` y la activa con `setActiveDevice`, para que el codegen
salga con la familia correcta—, monta la pila (`MBBlocks.loadProgram(ex.steps)`), aplica los
`backdrops` del ejemplo si los declara (mismo patrón que `applyProjectPayload`: normaliza los ids,
activa el primero y repinta la lista y el escenario), actualiza el Python
y lanza la simulación. Devuelve `false` si el usuario cancela.

`window.MBExamples = { list, load }` expone el catálogo y la carga sin confirmación para las pruebas
de navegador.

## API pública en `window`

### `MBBlocks`

| Método | Qué hace |
|---|---|
| `init({blocksByCat,labelFor,lang,device,onChange})` | Registra bloques y monta el workspace. |
| `relabel(labelFor)` | Reconstruye los bloques con otro idioma —o con otras opciones de campo (pines por variante)— conservando el programa. |
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
La paleta filtra categorías y bloques por `state.activeDevice`, y `MBBlocks.setDevice(id)`
sincroniza el motor con esa elección.

Con `esp32` activo, `python()` emite un encabezado propio (`# capiBlocks → MicroPython (ESP32)`),
`import machine, time` + `from machine import Pin, PWM, ADC`, imports extra solo si el programa
los usa (`network`, `ntptime`) y **solo los helpers** (`_capi_dht`, `_capi_distance`,
`_capi_np_set`, `_capi_tone`, `_capi_wifi`, `_capi_http_get/post`) que necesitan los bloques
presentes. Los sombreros de evento se vuelven `def on_flag():` / `def on_start():` y se llaman al
final, bajo `# --- capiBlocks: arranque ---`. Los ids usados se recolectan recorriendo la cadena
(`getNextBlock()`) y los cuerpos `DO`, así que un helper solo aparece si su bloque está en el
lienzo. Para cualquier otro dispositivo la salida es la de siempre (`import cyberpi, event, time`
+ decoradores).

Los campos desplegables de pin declaran `optionsByDevice` (`esp32` clásico y `esp32s3` tienen
listas distintas: en la S3 los GPIO 26-37 son flash/PSRAM y no existen como pines). `fieldArgs`
resuelve las opciones con el dispositivo activo al definir los bloques, así que `setActiveDevice`
reconstruye las definiciones (`MBBlocks.relabel`) conservando el programa. Las variantes comparten
codegen: el motor normaliza `esp32s3` a su familia `esp32` antes de emitir Python.

`DEVICE_LIBRARY` (`script.ts`) declara `{ id, name, desc, file }`: `file` es
`assets/devices/<id>.svg`, con el id estable como nombre de archivo (una placa nueva = un SVG nuevo).
`renderDeviceLibrary()` pinta tarjetas `.device-card` con `<img>` en el modal y `renderDeviceList()`
usa la misma ilustración en el panel lateral; si faltara el archivo, cae a `DEVICE_THUMB_FALLBACK`.

### `MBSerial`

`src/serial.ts` encapsula Web Serial y el protocolo REPL crudo de MicroPython; no conoce la UI:
al conectar recibe `onLine` (cada línea de la placa) y `onStatus` (`'connecting' | 'connected' |
'disconnected'`), que `script.ts` usa para la consola y el estado del botón.

| Método | Qué hace |
|---|---|
| `available()` | ¿El navegador expone Web Serial? Si no, la UI desactiva Conectar con aviso. |
| `isConnected()` | ¿Hay un puerto abierto? |
| `connect({onLine,onStatus,baudRate})` | Pide el puerto al usuario (sin filtros) y arranca la lectura. |
| `disconnect()` | Suelta lector/escritor y cierra el puerto. |
| `interrupt()` | Ctrl-C: detiene el programa en la placa. |
| `writeLine(line)` | Envía una línea desde el input de la consola. |
| `replRun(code)` | **Live**: entra en REPL crudo, envía el código, espera `OK` y la salida. Devuelve `{ok, output, finished}`; `finished: false` cuando el programa sigue corriendo (`while True`). |
| `uploadMainPy(code)` | **Subir**: escribe `main.py` en chunks base64 (`ubinascii.a2b_base64`, sin dependencias en la placa) y hace soft reset (Ctrl-D) para que arranque solo. |

La UI de `script.ts` conecta esto a `serialConnectBtn`, `uploadToDeviceBtn`, `runBtn`/`stopBtn`
(Live si hay placa, simulación si no) y al modal de consola serial.

### `MBPythonEditor`

`mount(textarea)`, `mountPreview(el)`, `setValue(v)`, `getValue()`, `setPreview(v)`, `refresh()`,
`focus()`. Si CodeMirror no está disponible, la UI cae al `<textarea>` original.

### `MBSprites`

| Método | Qué hace |
|---|---|
| `list()` | Objetos del proyecto (`state.sprites`). |
| `active()` | Id del objeto activo. |
| `add(sprite)` | Añade uno (rellena los valores que falten), lo selecciona y devuelve su id. |
| `select(id)` / `remove(id)` | Cambia el objeto activo / borra uno (nunca el último). |
| `render()` | Repinta escena, lista e inputs. |

### `MBBackdrops`

| Método | Qué hace |
|---|---|
| `list()` | Ids de los fondos del proyecto. |
| `active()` | Id del fondo activo. |
| `catalog()` | Ids disponibles en `BACKDROP_LIBRARY`. |
| `add(id)` / `set(id)` | Añade un fondo al proyecto (sin duplicar) / activa uno. |
| `render()` | Repinta la lista de fondos. |

### `MBExamples`

Ventana de pruebas `window.MBExamples` (definida al final de `script.ts`, tras
`loadExampleProgram`).

| Método | Qué hace |
|---|---|
| `list()` | Devuelve `EXAMPLES` completo (id, name, desc, cat, thumb, device, steps). |
| `load(id, opts?)` | Carga el ejemplo con `loadExampleProgram`; `{ force: true }` omite la confirmación. Devuelve una promesa con `true`/`false`. |

`tests/e2e/examples.spec.js` la usa para recorrer **todo** el catálogo: cada ejemplo debe dejar
bloques, generar Python y tener la miniatura cargada (`naturalWidth > 0`).

## Formato de proyecto guardado

```json
{
  "name": "Clase IoT",
  "lang": "es",
  "device": "esp32",
  "blocks": { "engine": "blockly", "state": { "blocks": { "blocks": [ ... ] } } },
  "sprites": [
    { "id": "capi", "name": "Capi", "x": 0, "y": 0, "size": 100, "dir": 90,
      "visible": true, "hue": 0, "asset": "capi" }
  ],
  "activeSpriteId": "capi",
  "backdrops": ["blank", "forest"],
  "activeBackdropId": "blank",
  "savedAt": "2026-11-23T20:00:00.000Z"
}
```

- `sprites`, `activeSpriteId`, `backdrops` y `activeBackdropId` son las claves nuevas. `asset` lleva
  `'capi'`, una ruta del catálogo (`assets/sprites/...`) o el `data:` de un objeto subido.
- **Compatibilidad:** un proyecto sin `sprites` (los viejos) se restaura con el Capi y el lienzo
  blanco; `blocks` como arreglo plano se sigue leyendo. Al cargar se normaliza: ids ausentes o
  repetidos, números inválidos, entradas que no son objetos y fondos fuera del catálogo.
- `localStorage` (`mblock.lastProject`, la misma clave de siempre) admite hasta 2 MB de JSON: si el
  proyecto no cabe, se guardan todos los sprites menos los subidos (`data:`) y se avisa en pantalla;
  si aun así no cabe, no se guarda y también se avisa. El `.json` descargado siempre los lleva todos.

## Build y verificación

```
src/*.ts ──esbuild──▶ dist/app.js, dist/i18n.js
index.html, style.css, privacy.html, favicons ──copiar──▶ dist/
vendor/blockly, vendor/codemirror ──copiar──▶ dist/
assets/sprites, assets/backdrops, assets/devices, assets/examples ──copiar──▶ dist/assets/
```

- `node build.mjs` reconstruye `dist/` (requiere `pnpm install` una vez).
- `node check.mjs` valida archivos, referencias, ausencia de URLs externas y que el bundle exponga
  las APIs.
- `pnpm typecheck` ejecuta `tsc --noEmit`.
- `tests/e2e/editor.spec.js` y `tests/e2e/esp32.spec.js` prueban el comportamiento real en
  Chromium (Playwright): bloques, arrastre, ejemplos, paleta por dispositivo y codegen.
  `tests/e2e/examples.spec.js` recorre el catálogo de ejemplos completo (data-driven).

## Reglas de diseño

1. **Cero recursos externos**: nada de CDN, fuentes web ni APIs remotas. Debe funcionar en `file://`.
2. **IDs de bloque estables** (`mb_<id>`): cambiarlos rompe proyectos guardados.
3. **Una sola mascota**: el capibara es un SVG aprobado; reutilízalo con
   `<g transform="translate(...) scale(...)">` o clonando el nodo (como hace la escena).
4. **Acento en variables CSS** (`--HEADER-BG`, `--PRIMARY-COLOR`, `--BODY-BG`…): rebrandear es
   editar variables, no componentes.
5. **La fuente de verdad del programa es el workspace** de Blockly, no `state.blocks` (que solo se
   usa como respaldo cuando no hay motor).
6. **IDs del catálogo estables**: `SPRITE_LIBRARY`, `BACKDROP_LIBRARY` y `EXAMPLES` se guardan o se
   referencian por id; renombrar un id rompe partidas guardadas y specs.
