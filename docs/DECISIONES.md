# Decisiones de diseño

Registro corto de por qué el proyecto es como es. Fecha aproximada: noviembre 2026.

## ADR-001 · Motor de bloques: Blockly

**Contexto:** se necesita un lienzo real de bloques (arrastrar, encajar, anidar) para una
alternativa a Scratch orientada a IoT.

**Alternativas:** `scratch-blocks` (aspecto exacto de Scratch, pero fork compilado con Closure y más
pesado de vendorizar), `Mixly` (licencia GPL/poco clara, descartado para empotrar), Blockly.

**Decisión:** Blockly 13.5.0 (Apache-2.0), renderer `zelos` para el aspecto Scratch.

**Consecuencias:** licencia compatible con MIT, UMD fácil de vendorizar y tipos disponibles; el
aspecto no es idéntico al de Scratch pero se acerca. El generador de Python de Blockly es ESM:
se usa un recorrido propio (~40 líneas) en lugar de empaquetarlo.

## ADR-002 · Editor de Python: CodeMirror 5

**Contexto:** la pestaña Python era un `<textarea>` plano; se pidió resaltado, números de línea y Tab.

**Alternativas:** CodeMirror 6 (modular, requiere bundler y más configuración), Monaco (varios MB),
Ace (pesado), escribir uno propio (frágil).

**Decisión:** CodeMirror 5.65 (MIT), vendorizado, con modo Python y addons de paréntesis.

**Consecuencias:** ~430 KB en disco, funciona desde `file://`, API pequeña. Es la versión “legacy”
pero mantenida y suficiente para un editor de una sola pestaña.

## ADR-003 · Sin framework: HTML estático + TypeScript

**Contexto:** una sola pantalla, estado pequeño, la complejidad real está en Blockly/CodeMirror.

**Decisión:** no usar React/Vue/Svelte por ahora; sí TypeScript estricto y bundle con esbuild.

**Consecuencias:** cero dependencias en runtime, build rápido y sitio offline. El glue vive en
`src/script.ts` (~1.400 líneas). **Revisar si:** aparecen varias pantallas (lista de proyectos,
aula), más de dos colaboradores, o el glue supera ~5–8k líneas; entonces Svelte 5 + Vite por partes.

## ADR-004 · Motores vendorizados, sin CDN

**Contexto:** el aula puede no tener internet y el sitio debe abrirse con doble clic.

**Decisión:** Blockly y CodeMirror se copian a `vendor/` y `build.mjs` los lleva a `dist/`.
`check.mjs` falla si aparece una URL externa.

**Consecuencias:** repo más grande (~1,2 MB) y actualizaciones manuales, a cambio de
reproducibilidad total y funcionamiento offline.

## ADR-005 · Guardado local y archivos JSON

**Contexto:** no hay backend ni cuentas.

**Decisión:** el último proyecto se guarda en `localStorage` y se restaura al abrir; además se
puede exportar/importar un `.json` y exportar `.py`.

**Consecuencias:** no hay sincronización entre equipos ni historial; borrar datos del navegador
pierde el proyecto. El formato incluye `{engine:'blockly', state}` y se mantiene la lectura del
formato viejo (arreglo plano).

## ADR-006 · Licencia MIT

**Contexto:** proyecto educativo que otros profesores y alumnos pueden querer reutilizar.

**Decisión:** MIT para el código propio; Blockly (Apache-2.0) y CodeMirror (MIT) conservan sus
licencias y avisos en `THIRD-PARTY-NOTICES.md`.

**Consecuencias:** máxima reutilización; si una institución exige cláusula de patentes, cambiar a
Apache-2.0 es sustituir `LICENSE` y el aviso.

## ADR-007 · Despliegue estático en GitHub Pages

**Contexto:** no se quiere operar servidores.

**Decisión:** GitHub Actions construye `dist/` y lo publica en Pages; CI corre typecheck, build,
verificación y tests end-to-end.

**Consecuencias:** Pages cachea 10 minutos; cada push a `main` publica. Limitaciones de Pages
(tamaño, sin headers propios) son aceptables para este sitio.

## ADR-008 · Biblioteca de objetos y fondos: assets CC0 de Kenney

**Contexto:** mBlock copia la biblioteca de Scratch (sprites y escenas) desde su CDN. capiBlocks
necesita lo mismo, pero sin recursos externos y sin cargas legales para un proyecto educativo.

**Alternativas:** assets de Scratch (**CC BY-SA 2.0**: atribución obligatoria y share-alike, además
de servirlos desde un CDN), Pixabay (su licencia prohíbe redistribuir el asset como tal), dibujar
las ~36 piezas (mucho trabajo y estilo irregular), Kenney.

**Decisión:** 24 objetos y 12 fondos (4 presets CSS y 8 imágenes) **CC0 de Kenney**, con los assets
de imagen versionados en `assets/`, normalizados a PNG ligero y con la procedencia anotada en
`THIRD-PARTY-NOTICES.md`.

**Consecuencias:** CC0 no exige atribución ni share-alike (la mención a Kenney es cortesía), así que
los assets pueden mezclarse con el código MIT sin condiciones. La biblioteca es pequeña a propósito
(24+12, menos de 300 KB): `dist/` sigue siendo ligero y todo carga desde `file://`. Ampliarla es
añadir entradas al catálogo con un **id nuevo**; los ids existentes no se renombran porque se
guardan en los proyectos.

## ADR-009 · El capibara se clona, no se redibuja

**Contexto:** con varios objetos en escena hacen falta varias copias del mismo SVG, en el escenario y
en las miniaturas de la lista.

**Alternativas:** redibujar el capibara por tamaño (rompe la regla 4 y multiplica el mantenimiento),
usar un `<img>` con el SVG como archivo aparte (obliga a mover el dibujo fuera del HTML), clonar el
nodo existente.

**Decisión:** `captureCapiTemplate()` clona una vez el SVG de `#stageSprite` en `capiTemplateSvg`, y
`spriteVisual()`/`spriteThumb()` clonan esa plantilla; `applySpriteStyle()` aplica el
`translate/rotate/scale` al contenedor de cada objeto.

**Consecuencias:** una sola fuente de verdad del dibujo aprobado y ningún redibujado; si el SVG
cambia, cambian todas las copias. Los objetos de la biblioteca son `<img>` normales y no entran en
esta regla.

## ADR-010 · localStorage con tope de 2 MB y descarte de objetos subidos

**Contexto:** un objeto subido se incrusta como `data:` dentro del proyecto y puede pesar varios MB;
`localStorage` ronda los 5 MB por origen y el navegador cuenta UTF-16.

**Alternativas:** no permitir subidas (pierde la función más útil), guardar solo rutas (imposible
para archivos del usuario), comprimir imágenes en el navegador (más código y calidad dudosa), fijar
un tope y avisar.

**Decisión:** `payloadForStorage()` deja el JSON completo si cabe en 2 MB; si no, quita **solo** los
sprites con `asset` `data:` y muestra un aviso. El `.json` descargado siempre los incluye todos.

**Consecuencias:** el guardado local no falla en silencio por cuota y el resto del proyecto se
conserva; al recargar pueden faltar los objetos subidos, y para no perderlos hay que descargar el
`.json`. Si al quitar los subidos todavía no cabe, el guardado falla con aviso. Los objetos de la
biblioteca (rutas del catálogo) nunca se descartan.

## ADR-011 · Fuera de alcance: editor de pintura, disfraces y sonidos

**Contexto:** en mBlock, «Pintar» y los botones Disfraces/Sonidos abren editores grandes (lienzo de
dibujo, gestor de trajes y de audio) que no aportan al objetivo IoT del proyecto.

**Decisión:** no implementarlos. «Pintar» y «Subir fondo» quedan deshabilitados con un tooltip de
«pendiente», y Disfraces/Sonidos se muestran sin acción. Quien necesite arte propio sube un PNG o
SVG desde la biblioteca de objetos.

**Consecuencias:** el esfuerzo se queda en arrastrar/encajar, el simulador y las bibliotecas; se
evita duplicar un editor de imágenes dentro del IDE. **Revisar si:** se pide edición de arte o
sonido como actividad de clase.

## ADR-013 · MicroPython, no Arduino C++

**Contexto:** para que los bloques ejecuten en un ESP32 real sin backend, el navegador debe
producir algo que la placa entienda.

**Alternativas:** Arduino C++ compilado (lo que hace mBlock con mLink2) exige un toolchain y una
herramienta local que compile y flashee; un runtime propio en la placa es mucho más trabajo.

**Decisión:** generar **MicroPython** y enviarlo como texto por serial.

**Consecuencias:** cero compilación: Live es ejecutar por REPL y Subir es escribir `main.py`.
Solo se usan módulos del firmware oficial (`machine`, `time`, `network`, `dht`, `neopixel`,
`ntptime`, `usocket`); MQTT (`umqtt.simple`) y OLED (`ssd1306`) no vienen de fábrica y esperan al
flasheador/`mip` de la fase 3. Requiere grabar MicroPython una vez en la placa.

## ADR-014 · Web Serial directo, sin helper local (mLink)

**Contexto:** mBlock web necesita instalar mLink2 para hablar con el hardware.

**Alternativas:** un helper de escritorio (instalación, actualizaciones, otro binario que
mantener) frente a la API Web Serial del navegador.

**Decisión:** Web Serial (`navigator.serial`), disponible en Chrome/Edge/Opera de escritorio y en
`file://` (contexto seguro). Sin soporte, la UI se degrada con un aviso y la simulación sigue.

**Consecuencias:** no hay nada que instalar; el selector de puerto exige un gesto humano (los e2e
lo cubren con un puerto falso). El único punto OS-específico es el driver USB de la placa.

## ADR-015 · REPL crudo y subida en base64

**Contexto:** hay que ejecutar código y guardar un archivo en la placa sin instalar nada en ella.

**Decisión:** Live usa el **REPL crudo** de MicroPython (Ctrl-A, pegar el código, Ctrl-D/EOT,
leer `OK` y la salida). Subir escribe `main.py` por chunks codificados en **base64** que la placa
decodifica con `ubinascii` (viene en el firmware) y cierra con un soft reset (Ctrl-D).

**Consecuencias:** protocolo de texto, sin dependencias en la placa ni en el navegador. El `OK`
del REPL crudo llega pegado a la primera línea de salida (se limpia en `replRun`); un programa
infinito no devuelve terminador y se reporta como `finished: false`.

## ADR-016 · HTTP sin TLS en v1

**Contexto:** `urequests`/TLS no están garantizados en el firmware de fábrica y añaden peso.

**Decisión:** los bloques HTTP usan `usocket` directo al puerto 80. Las URLs se escriben sin
esquema y el helper elimina cualquier `://` con `split`.

**Consecuencias:** solo funciona con servidores HTTP (no HTTPS) en esta fase; queda documentado en
el propio bloque y en la guía. Evita además literales de URL externa en el bundle, que
`check.mjs` prohíbe.

## ADR-017 · Pines válidos según la variante de ESP32

**Contexto:** el mismo código ejecutado en un ESP32-S3 revienta con `ValueError: invalid pin` al
usar GPIO 26: en la S3 los GPIO 26-32 son la flash SPI y 33-37 la PSRAM octal.

**Decisión:** la biblioteca de dispositivos gana `esp32s3`, y los desplegables de pin declaran
`optionsByDevice` con la lista de cada variante. Los defaults que no valen en ambas (relé 26,
PIR 27, LDR 32) desaparecen: el default es la primera opción de la lista activa.

**Consecuencias:** el codegen no cambia (la API de `machine` es idéntica); solo cambian las
opciones de campo al cambiar de placa. Los ejemplos usan pines válidos en ambas variantes
(2, 4, 5, 16, 17, 18, 15).

## ADR-018 · Animaciones de UI: CSS puro con cierre asíncrono

**Contexto:** los modales, el toast, los submenús, el panel de bloques (flyout) y las pestañas del
panel izquierdo aparecían y desaparecían de golpe. El atributo `hidden` de HTML no permite animar
la salida: `display:none` mata la animación al instante.

**Decisión:** la entrada corre sola con keyframes CSS al quitar `hidden` (volver de `display:none`
reinicia la animación). La salida usa una clase transitoria (`.closing` en modales y flyout,
`.hiding` en el toast) que el JS limpia y oculta cuando termina (`hideElAnimated`). Las pestañas
del panel izquierdo solo animan la entrada: la salida instantánea mantiene el cambio inmediato.
Todo se desactiva con `prefers-reduced-motion: reduce`.

**Consecuencias:** cero dependencias y sin cambios en el HTML; el cierre deja de ser instantáneo, por
lo que el código y las pruebas deben pasar por los helpers de cierre (`closeAllModals()` /
`hideElAnimated()`) y aserciones que reintentan (ver la
trampa en GUIA-DESARROLLO.md). **Revisar si:** alguna interacción necesita el modal oculto de forma
síncrona.

## ADR-019 · Dots del workspace: patrón de Blockly, no fondo CSS

**Contexto:** los dots de la cuadrícula vivían en un `radial-gradient` del `.blocks-canvas`, pero
el SVG de Blockly pinta su fondo opaco encima: en modo bloques nunca se veían y la casilla "Show
Workspace Grid Dots" conmutaba una clase sin efecto visible.

**Decisión:** la cuadrícula la dibuja Blockly (`grid` en las opciones de inyección: dots de
~0.9 px cada 19.2 unidades, mismo look que el fondo CSS original), así se desplaza y escala con
el lienzo como en mBlock. La casilla apaga el patrón tapando el rect de fondo con CSS
(`fill !important` gana al estilo inline de Blockly) y la preferencia se guarda en
`mblock.gridDots`, con el mismo restablecimiento que el resto de preferencias.

**Consecuencias:** el `radial-gradient` queda solo como look previo a la inyección de Blockly.
**Revisar si:** el tema cambia `workspaceBackgroundColour` (el CSS de apagado asume `#ffffff`).

## ADR-020 · Catálogo de ejemplos tipado, SVG propios y placa declarada

**Contexto:** el modal de ejemplos eran cuatro tarjetas estáticas en `index.html` con los pasos en una
constante de `script.ts`. No había categorías, buscador ni imagen, y cargar un ejemplo con bloques
`esp32_*` estando activa otra placa generaba código incoherente.

**Alternativas:** mantener los datos en `script.ts` y las tarjetas en HTML (cada ejemplo nuevo obliga
a tocar markup y traducciones), un JSON cargado con `fetch` (rompe `file://` y la regla de cero
recursos externos), o un catálogo tipado en TS como el de objetos y fondos.

**Decisión:** catálogo tipado en `src/examples.ts` como fuente única —`Example`, `ExampleStep`,
`EXAMPLE_CATEGORIES`, `EXAMPLES`— que concatena un archivo de datos por categoría
(`examples-iot.ts`, `examples-escenario.ts`, `examples-basicos.ts`). `name`/`desc` van en español
directo, igual que los nombres de objetos y fondos; solo el chrome del modal pasa por claves i18n.
Miniaturas e ilustraciones son SVG **originales** en `assets/`. Cada ejemplo que necesita una placa
concreta declara `device`, y al cargarlo se añade y se activa. Una spec data-driven recorre **todo**
el catálogo como red de seguridad.

**Consecuencias:** añadir un ejemplo es añadir una entrada y un SVG, sin tocar HTML ni i18n; los
archivos por categoría permiten escribir contenido en paralelo sin conflictos. `device` no cambia el
codegen: solo garantiza que la placa activa sea la del ejemplo. La spec convierte un id de bloque
inventado en un fallo con el nombre del ejemplo. Los `id` son estables (regla 3): se cambian los
títulos, nunca los ids. Al ser obra propia (MIT), los SVG no añaden condiciones de terceros.
