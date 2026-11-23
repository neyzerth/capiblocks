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
  },
  {
    id: 'bas-luces-repetir',
    name: 'Luces con repetir',
    desc: 'Pinta la tira de LED de rojo y de verde tres veces, con una pausa entre colores.',
    cat: 'basico',
    thumb: 'assets/examples/bas-luces-repetir.svg',
    device: 'esp32',
    steps: [
      { id: 'evt_flag' },
      {
        id: 'ctrl_repeat',
        fields: { TIMES: 3 },
        do: [
          { id: 'esp32_neopixel_fill', fields: { PIN: '16', N: 8, COLOR: '#ff695a' } },
          { id: 'ctrl_wait', fields: { SECS: 1 } },
          { id: 'esp32_neopixel_fill', fields: { PIN: '16', N: 8, COLOR: '#25cc76' } },
          { id: 'ctrl_wait', fields: { SECS: 1 } }
        ]
      },
      { id: 'esp32_neopixel_off', fields: { PIN: '16', N: 8 } }
    ]
  },
  {
    id: 'bas-variables-operadores',
    name: 'Cuenta con variables',
    desc: 'Una variable suma de dos en dos dentro de un bucle y anuncia el final en pantalla.',
    cat: 'basico',
    thumb: 'assets/examples/bas-variables-operadores.svg',
    device: 'cyberpi',
    steps: [
      { id: 'evt_flag' },
      { id: 'var_set', fields: { VAR: 'puntos', VALUE: 0 } },
      {
        id: 'ctrl_repeat',
        fields: { TIMES: 4 },
        do: [
          { id: 'var_chg', fields: { VAR: 'puntos', VALUE: 2 } },
          { id: 'disp_print', fields: { TEXT: 'sumando 2 puntos' } },
          { id: 'ctrl_wait', fields: { SECS: 1 } }
        ]
      },
      { id: 'disp_print', fields: { TEXT: '¡meta lograda!' } }
    ]
  }
];
