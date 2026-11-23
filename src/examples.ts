/**
 * Catálogo de programas de ejemplo (fuente única, como `sprite-library.ts`).
 *
 * Reglas que aplican a este archivo:
 * - Los `id` son ESTABLES: se usan desde los specs y no deben renombrarse
 *   (regla 3 de AGENTS.md). Para cambiar el título visible se toca `name`.
 * - `steps` alimenta `MBBlocks.loadProgram(steps)`; cada `id` de paso debe
 *   existir en `BLOCKS_BY_CAT` (src/script.ts).
 * - `thumb` es una ruta RELATIVA (`assets/examples/<id>.svg`), sin URLs
 *   remotas: el IDE debe funcionar desde `file://` (regla 1).
 * - `name`/`desc` van en español directo, igual que los nombres de objetos y
 *   fondos de `sprite-library.ts`; solo el chrome del modal se traduce.
 * - `device`: placa necesaria si el ejemplo usa bloques exclusivos de una
 *   familia (p. ej. `esp32_neopixel_fill` exige `esp32`). Al cargar se añade y
 *   se activa antes de montar la pila.
 */
import { EXAMPLES_IOT } from './examples-iot';
import { EXAMPLES_ESCENARIO } from './examples-escenario';
import { EXAMPLES_BASICOS } from './examples-basicos';

export type ExampleCategory = 'iot' | 'escenario' | 'basico';

export interface ExampleStep {
  /** id de un bloque de BLOCKS_BY_CAT (existente, nunca inventado). */
  id: string;
  /** Valores de los campos del bloque. */
  fields?: Record<string, string | number>;
  /** Bloques anidados (cuerpo de bucles/condicionales). */
  do?: ExampleStep[];
}

export interface Example {
  /** ESTABLE: 'panda', 'leds', 'counter', 'esp32-wifi' se conservan. */
  id: string;
  /** Español directo (mismo criterio que SPRITE_LIBRARY). */
  name: string;
  /** Una línea, lenguaje llano. */
  desc: string;
  cat: ExampleCategory;
  /** 'assets/examples/<id>.svg' — ruta local, prohibida una URL remota. */
  thumb: string;
  /** id de DEVICE_LIBRARY si usa bloques exclusivos de esa placa. */
  device?: string;
  /**
   * Fondos del proyecto que trae el ejemplo (ids de BACKDROP_LIBRARY).
   * Sin esto, "siguiente fondo" cicla una lista de uno y no cambia nada.
   */
  backdrops?: string[];
  /** Alimenta MBBlocks.loadProgram(steps). */
  steps: ExampleStep[];
}

/** Píldoras de categoría del modal; `labelKey` es la clave i18n. */
export const EXAMPLE_CATEGORIES: ReadonlyArray<{ id: ExampleCategory; labelKey: string }> = [
  { id: 'iot', labelKey: 'exCatIot' },
  { id: 'escenario', labelKey: 'exCatEscenario' },
  { id: 'basico', labelKey: 'exCatBasico' }
];

/** Todos los ejemplos: un archivo de datos por categoría (olas de contenido). */
export const EXAMPLES: ReadonlyArray<Example> = [
  ...EXAMPLES_IOT,
  ...EXAMPLES_ESCENARIO,
  ...EXAMPLES_BASICOS
];
