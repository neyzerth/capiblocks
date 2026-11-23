/**
 * Ejemplos de la categoría Básicos (bucles, variables y operadores).
 */
import type { Example } from './examples';

export const EXAMPLES_BASICOS: ReadonlyArray<Example> = [
  {
    id: 'counter',
    name: 'Bucle contador interactivo',
    desc: 'Usa un bucle repetir y una variable contadora para tocar notas.',
    cat: 'basico',
    thumb: 'assets/examples/counter.svg',
    device: 'esp32',
    steps: [
      { id: 'evt_flag' },
      { id: 'var_set', fields: { VAR: 'contador', VALUE: 1 } },
      {
        id: 'ctrl_repeat',
        fields: { TIMES: 5 },
        do: [
          { id: 'var_chg', fields: { VAR: 'contador', VALUE: 1 } },
          { id: 'esp32_buzzer_tone', fields: { FREQ: 392, PIN: '17', MS: 200 } }
        ]
      },
      { id: 'esp32_neopixel_fill', fields: { PIN: '16', N: 8, COLOR: '#25cc76' } }
    ]
  }
];
