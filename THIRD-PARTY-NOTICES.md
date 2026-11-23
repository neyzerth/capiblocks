# Avisos de terceros

## Blockly

- Proyecto: Blockly — https://github.com/google/blockly
- Versión vendorizada: 13.5.0 (`vendor/blockly/blockly.min.js` + `vendor/blockly/media/`)
- Licencia: Apache License 2.0. Copia completa en `vendor/blockly/LICENSE`.
- Uso: motor del lienzo de bloques, renderer `zelos`.

Blockly se distribuye **sin modificaciones** dentro de `vendor/blockly/`. El código de capiBlocks
es MIT; Blockly conserva su licencia Apache-2.0 y sus avisos de copyright.

## CodeMirror

- Proyecto: CodeMirror 5 — https://github.com/codemirror/codemirror5
- Versión vendorizada: 5.65.21 (`vendor/codemirror/`)
- Licencia: MIT. Copia en `vendor/codemirror/LICENSE`.
- Uso: editor de Python (resaltado, números de línea, Tab) y panel de vista previa.

## Inspiración de interfaz

La disposición visual (header, escenario, panel de dispositivos, paleta) está inspirada en editores
de bloques educativos como Scratch y mBlock. No se incluye código propietario de ninguno de los dos.
"Scratch" es una marca de la Scratch Foundation; "mBlock" y "Makeblock" son marcas de Makeblock Co., Ltd.
capiBlocks no está afiliado a ellos.

## Tipografías

Solo se usan fuentes del sistema (`-apple-system`, `Segoe UI`, `Roboto`, `Helvetica Neue`, `Arial`,
`Noto Sans`): no se descarga ninguna fuente.
