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
