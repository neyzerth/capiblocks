/**
 * Ejemplos de la categoría Escenario (objetos, fondos y sonido).
 */
import type { Example } from './examples';

export const EXAMPLES_ESCENARIO: ReadonlyArray<Example> = [
  {
    id: 'panda',
    name: 'Baile y saludo de Capi',
    desc: 'Mueve a Capi por el escenario, toca una nota y saluda.',
    cat: 'escenario',
    thumb: 'assets/examples/panda.svg',
    steps: [
      { id: 'evt_flag' },
      { id: 'mov_steps' },
      { id: 'look_say' },
      { id: 'play_note', fields: { NOTE: 64 } }
    ]
  }
];
