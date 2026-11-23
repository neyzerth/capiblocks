/**
 * Ejemplos de la categoría IoT (placa ESP32).
 *
 * Todos los pasos usan ids existentes de BLOCKS_BY_CAT; los bloques `esp32_*`
 * exigen `device: 'esp32'` para que el codegen salga con la placa correcta.
 */
import type { Example } from './examples';

export const EXAMPLES_IOT: ReadonlyArray<Example> = [
  {
    id: 'leds',
    name: 'ESP32: Arcoíris LED',
    desc: 'Cicla una tira neopixel en GPIO 16 por rojo, verde y azul.',
    cat: 'iot',
    thumb: 'assets/examples/leds.svg',
    device: 'esp32',
    steps: [
      { id: 'evt_flag' },
      { id: 'esp32_neopixel_fill', fields: { PIN: '16', N: 8, COLOR: '#ff5252' } },
      {
        id: 'ctrl_forever',
        do: [
          { id: 'esp32_neopixel_fill', fields: { PIN: '16', N: 8, COLOR: '#ff5252' } },
          { id: 'ctrl_wait', fields: { SECS: 0.5 } },
          { id: 'esp32_neopixel_fill', fields: { PIN: '16', N: 8, COLOR: '#66bb6a' } },
          { id: 'ctrl_wait', fields: { SECS: 0.5 } },
          { id: 'esp32_neopixel_fill', fields: { PIN: '16', N: 8, COLOR: '#42a5f5' } },
          { id: 'ctrl_wait', fields: { SECS: 0.5 } }
        ]
      }
    ]
  },
  {
    id: 'esp32-wifi',
    name: 'ESP32: WiFi + LED',
    desc: 'Conecta WiFi, enciende la tira neopixel y parpadea un pin.',
    cat: 'iot',
    thumb: 'assets/examples/esp32-wifi.svg',
    device: 'esp32',
    steps: [
      { id: 'evt_flag' },
      { id: 'esp32_wifi_connect', fields: { SSID: 'mi-red', PASS: '12345678' } },
      { id: 'esp32_neopixel_fill', fields: { PIN: '16', N: 8, COLOR: '#25cc76' } },
      {
        id: 'ctrl_forever',
        do: [
          { id: 'esp32_pin_out', fields: { PIN: '2', LEVEL: '1' } },
          { id: 'ctrl_wait', fields: { SECS: 1 } },
          { id: 'esp32_pin_out', fields: { PIN: '2', LEVEL: '0' } },
          { id: 'ctrl_wait', fields: { SECS: 1 } }
        ]
      }
    ]
  }
];
