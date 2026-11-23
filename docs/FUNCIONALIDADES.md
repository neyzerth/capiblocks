# Funcionalidades de capiBlocks

Alternativa a Scratch pensada para **IoT**: que los bloques hagan algo de verdad, no solo que se vean.
Leyenda: ✅ hecho · 🚧 en curso · ⬜ pendiente.

## 1. Editor de bloques

- ✅ Lienzo real (Blockly, render Scratch) con **arrastrar y encajar** entre bloques.
- ✅ Bloques desde la paleta: **arrastrando** al lienzo o con un clic.
- ✅ Mover, desconectar, borrar y seleccionar bloques; undo/redo; zoom; contador de bloques.
- ✅ 13 categorías IoT: Audio, LED, Pantalla, Sensores, LAN, IA, IoT, Eventos, Control,
  Operadores, Variables y bloques propios.
- ✅ Campos editables dentro de los bloques (color, texto, número) y bloques de evento (sombrero).
- ✅ Bucles y condicionales con bloques anidados dentro.
- ⬜ Menú contextual propio (duplicar/deshabilitar) alineado con Scratch.

## 2. IoT y código

- ✅ Dispositivos: **ESP32 (predeterminado)**, CyberPi, mBot2, Halocode, Arduino Uno.
  Se agregan y quitan desde la biblioteca de dispositivos.
- ✅ Bloques IoT: LEDs, matriz/pantalla, audio, sensores, LAN, IA, Wi-Fi/nube.
- ✅ **Vista Python** generada desde la pila real, con sangría según la anidación, y exportación `.py`.
- ✅ **Editor Python ligero** (CodeMirror): resaltado de sintaxis, números de línea, Tab/Shift-Tab, autocompletado de paréntesis y copiar/ejecutar.
- ⬜ Generación de código específico por placa (MicroPython/Arduino) y conexión real al hardware.

## 3. Simulación

- ✅ Escenario con mascota capibara: LEDs, pantalla, sonido, movimiento, giro, fondos.
- ✅ Ejecutar (bandera verde) y detener; los bloques repetidos se limitan para no colgar la página.
- ✅ **Varios objetos en escena**: lista dinámica con miniatura y nombre, selección, borrado (nunca
  el último) y tarjeta «+ Añadir»; los bloques y las propiedades actúan sobre el objeto activo.
- ✅ **Biblioteca de objetos**: 24 piezas con buscador (sin acentos), píldoras de categoría, doble
  clic para añadir y subida de PNG/SVG propios («Mis objetos»).
- ✅ **Pestaña Fondo**: lista de miniaturas, contador de disfraces y biblioteca con 4 presets CSS y
  8 imágenes; «siguiente fondo» recorre los fondos del proyecto.
- ⬜ Editor de pintura (el botón «Pintar» está deshabilitado).
- ⬜ Botones Disfraces y Sonidos del objeto y del escenario.
- ⬜ Subida de fondos propios.
- ⬜ Sensores simulados con controles (luz, botón, distancia).

## 4. Proyectos

- ✅ **Guardar en el navegador** y **restaurar al recargar** (nombre, dispositivo, bloques, objetos
  y fondos).
- ✅ Guardar/abrir proyecto en archivo `.json` (incluye objetos y fondos) y exportar Python.
- ✅ Si un objeto subido hace que el proyecto pase de 2 MB, el guardado local omite los subidos y
  avisa; el `.json` los conserva.
- ✅ **Nuevo proyecto** limpia el guardado (no resucita el anterior).
- ✅ Tres programas de ejemplo con **bloques reales**; si hay trabajo en el lienzo,
  se pide confirmación antes de reemplazarlo.
- ⬜ Lista de proyectos recientes (hoy se reabre solo el último).

## 5. Plataforma

- ✅ Interfaz en **español, inglés y chino**, con etiquetas de bloques que se traducen.
- ✅ **Funciona sin conexión**: cero peticiones externas; se puede abrir desde `file://`.
- ✅ Responsive a 1440/768; sin scroll lateral a 390 px.
- 🚧 Workspace utilizable en teléfono (< 768 px): hoy la paleta se ve, el lienzo se oculta.
- ✅ Privacidad: sin telemetría; la política vive en Ajustes, no estorba en la vista.
- ✅ Aviso de compatibilidad como icono en la barra de navegación (abre el estado del entorno);
  sin barra inferior permanente.

## 6. Calidad

- ✅ Código en **TypeScript** estricto (`pnpm typecheck`) y verificación del build (`node check.mjs`).
- ✅ Tests end-to-end con **Playwright** (`pnpm test:e2e`): bloques, arrastre, Python,
  guardado/restauración, objetos y fondos, ejemplos, ESP32 y layout móvil.
- ⬜ Tests unitarios de utilidades puras (sin DOM).
