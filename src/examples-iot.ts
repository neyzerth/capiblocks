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
  },
  {
    id: 'iot-riego',
    name: 'Riego automático',
    desc: 'Lee la humedad de la tierra, abre la bomba cinco segundos y espera un minuto.',
    cat: 'iot',
    thumb: 'assets/examples/iot-riego.svg',
    device: 'esp32',
    steps: [
      { id: 'evt_flag' },
      { id: 'var_set', fields: { VAR: 'humedad', VALUE: 0 } },
      {
        id: 'ctrl_forever',
        do: [
          { id: 'esp32_pin_analog', fields: { PIN: '34', VAR: 'humedad' } },
          { id: 'esp32_relay', fields: { PIN: '26', STATE: '1' } },
          { id: 'ctrl_wait', fields: { SECS: 5 } },
          { id: 'esp32_relay', fields: { PIN: '26', STATE: '0' } },
          { id: 'ctrl_wait', fields: { SECS: 60 } }
        ]
      }
    ]
  },
  {
    id: 'iot-alarma-luz',
    name: 'Alarma por luz',
    desc: 'Lee la luz del sensor y avisa con la tira en rojo y un pitido, un segundo sí y otro no.',
    cat: 'iot',
    thumb: 'assets/examples/iot-alarma-luz.svg',
    device: 'esp32',
    steps: [
      { id: 'evt_flag' },
      { id: 'esp32_neopixel_off', fields: { PIN: '16', N: 8 } },
      {
        id: 'ctrl_forever',
        do: [
          { id: 'esp32_read_ldr', fields: { PIN: '35', VAR: 'luz' } },
          { id: 'esp32_neopixel_fill', fields: { PIN: '16', N: 8, COLOR: '#ff695a' } },
          { id: 'esp32_buzzer_tone', fields: { FREQ: 880, PIN: '17', MS: 200 } },
          { id: 'ctrl_wait', fields: { SECS: 1 } },
          { id: 'esp32_neopixel_off', fields: { PIN: '16', N: 8 } },
          { id: 'ctrl_wait', fields: { SECS: 1 } }
        ]
      }
    ]
  },
  {
    id: 'iot-semaforo',
    name: 'Semáforo',
    desc: 'Enciende verde, ámbar y rojo por turnos, cada uno con su tiempo, en un bucle sin fin.',
    cat: 'iot',
    thumb: 'assets/examples/iot-semaforo.svg',
    device: 'esp32',
    steps: [
      { id: 'evt_flag' },
      {
        id: 'ctrl_forever',
        do: [
          { id: 'esp32_pin_out', fields: { PIN: '27', LEVEL: '1' } },
          { id: 'ctrl_wait', fields: { SECS: 4 } },
          { id: 'esp32_pin_out', fields: { PIN: '27', LEVEL: '0' } },
          { id: 'esp32_pin_out', fields: { PIN: '26', LEVEL: '1' } },
          { id: 'ctrl_wait', fields: { SECS: 2 } },
          { id: 'esp32_pin_out', fields: { PIN: '26', LEVEL: '0' } },
          { id: 'esp32_pin_out', fields: { PIN: '25', LEVEL: '1' } },
          { id: 'ctrl_wait', fields: { SECS: 4 } },
          { id: 'esp32_pin_out', fields: { PIN: '25', LEVEL: '0' } }
        ]
      }
    ]
  },
  {
    id: 'iot-contador-pulsos',
    name: 'Contador de pulsaciones',
    desc: 'Suma uno a la cuenta cada vez que pulsas el botón A y lo avisa en pantalla.',
    cat: 'iot',
    thumb: 'assets/examples/iot-contador-pulsos.svg',
    device: 'cyberpi',
    steps: [
      { id: 'evt_flag' },
      { id: 'var_set', fields: { VAR: 'pulsos', VALUE: 0 } },
      { id: 'disp_print', fields: { TEXT: 'Pulsa el botón A' } },
      {
        id: 'ctrl_forever',
        do: [
          { id: 'ctrl_wait', fields: { SECS: 0.2 } },
          /* `sen_btn` emite `if ...:` y es dueño de la cadena que le sigue
             (no tiene entrada DO propia): el cuerpo va detrás, no en `do`. */
          { id: 'sen_btn', fields: { BUTTON: 'a' } },
          { id: 'var_chg', fields: { VAR: 'pulsos', VALUE: 1 } },
          { id: 'disp_print', fields: { TEXT: 'Una pulsación más' } }
        ]
      }
    ]
  },
  {
    id: 'iot-estacion',
    name: 'Mini estación del clima',
    desc: 'Lee la temperatura y la humedad del aire cada diez segundos y las manda a tu panel.',
    cat: 'iot',
    thumb: 'assets/examples/iot-estacion.svg',
    device: 'esp32',
    steps: [
      { id: 'evt_flag' },
      { id: 'esp32_wifi_connect', fields: { SSID: 'mi-red', PASS: '12345678' } },
      {
        id: 'ctrl_forever',
        do: [
          { id: 'esp32_read_dht', fields: { WHAT: '0', MODEL: 'DHT22', PIN: '4', VAR: 'temp' } },
          { id: 'esp32_read_dht', fields: { WHAT: '1', MODEL: 'DHT22', PIN: '4', VAR: 'hum' } },
          { id: 'esp32_http_post', fields: { DATA: '{"temp":22,"hum":55}', URL: 'panel.local/api/clima' } },
          { id: 'ctrl_wait', fields: { SECS: 10 } }
        ]
      }
    ]
  },
  {
    id: 'iot-nube',
    name: 'Publica en la nube',
    desc: 'Se conecta al WiFi, ajusta la hora por internet y manda un aviso a tu servidor cada 30 segundos.',
    cat: 'iot',
    thumb: 'assets/examples/iot-nube.svg',
    device: 'esp32',
    steps: [
      { id: 'evt_flag' },
      { id: 'esp32_wifi_connect', fields: { SSID: 'mi-red', PASS: '12345678' } },
      { id: 'esp32_wifi_is_up', fields: { VAR: 'wifi_ok' } },
      { id: 'esp32_ntp_sync' },
      {
        id: 'ctrl_forever',
        do: [
          { id: 'esp32_http_post', fields: { DATA: '{"placa":"esp32","estado":"ok"}', URL: 'api.ejemplo.com/telemetria' } },
          { id: 'ctrl_wait', fields: { SECS: 30 } }
        ]
      }
    ]
  }
];
