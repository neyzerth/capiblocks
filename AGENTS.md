# AGENTS.md — instrucciones para agentes de código

Proyecto: **capiBlocks**, un IDE de bloques para IoT (sitio estático, sin backend).
Idioma de la interfaz: español por defecto; el código y los commits pueden ir en español o inglés.

## Comandos

```bash
pnpm dev          # desarrollo: build + servidor + recarga al guardar (puerto 8080)
pnpm build        # construye dist/
pnpm preview      # sirve dist/ ya construido
pnpm check        # build + verificación (sale 1 si algo falta)

# equivalentes sin pnpm:
node dev.mjs [puerto] [--no-open]
node build.mjs
node serve.mjs
node check.mjs
```

No hay `npm install`: Blockly está vendorizado en `vendor/blockly/` (blockly.min.js + media/).
Si actualizas Blockly, reemplaza esos archivos y su LICENSE, y sube la versión en
THIRD-PARTY-NOTICES.md. El proyecto no tiene dependencias de runtime ni de build: cualquier
gestor (pnpm/npm) solo ejecuta scripts de Node.

## Mapa del código

- `index.html`: estructura del IDE (header, escenario, panel de dispositivos, paleta, workspace).
- `style.css`: tema completo. El color de acento vive en variables al inicio del archivo
  (`--HEADER-BG`, `--PRIMARY-COLOR`, `--BODY-BG`…). Rebrandear = tocar variables, no componentes.
- `script.js`: UI y estado. `BLOCKS_BY_CAT` es **la fuente única** del catálogo de bloques
  (id, color, `py`, `action`); los bloques de Blockly se generan desde ahí.
- `blockly-app.js`: `window.MBBlocks` — definición dinámica de bloques, inyección del workspace
  (renderer `zelos`), generación de Python, acciones para el simulador, serialización y carga.
- `i18n.js` + `locales/locales.js`: traducciones; las etiquetas de bloques se releen al cambiar idioma
  (`MBBlocks.relabel`).
- `build.mjs` / `serve.mjs` / `dev.mjs` / `check.mjs`: build, servidor local, modo desarrollo con recarga y verificación.

## Reglas que no se rompen

1. **Cero recursos externos.** Nada de CDNs, fuentes web ni APIs remotas: el sitio debe funcionar
   desde `file://`. `node check.mjs` lo verifica.
2. **Arrastrar y encajar es la función principal.** No sustituyas el workspace por chips HTML; si
   tocas el motor, prueba con eventos de ratón reales que dos bloques queden en una sola pila.
3. **IDs de bloque estables.** `BLOCKS_BY_CAT[].id` se guarda en los proyectos (`mb_<id>` en Blockly);
   renombrar un id rompe partidas guardadas. Añade ids nuevos en vez de renombrar.
4. **Una sola mascota.** El capibara es un SVG aprobado; para otros tamaños reutilízalo con
   `<g transform="translate(...) scale(...)">`, no lo dibujes de nuevo.
5. **Marca.** No reintroduzcas "mBlock"/"makeblock" en texto visible; el proyecto es capiBlocks.
6. **Python desde la pila real:** un sombrero (bloque con `hat`) es dueño de la cadena que le sigue;
   indenta `getNextBlock()` y emite `pass` si está vacío.
7. `dist/` no se versiona; se genera. Los cambios van en la raíz del repo.

## Verificación antes de dar algo por hecho

1. `pnpm check` en verde.
2. Abrir `http://localhost:8080` a 1440 px: añadir dos bloques desde la paleta, arrastrar uno sobre
   otro y confirmar **una sola pila** + código Python con sangría correcta.
3. Pulsar la bandera verde: el LED se enciende y el escenario muestra el texto.
4. Abrir `dist/index.html` directamente (`file://`) y confirmar que el motor arranca.
5. Revisar que no haya scroll lateral a 390 px.

## Pendientes conocidos

- Workspace en móvil (< 768 px) está oculto por CSS: falta un panel o pestaña que lo muestre.
- La paleta añade bloques con clic; falta arrastrarlos desde el flyout al lienzo.
