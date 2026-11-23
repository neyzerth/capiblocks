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

## ADR-008 · MicroPython, no Arduino C++

**Contexto:** para que los bloques ejecuten en un ESP32 real sin backend, el navegador debe
producir algo que la placa entienda.

**Alternativas:** Arduino C++ compilado (lo que hace mBlock con mLink2) exige un toolchain y una
herramienta local que compile y flashee; un runtime propio en la placa es mucho más trabajo.

**Decisión:** generar **MicroPython** y enviarlo como texto por serial.

**Consecuencias:** cero compilación: Live es ejecutar por REPL y Subir es escribir `main.py`.
Solo se usan módulos del firmware oficial (`machine`, `time`, `network`, `dht`, `neopixel`,
`ntptime`, `usocket`); MQTT (`umqtt.simple`) y OLED (`ssd1306`) no vienen de fábrica y esperan al
flasheador/`mip` de la fase 3. Requiere grabar MicroPython una vez en la placa.

## ADR-009 · Web Serial directo, sin helper local (mLink)

**Contexto:** mBlock web necesita instalar mLink2 para hablar con el hardware.

**Alternativas:** un helper de escritorio (instalación, actualizaciones, otro binario que
mantener) frente a la API Web Serial del navegador.

**Decisión:** Web Serial (`navigator.serial`), disponible en Chrome/Edge/Opera de escritorio y en
`file://` (contexto seguro). Sin soporte, la UI se degrada con un aviso y la simulación sigue.

**Consecuencias:** no hay nada que instalar; el selector de puerto exige un gesto humano (los e2e
lo cubren con un puerto falso). El único punto OS-específico es el driver USB de la placa.

## ADR-010 · REPL crudo y subida en base64

**Contexto:** hay que ejecutar código y guardar un archivo en la placa sin instalar nada en ella.

**Decisión:** Live usa el **REPL crudo** de MicroPython (Ctrl-A, pegar el código, Ctrl-D/EOT,
leer `OK` y la salida). Subir escribe `main.py` por chunks codificados en **base64** que la placa
decodifica con `ubinascii` (viene en el firmware) y cierra con un soft reset (Ctrl-D).

**Consecuencias:** protocolo de texto, sin dependencias en la placa ni en el navegador. El `OK`
del REPL crudo llega pegado a la primera línea de salida (se limpia en `replRun`); un programa
infinito no devuelve terminador y se reporta como `finished: false`.

## ADR-011 · HTTP sin TLS en v1

**Contexto:** `urequests`/TLS no están garantizados en el firmware de fábrica y añaden peso.

**Decisión:** los bloques HTTP usan `usocket` directo al puerto 80. Las URLs se escriben sin
esquema y el helper elimina cualquier `://` con `split`.

**Consecuencias:** solo funciona con servidores HTTP (no HTTPS) en esta fase; queda documentado en
el propio bloque y en la guía. Evita además literales de URL externa en el bundle, que
`check.mjs` prohíbe.

## ADR-012 · Pines válidos según la variante de ESP32

**Contexto:** el mismo código ejecutado en un ESP32-S3 revienta con `ValueError: invalid pin` al
usar GPIO 26: en la S3 los GPIO 26-32 son la flash SPI y 33-37 la PSRAM octal.

**Decisión:** la biblioteca de dispositivos gana `esp32s3`, y los desplegables de pin declaran
`optionsByDevice` con la lista de cada variante. Los defaults que no valen en ambas (relé 26,
PIR 27, LDR 32) desaparecen: el default es la primera opción de la lista activa.

**Consecuencias:** el codegen no cambia (la API de `machine` es idéntica); solo cambian las
opciones de campo al cambiar de placa. Los ejemplos usan pines válidos en ambas variantes
(2, 4, 5, 16, 17, 18, 15).
