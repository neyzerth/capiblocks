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
  },
  {
    id: 'esc-baile-capi',
    name: 'Baile del capibara',
    desc: 'Capi se mueve, gira, saluda, suena una nota y cambia el fondo, todo en un bucle.',
    cat: 'escenario',
    thumb: 'assets/examples/esc-baile-capi.svg',
    steps: [
      { id: 'evt_flag' },
      {
        id: 'ctrl_repeat',
        fields: { TIMES: 3 },
        do: [
          { id: 'mov_steps' },
          { id: 'mov_turn' },
          { id: 'look_say' },
          { id: 'play_note', fields: { NOTE: 67 } },
          { id: 'look_bg' },
          { id: 'ctrl_wait', fields: { SECS: 1 } }
        ]
      }
    ]
  },
  {
    id: 'esc-fondos-saludo',
    name: 'Saludo con fondos',
    desc: 'Capi dice hola y cambia de fondo tres veces, con una pausa entre cada uno.',
    cat: 'escenario',
    thumb: 'assets/examples/esc-fondos-saludo.svg',
    steps: [
      { id: 'evt_flag' },
      { id: 'look_say' },
      {
        id: 'ctrl_repeat',
        fields: { TIMES: 3 },
        do: [
          { id: 'look_bg' },
          { id: 'ctrl_wait', fields: { SECS: 1 } }
        ]
      }
    ]
  }
];
