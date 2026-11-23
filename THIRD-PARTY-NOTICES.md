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

## Assets de las bibliotecas de objetos y fondos — Kenney (CC0 1.0)

- Autor: Kenney Vleugels — https://kenney.nl/
- Espejo utilizado para la descarga: https://github.com/shorepine/kenney (árbol `2d/`)
- Licencia: **Creative Commons Zero 1.0 Universal (CC0 1.0)** — https://creativecommons.org/publicdomain/zero/1.0/
  El archivo `LICENSE.txt` del espejo lo confirma: «License: (Creative Commons Zero, CC0) … You can use
  this content for personal, educational, and commercial purposes. Support by crediting 'Kenney' or
  'www.kenney.nl' (this is not a requirement)».
- Fecha de descarga: **23 de noviembre de 2026**.
- Atribución: **no obligatoria**. Kenney agradece una mención a «Kenney» o «www.kenney.nl»; capiBlocks
  la incluye aquí como cortesía, no por exigencia de la licencia.

Todos los archivos se normalizaron para el IDE: recorte del margen transparente, reescalado al lado
mayor de 128 px, paleta de 64 colores y PNG de 8 bits (los fondos, a 640×360 y 96 colores). CC0 permite
modificar y redistribuir sin condiciones. Las rutas de origen son las del espejo; los packs están
publicados en el catálogo de Kenney (https://kenney.nl/assets).

| Pack de Kenney | Archivo en `assets/` | Origen en el espejo |
|---|---|---|
| Animal Pack Remastered | `sprites/dog.png` | `2d/Animal Pack Remastered/Round/dog.png` |
| Animal Pack Remastered | `sprites/penguin.png` | `2d/Animal Pack Remastered/Round/penguin.png` |
| Animal Pack Remastered | `sprites/owl.png` | `2d/Animal Pack Remastered/Round/owl.png` |
| Animal Pack Remastered | `sprites/panda.png` | `2d/Animal Pack Remastered/Round/panda.png` |
| Toon Characters | `sprites/woman.png` | `2d/Toon Characters/Female person/Poses HD/character_femalePerson_idle.png` |
| Toon Characters | `sprites/man.png` | `2d/Toon Characters/Male person/Poses HD/character_malePerson_idle.png` |
| Toon Characters | `sprites/adventurer.png` | `2d/Toon Characters/Female adventurer/Poses HD/character_femaleAdventurer_idle.png` |
| Toon Characters | `sprites/robot.png` | `2d/Toon Characters/Robot/Poses HD/character_robot_idle.png` |
| Tappy Plane | `sprites/plane.png` | `2d/Tappy Plane/Planes/planeBlue1.png` |
| Racing Pack | `sprites/car.png` | `2d/Racing Pack/Cars/car_blue_1.png` |
| Alien UFO Pack | `sprites/spaceship.png` | `2d/Alien UFO Pack/shipBlue.png` |
| Platformer Assets Candy | `sprites/chocolate.png` | `2d/Platformer Assets Candy/choco.png` |
| Platformer Assets Candy | `sprites/cookie.png` | `2d/Platformer Assets Candy/cookieBrown.png` |
| Platformer Assets Candy | `sprites/lollipop.png` | `2d/Platformer Assets Candy/lollipopRed.png` |
| Sports Pack | `sprites/soccer-ball.png` | `2d/Sports Pack/Equipment/ball_soccer1.png` |
| Medals | `sprites/medal-gold.png` | `2d/Medals/flat_medal1.png` |
| Medals | `sprites/medal-silver.png` | `2d/Medals/flat_medal3.png` |
| Platformer Assets Base | `sprites/key.png` | `2d/Platformer Assets Base/Items/keyYellow.png` |
| Platformer Assets Base | `sprites/star.png` | `2d/Platformer Assets Base/Items/star.png` |
| Platformer Assets Base | `sprites/gem.png` | `2d/Platformer Assets Base/Items/gemBlue.png` |
| Background Elements Remastered | `sprites/house.png` | `2d/Background Elements Remastered/Retina/house1.png` |
| Background Elements Remastered | `sprites/castle.png` | `2d/Background Elements Remastered/Retina/castleSmall.png` |
| Generic Items | `sprites/microphone.png` | `2d/Generic Items/Colored/genericItem_color_083.png` |
| Generic Items | `sprites/headphones.png` | `2d/Generic Items/Colored/genericItem_color_084.png` |
| Background Elements Remastered | `backdrops/forest.png` | `2d/Background Elements Remastered/Backgrounds/backgroundColorForest.png` |
| Background Elements Remastered | `backdrops/autumn.png` | `2d/Background Elements Remastered/Backgrounds/backgroundColorFall.png` |
| Background Elements Remastered | `backdrops/desert.png` | `2d/Background Elements Remastered/Backgrounds/backgroundColorDesert.png` |
| Background Elements Remastered | `backdrops/meadow.png` | `2d/Background Elements Remastered/Backgrounds/backgroundColorGrass.png` |
| Background Elements Remastered | `backdrops/city.png` | Composición: `backgroundColorGrass.png` + `Retina/houseSmall1.png`, `house1.png`, `tower.png`, `house2.png`, `houseAlt2.png`, `houseAlt1.png` |
| Background Elements Remastered | `backdrops/school.png` | Composición: `backgroundColorGrass.png` + `Retina/tower.png`, `fence.png`, `houseAlt2.png` |
| Planets | `backdrops/space.png` | Composición: `Planets/planet02.png`, `planet03.png`, `planet09.png` + degradado y estrellas generados en el proyecto |
| (original del proyecto) | `backdrops/party.png` | Dibujado para capiBlocks (guirnalda, globos y confeti); sin material de terceros |

Notas de composición:

- `city`, `school` y `space` son escenas montadas para capiBlocks con elementos CC0 de Kenney. La
  licencia CC0 cubre también el resultado; no hay material de otra procedencia.
- `party` es un gráfico original del proyecto (MIT, como el resto del código), no un asset descargado.

## Ilustraciones de dispositivos y ejemplos — obra original (MIT)

- `assets/devices/*.svg` (6 placas: CyberPi, mBot2, Halocode, Arduino Uno, ESP32 y ESP32-S3) y
  `assets/examples/*.svg` (las 14 miniaturas del catálogo de ejemplos) son **SVG originales**,
  dibujados para capiBlocks. No proceden de Kenney, Scratch, Pixabay ni de ninguna otra biblioteca:
  no hay arte de terceros que atribuir.
- Licencia: **MIT**, la misma del código del proyecto (ver `LICENSE`).
- El capibara de las miniaturas de escenario se reutiliza del SVG aprobado del proyecto (regla 4 de
  `AGENTS.md`), escalado con `<g transform>`; no se redibuja ni se sustituye por arte externo.
- Todas son rutas locales (`assets/...`): ni fuentes web ni imágenes remotas.

No se han usado assets de Scratch (CC BY-SA), Pixabay ni de ninguna fuente con atribución
obligatoria. No se incluye ninguna mascota capibara alternativa: las imágenes de arriba son objetos.
