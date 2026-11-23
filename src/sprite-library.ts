/**
 * Catálogo de assets de las bibliotecas de objetos y fondos.
 *
 * Reglas que aplican a este archivo:
 * - Los `id` son ESTABLES: se guardarán dentro de los proyectos (regla 3 de AGENTS.md).
 *   No renombrar un id existente; para cambiar el nombre visible se toca `name`.
 * - Todas las rutas `file` son relativas a la raíz del sitio (`dist/`), sin URLs
 *   remotas: el IDE debe funcionar desde `file://` (regla 1).
 * - Todos los assets son CC0 (Kenney). Ver THIRD-PARTY-NOTICES.md para la
 *   procedencia y la licencia de cada archivo.
 */

export type SpriteCategory =
  | 'animales'
  | 'personas'
  | 'transporte'
  | 'comida'
  | 'deportes'
  | 'props'
  | 'edificios'
  | 'música';

export type BackdropCategory =
  | 'escuela'
  | 'naturaleza'
  | 'ciudad'
  | 'espacio'
  | 'fiestas'
  | 'cuadrícula';

export interface SpriteAsset {
  id: string;
  name: string;
  cat: SpriteCategory;
  file: string;
}

export interface BackdropAsset {
  id: string;
  name: string;
  cat: BackdropCategory;
  /** Ruta relativa; ausente en los presets CSS. */
  file?: string;
  /** true = lo pinta setBackdrop() con las clases CSS que ya existen. */
  preset?: boolean;
}

/** Etiquetas para las píldoras de categoría del modal. `labelKey` es la clave i18n. */
export const SPRITE_CATEGORIES: ReadonlyArray<{ id: SpriteCategory; label: string; labelKey: string }> = [
  { id: 'animales', label: 'Animales', labelKey: 'spriteCatAnimales' },
  { id: 'personas', label: 'Personas', labelKey: 'spriteCatPersonas' },
  { id: 'transporte', label: 'Transporte', labelKey: 'spriteCatTransporte' },
  { id: 'comida', label: 'Comida', labelKey: 'spriteCatComida' },
  { id: 'deportes', label: 'Deportes', labelKey: 'spriteCatDeportes' },
  { id: 'props', label: 'Objetos', labelKey: 'spriteCatProps' },
  { id: 'edificios', label: 'Edificios', labelKey: 'spriteCatEdificios' },
  { id: 'música', label: 'Música', labelKey: 'spriteCatMusica' }
];

/** Etiquetas para las píldoras de categoría del modal de fondos. */
export const BACKDROP_CATEGORIES: ReadonlyArray<{ id: BackdropCategory; label: string; labelKey: string }> = [
  { id: 'escuela', label: 'Escuela', labelKey: 'backdropCatEscuela' },
  { id: 'naturaleza', label: 'Naturaleza', labelKey: 'backdropCatNaturaleza' },
  { id: 'ciudad', label: 'Ciudad', labelKey: 'backdropCatCiudad' },
  { id: 'espacio', label: 'Espacio', labelKey: 'backdropCatEspacio' },
  { id: 'fiestas', label: 'Fiestas', labelKey: 'backdropCatFiestas' },
  { id: 'cuadrícula', label: 'Cuadrícula', labelKey: 'backdropCatCuadricula' }
];

/** ~24 objetos (no mascotas: el capibara sigue siendo el único, regla 4). */
export const SPRITE_LIBRARY: ReadonlyArray<SpriteAsset> = [
  // Animales
  { id: 'dog', name: 'Perro', cat: 'animales', file: 'assets/sprites/dog.png' },
  { id: 'penguin', name: 'Pingüino', cat: 'animales', file: 'assets/sprites/penguin.png' },
  { id: 'owl', name: 'Búho', cat: 'animales', file: 'assets/sprites/owl.png' },
  { id: 'panda', name: 'Panda', cat: 'animales', file: 'assets/sprites/panda.png' },
  // Personas
  { id: 'woman', name: 'Mujer', cat: 'personas', file: 'assets/sprites/woman.png' },
  { id: 'man', name: 'Hombre', cat: 'personas', file: 'assets/sprites/man.png' },
  { id: 'adventurer', name: 'Aventurera', cat: 'personas', file: 'assets/sprites/adventurer.png' },
  { id: 'robot', name: 'Robot', cat: 'personas', file: 'assets/sprites/robot.png' },
  // Transporte
  { id: 'plane', name: 'Avión', cat: 'transporte', file: 'assets/sprites/plane.png' },
  { id: 'car', name: 'Coche', cat: 'transporte', file: 'assets/sprites/car.png' },
  { id: 'spaceship', name: 'Nave espacial', cat: 'transporte', file: 'assets/sprites/spaceship.png' },
  // Comida
  { id: 'chocolate', name: 'Chocolate', cat: 'comida', file: 'assets/sprites/chocolate.png' },
  { id: 'cookie', name: 'Galleta', cat: 'comida', file: 'assets/sprites/cookie.png' },
  { id: 'lollipop', name: 'Piruleta', cat: 'comida', file: 'assets/sprites/lollipop.png' },
  // Deportes
  { id: 'soccer-ball', name: 'Balón de fútbol', cat: 'deportes', file: 'assets/sprites/soccer-ball.png' },
  { id: 'medal-gold', name: 'Medalla de oro', cat: 'deportes', file: 'assets/sprites/medal-gold.png' },
  { id: 'medal-silver', name: 'Medalla de plata', cat: 'deportes', file: 'assets/sprites/medal-silver.png' },
  // Objetos
  { id: 'key', name: 'Llave', cat: 'props', file: 'assets/sprites/key.png' },
  { id: 'star', name: 'Estrella', cat: 'props', file: 'assets/sprites/star.png' },
  { id: 'gem', name: 'Gema', cat: 'props', file: 'assets/sprites/gem.png' },
  // Edificios
  { id: 'house', name: 'Casa', cat: 'edificios', file: 'assets/sprites/house.png' },
  { id: 'castle', name: 'Castillo', cat: 'edificios', file: 'assets/sprites/castle.png' },
  // Música
  { id: 'microphone', name: 'Micrófono', cat: 'música', file: 'assets/sprites/microphone.png' },
  { id: 'headphones', name: 'Auriculares', cat: 'música', file: 'assets/sprites/headphones.png' }
];

/**
 * Fondos de la biblioteca. Los cuatro primeros son los presets que el IDE ya
 * tiene: setBackdrop() en src/script.ts los reconoce por id ('blank' | 'grid' |
 * 'sky' | 'night') y les aplica las clases CSS `backdrop-*`. Por eso no llevan
 * `file`. Las entradas con `file` las resolverá la tarea del modal de fondos.
 */
export const BACKDROP_LIBRARY: ReadonlyArray<BackdropAsset> = [
  { id: 'blank', name: 'Lienzo blanco', cat: 'cuadrícula', preset: true },
  { id: 'grid', name: 'Cuadrícula', cat: 'cuadrícula', preset: true },
  { id: 'sky', name: 'Cielo azul', cat: 'naturaleza', preset: true },
  { id: 'night', name: 'Noche estrellada', cat: 'espacio', preset: true },
  { id: 'forest', name: 'Bosque', cat: 'naturaleza', file: 'assets/backdrops/forest.png' },
  { id: 'autumn', name: 'Otoño', cat: 'naturaleza', file: 'assets/backdrops/autumn.png' },
  { id: 'desert', name: 'Desierto', cat: 'naturaleza', file: 'assets/backdrops/desert.png' },
  { id: 'meadow', name: 'Pradera', cat: 'naturaleza', file: 'assets/backdrops/meadow.png' },
  { id: 'city', name: 'Ciudad', cat: 'ciudad', file: 'assets/backdrops/city.png' },
  { id: 'school', name: 'Escuela', cat: 'escuela', file: 'assets/backdrops/school.png' },
  { id: 'space', name: 'Espacio', cat: 'espacio', file: 'assets/backdrops/space.png' },
  { id: 'party', name: 'Fiesta', cat: 'fiestas', file: 'assets/backdrops/party.png' }
];
