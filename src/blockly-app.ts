/* Real block engine for the mBlock rebuild.
   Engine: Blockly 13.5.0 (Apache-2.0, google/blockly) loaded as the global `Blockly`.
   Blocks are generated from the catalog in script.js (BLOCKS_BY_CAT), so every
   category the UI shows becomes a real, draggable, snap-able block.
   Python emission and the stage simulator are derived from the same catalog. */
(function () {
  const B = window.Blockly;
  if (!B) return;

  let workspace: any = null;
  let labelFor: (id: string) => string = (id) => id;
  let catalogById: Record<string, any> = {};
  let entries: any[] = [];
  let onChange: (() => void) | null = null;
  let lang = 'en';
  /* Dispositivo activo para el codegen; la UI lo sincroniza con `setDevice`. */
  let device = 'esp32';

  /* Imports extra que el preámbulo ESP32 añade solo si el programa los usa.
     El catálogo puede declararlos en `entry.imports`; este mapa cubre los
     bloques base para que el motor no dependa de cada entrada. */
  const ESP32_IMPORTS: Record<string, string[]> = {
    esp32_wifi_connect: ['network'],
    esp32_wifi_is_up: ['network'],
    esp32_http_get: ['network'],
    esp32_http_post: ['network'],
    esp32_ntp_sync: ['ntptime']
  };
  const ESP32_IMPORT_ORDER = ['network', 'ntptime'];
  const ESP32_IMPORT_CODE: Record<string, string> = {
    network: 'import network',
    ntptime: 'import ntptime'
  };

  /* Sombreros que en ESP32 se vuelven funciones llamadas al arrancar. */
  const ESP32_START_HATS: Record<string, string> = {
    evt_flag: 'on_flag',
    evt_start: 'on_start'
  };

  /* Helpers de MicroPython: se emiten solo los que usan los bloques presentes.
     `ids` son los bloques que disparan el helper (los llena el catálogo). */
  const HELPERS: { ids: string[]; code: string }[] = [
    {
      ids: ['esp32_read_dht'],
      code: [
        'def _capi_dht(pin, model):',
        '    import dht',
        "    klass = dht.DHT22 if model == 'DHT22' else dht.DHT11",
        '    d = klass(machine.Pin(pin))',
        '    d.measure()',
        '    return (d.temperature(), d.humidity())'
      ].join('\n')
    },
    {
      ids: ['esp32_read_distance'],
      code: [
        'def _capi_distance(trig, echo):',
        '    t = machine.Pin(trig, machine.Pin.OUT)',
        '    e = machine.Pin(echo, machine.Pin.IN)',
        '    t.value(0); time.sleep_us(2)',
        '    t.value(1); time.sleep_us(10); t.value(0)',
        '    while e.value() == 0: pass',
        '    s = time.ticks_us()',
        '    while e.value() == 1: pass',
        '    return time.ticks_diff(time.ticks_us(), s) * 0.01715'
      ].join('\n')
    },
    {
      ids: ['esp32_neopixel_fill', 'esp32_neopixel_off'],
      code: [
        'def _capi_np_set(pin, n, r, g, b):',
        '    import neopixel',
        '    np = neopixel.NeoPixel(machine.Pin(pin), n)',
        '    for i in range(n):',
        '        np[i] = (r, g, b)',
        '    np.write()'
      ].join('\n')
    },
    {
      ids: ['esp32_buzzer_tone'],
      code: [
        'def _capi_tone(pin, freq, ms):',
        '    p = machine.PWM(machine.Pin(pin), int(freq))',
        '    p.duty(512)',
        '    time.sleep_ms(int(ms))',
        '    p.deinit()'
      ].join('\n')
    },
    {
      ids: ['esp32_wifi_connect'],
      code: [
        'def _capi_wifi(ssid, key):',
        '    import network',
        '    w = network.WLAN(network.STA_IF)',
        '    w.active(True)',
        '    if not w.isconnected():',
        '        w.connect(ssid, key)',
        '        for _ in range(50):',
        '            if w.isconnected(): break',
        '            time.sleep(0.2)',
        '    return w.isconnected()'
      ].join('\n')
    },
    {
      ids: ['esp32_http_get'],
      code: [
        'def _capi_http_get(url):',
        '    import usocket',
        "    url = url.split('://')[-1]",
        "    parts = url.split('/')",
        '    host = parts[0]',
        "    path = '/' + '/'.join(parts[1:]) if len(parts) > 1 else '/'",
        '    port = 80',
        "    if ':' in host:",
        '        host, p = host.split(\':\')',
        '        port = int(p)',
        '    a = usocket.getaddrinfo(host, port)[0][-1]',
        '    s = usocket.socket()',
        '    s.connect(a)',
        "    s.send(bytes('GET %s HTTP/1.0\\r\\nHost: %s\\r\\nConnection: close\\r\\n\\r\\n' % (path, host), 'utf-8'))",
        '    r = s.read()',
        '    s.close()',
        "    return r.decode() if r else ''"
      ].join('\n')
    },
    {
      ids: ['esp32_http_post'],
      code: [
        'def _capi_http_post(url, data):',
        '    import usocket',
        "    url = url.split('://')[-1]",
        "    parts = url.split('/')",
        '    host = parts[0]',
        "    path = '/' + '/'.join(parts[1:]) if len(parts) > 1 else '/'",
        '    port = 80',
        "    if ':' in host:",
        '        host, p = host.split(\':\')',
        '        port = int(p)',
        '    a = usocket.getaddrinfo(host, port)[0][-1]',
        '    s = usocket.socket()',
        '    s.connect(a)',
        "    body = bytes(data, 'utf-8')",
        "    s.send(bytes('POST %s HTTP/1.0\\r\\nHost: %s\\r\\nContent-Type: application/json\\r\\nContent-Length: %d\\r\\nConnection: close\\r\\n\\r\\n' % (path, host, len(body)), 'utf-8') + body)",
        '    r = s.read()',
        '    s.close()',
        "    return r.decode() if r else ''"
      ].join('\n')
    }
  ];

  /* Pines del ESP32 para los desplegables: [etiqueta, valor] con etiqueta = número. */
  const PINS_DIGITAL = ['2', '4', '5', '12', '13', '14', '15', '16', '17', '18', '19', '21', '22', '23', '25', '26', '27', '32', '33'];
  /* Solo entradas ADC (GPIO 34-39 no tienen pull-up ni salida). */
  const PINS_ADC = ['32', '33', '34', '35', '36', '39'];
  const pinOptions = (list: string[]) => list.map((p) => [p, p]);

  /* Blockly 13 sacó `field_colour` del núcleo (ahora es un plugin), así que un
     `field_colour` en args0 se descartaba en silencio y el bloque perdía su
     campo de color. Se registra un campo propio: texto hexadecimal editable con
     el fondo pintado del color actual. */
  class ColourField extends B.FieldTextInput {
    constructor(value?: string) {
      super(value || '#ff5252');
    }

    static fromJson(options: any): ColourField {
      return new ColourField(options && options.colour);
    }

    initView(): void {
      super.initView();
      this.updateSwatch();
    }

    /* eslint-disable-next-line camelcase */
    doValueUpdate_(newValue: string): void {
      super.doValueUpdate_(newValue);
      this.updateSwatch();
    }

    /* eslint-disable-next-line camelcase */
    doClassValidation_(newValue: any): string | null {
      const v = String(newValue == null ? '' : newValue).trim();
      return /^#?[0-9a-f]{6}$/i.test(v) ? v : null;
    }

    /** Pinta el fondo del texto con el color actual (el hex sigue siendo editable). */
    updateSwatch(): void {
      /* getTextElement() lanza si el bloque aún no tiene vista (construcción). */
      let el: any = null;
      try { el = this.getTextElement(); } catch (_) { return; }
      if (!el) return;
      const [r, g, b] = rgbFromHex(this.getValue());
      el.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
      el.style.fill = '#ffffff';
    }
  }

  if (B.registry && B.registry.Type && !B.registry.hasItem(B.registry.Type.FIELD, 'field_colour')) {
    B.registry.register(B.registry.Type.FIELD, 'field_colour', ColourField);
  }

  /* Blocks whose label placeholders become editable fields. */
  const FIELD_SPECS: Record<string, any[]> = {
    esp32_pin_out: [{ name: 'PIN', type: 'dropdown', options: pinOptions(PINS_DIGITAL) }, { name: 'LEVEL', type: 'dropdown', options: [['ALTO', '1'], ['BAJO', '0']] }],
    esp32_pin_read: [{ name: 'PIN', type: 'dropdown', options: pinOptions(PINS_DIGITAL) }, { name: 'VAR', type: 'text', def: 'estado' }],
    esp32_pin_analog: [{ name: 'PIN', type: 'dropdown', options: pinOptions(PINS_ADC) }, { name: 'VAR', type: 'text', def: 'valor' }],
    esp32_pwm_set: [{ name: 'PIN', type: 'dropdown', options: pinOptions(PINS_DIGITAL) }, { name: 'DUTY', type: 'number', def: 50 }],
    esp32_pwm_stop: [{ name: 'PIN', type: 'dropdown', options: pinOptions(PINS_DIGITAL) }],
    esp32_servo_angle: [{ name: 'PIN', type: 'dropdown', options: pinOptions(PINS_DIGITAL) }, { name: 'ANGLE', type: 'number', def: 90 }],
    esp32_read_dht: [{ name: 'WHAT', type: 'dropdown', options: [['temperatura', '0'], ['humedad', '1']] }, { name: 'MODEL', type: 'dropdown', options: [['DHT11', 'DHT11'], ['DHT22', 'DHT22']] }, { name: 'PIN', type: 'dropdown', options: pinOptions(PINS_DIGITAL) }, { name: 'VAR', type: 'text', def: 'temp' }],
    esp32_read_distance: [{ name: 'TRIG', type: 'dropdown', options: pinOptions(PINS_DIGITAL), def: '5' }, { name: 'ECHO', type: 'dropdown', options: pinOptions(PINS_DIGITAL), def: '18' }, { name: 'VAR', type: 'text', def: 'dist' }],
    esp32_read_pir: [{ name: 'PIN', type: 'dropdown', options: pinOptions(PINS_DIGITAL), def: '27' }, { name: 'VAR', type: 'text', def: 'mov' }],
    esp32_read_ldr: [{ name: 'PIN', type: 'dropdown', options: pinOptions(PINS_ADC), def: '32' }, { name: 'VAR', type: 'text', def: 'luz' }],
    esp32_read_button: [{ name: 'PIN', type: 'dropdown', options: pinOptions(PINS_DIGITAL), def: '4' }, { name: 'VAR', type: 'text', def: 'boton' }],
    esp32_neopixel_fill: [{ name: 'PIN', type: 'dropdown', options: pinOptions(PINS_DIGITAL), def: '16' }, { name: 'N', type: 'number', def: 8 }, { name: 'COLOR', type: 'colour', def: '#ff5252' }],
    esp32_neopixel_off: [{ name: 'N', type: 'number', def: 8 }, { name: 'PIN', type: 'dropdown', options: pinOptions(PINS_DIGITAL), def: '16' }],
    esp32_buzzer_tone: [{ name: 'FREQ', type: 'number', def: 700 }, { name: 'PIN', type: 'dropdown', options: pinOptions(PINS_DIGITAL), def: '17' }, { name: 'MS', type: 'number', def: 300 }],
    esp32_relay: [{ name: 'PIN', type: 'dropdown', options: pinOptions(PINS_DIGITAL), def: '26' }, { name: 'STATE', type: 'dropdown', options: [['ON', '1'], ['OFF', '0']] }],
    esp32_wifi_connect: [{ name: 'SSID', type: 'text', def: 'mi-red' }, { name: 'PASS', type: 'text', def: '12345678' }],
    esp32_wifi_is_up: [{ name: 'VAR', type: 'text', def: 'wifi_ok' }],
    esp32_http_get: [{ name: 'URL', type: 'text', def: 'ejemplo.com/datos' }, { name: 'VAR', type: 'text', def: 'resp' }],
    esp32_http_post: [{ name: 'DATA', type: 'text', def: '{"temp":22}' }, { name: 'URL', type: 'text', def: 'ejemplo.com/api' }],
    esp32_deep_sleep: [{ name: 'SECS', type: 'number', def: 60 }],
    led_all: [{ name: 'COLOR', type: 'colour', def: '#ff5252' }],
    led_single: [{ name: 'COLOR', type: 'colour', def: '#1eaaff' }],
    disp_print: [{ name: 'TEXT', type: 'text', def: '¡Hola!' }],
    ctrl_wait: [{ name: 'SECS', type: 'number', def: 1 }],
    ctrl_repeat: [{ name: 'TIMES', type: 'number', def: 4 }],
    play_note: [{ name: 'NOTE', type: 'number', def: 60 }],
    iot_wifi: [{ name: 'SSID', type: 'text', def: 'mi-red' }, { name: 'PASS', type: 'text', def: '12345678' }],
    iot_send: [{ name: 'VALUE', type: 'text', def: 'ok' }],
    var_set: [{ name: 'VAR', type: 'text', def: 'score' }, { name: 'VALUE', type: 'number', def: 0 }],
    var_chg: [{ name: 'VAR', type: 'text', def: 'score' }, { name: 'VALUE', type: 'number', def: 1 }],
    sen_btn: [{ name: 'BUTTON', type: 'text', def: 'a' }]
  };

  const STATEMENT_INPUT: Record<string, boolean> = {
    ctrl_repeat: true,
    ctrl_forever: true,
    ctrl_if: true,
    my_def: true
  };

  function typeOf(id: string) { return 'mb_' + id; }
  function idOf(type: string) { return type.indexOf('mb_') === 0 ? type.slice(3) : type; }

  function fieldArgs(spec) {
    if (!spec) return null;
    return spec.map((f) => {
      if (f.type === 'colour') return { type: 'field_colour', name: f.name, colour: f.def };
      if (f.type === 'number') return { type: 'field_number', name: f.name, value: f.def, min: 0 };
      /* Las opciones de dropdown son etiquetas técnicas ([etiqueta, valor]). */
      if (f.type === 'dropdown') return { type: 'field_dropdown', name: f.name, options: f.options };
      return { type: 'field_input', name: f.name, text: f.def };
    });
  }

  /* Los campos se colocan en el orden en que aparecen los [PLACEHOLDER] de la
     etiqueta traducida: `args0` sigue los %n, y el orden de los huecos cambia
     entre idiomas (zh coloca [PIN] antes que [WHAT]). Si el texto del hueco no
     coincide con el nombre de un campo, se toma el siguiente por posición. */
  function messageFor(entry) {
    const label = String(labelFor(entry.id) || entry.id);
    const specs = FIELD_SPECS[entry.id] || [];
    const ordered: any[] = [];
    let index = 0;
    const message = label.replace(/\[([^\]]*)\]/g, (_match, name) => {
      let spec = specs.filter((s) => s.name === name)[0];
      if (!spec) spec = specs[index];
      index += 1;
      if (!spec) return '';
      ordered.push(spec);
      return '%' + ordered.length;
    });
    return { message: message.trim(), specs: ordered };
  }

  function defineBlocks() {
    entries.forEach((entry) => {
      const type = typeOf(entry.id);
      const colour = entry.color || '#4c97ff';
      B.Blocks[type] = {
        init: function () {
          const { message, specs } = messageFor(entry);
          const json: any = {
            message0: message,
            colour: colour,
            tooltip: message,
            helpUrl: ''
          };
          const args = fieldArgs(specs.length ? specs : null);
          if (args && args.length) json.args0 = args;
          if (STATEMENT_INPUT[entry.id]) {
            json.message1 = '%1';
            json.args1 = [{ type: 'input_statement', name: 'DO' }];
          }
          if (entry.hat) {
            json.nextStatement = 'MB_STMT';
            json.hat = 'cap';
          } else {
            json.previousStatement = 'MB_STMT';
            json.nextStatement = 'MB_STMT';
          }
          this.jsonInit(json);
          /* Un desplegable con `def` arranca en ese pin/valor: el JSON de Blockly
             siempre elige la primera opción de la lista. */
          specs.forEach((f) => {
            if (f.type !== 'dropdown' || f.def === undefined) return;
            try { this.getField(f.name).setValue(String(f.def)); } catch (_) {}
          });
        }
      };
    });
  }

  function theme() {
    const base = (B.Themes && B.Themes.Classic) || undefined;
    const t = B.Theme && B.Theme.defineTheme ? B.Theme.defineTheme('mblock', {
      base: base,
      componentStyles: {
        workspaceBackgroundColour: '#ffffff',
        toolboxBackgroundColour: '#e8f6ff',
        toolboxForegroundColour: '#253858',
        flyoutBackgroundColour: '#e8f6ff',
        flyoutForegroundColour: '#253858',
        flyoutOpacity: 1,
        scrollbarColour: '#c6d2e1',
        insertionMarkerColour: '#1eaaff',
        insertionMarkerOpacity: 0.4,
        cursorColour: '#1eaaff'
      },
      fontStyle: { family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif', size: 11 }
    }) : undefined;
    return t;
  }

  function statementChildren(block: any): any[] {
    const out: any[] = [];
    for (const input of block.inputList || []) {
      const conn = input.connection;
      if (!conn || !conn.targetBlock) continue;
      const child = conn.targetBlock();
      if (!child) continue;
      // statement inputs only: our statement input is named DO
      if (input.name === 'DO') out.push(child);
    }
    return out;
  }

  function hasStatementChild(block) { return statementChildren(block).length > 0; }

  function fieldValue(block, name, fallback) {
    try {
      const f = block.getField(name);
      if (f) return f.getValue();
    } catch (_) {}
    return fallback;
  }

  function rgbFromHex(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || ''));
    if (!m) return [255, 80, 80];
    const v = parseInt(m[1], 16);
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  }

  function esc(s) { return String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"'); }

  function pyFor(block) {
    const id = idOf(block.type);
    const entry = catalogById[id];
    if (!entry) return 'pass';
    let py = (device === 'esp32' && entry.esp32) ? entry.esp32 : (entry.py || 'pass');
    switch (id) {
      /* --- Pines (ESP32): GPIO, PWM y servo --- */
      case 'esp32_pin_out':
        return `Pin(${fieldValue(block, 'PIN', '2')}, Pin.OUT).value(${fieldValue(block, 'LEVEL', '1')})`;
      case 'esp32_pin_read':
        return `${fieldValue(block, 'VAR', 'estado')} = Pin(${fieldValue(block, 'PIN', '2')}, Pin.IN).value()`;
      case 'esp32_pin_analog':
        return `${fieldValue(block, 'VAR', 'valor')} = ADC(Pin(${fieldValue(block, 'PIN', '32')})).read()`;
      case 'esp32_pwm_set': {
        const duty = Math.max(0, Math.min(100, Number(fieldValue(block, 'DUTY', 50)) || 0));
        return `PWM(Pin(${fieldValue(block, 'PIN', '2')}), 1000).duty(int(${duty} * 10.23))`;
      }
      case 'esp32_pwm_stop':
        return `PWM(Pin(${fieldValue(block, 'PIN', '2')}), 1000).deinit()`;
      case 'esp32_servo_angle': {
        const angle = Number(fieldValue(block, 'ANGLE', 90)) || 0;
        return `PWM(Pin(${fieldValue(block, 'PIN', '2')}), 50).duty(int(25.6 + ${angle} * 0.568))`;
      }
      /* --- Sensores (ESP32) --- */
      case 'esp32_read_dht':
        return `${fieldValue(block, 'VAR', 'temp')} = _capi_dht(${fieldValue(block, 'PIN', '2')}, '${fieldValue(block, 'MODEL', 'DHT11')}')[${fieldValue(block, 'WHAT', '0')}]`;
      case 'esp32_read_distance':
        return `${fieldValue(block, 'VAR', 'dist')} = _capi_distance(${fieldValue(block, 'TRIG', '5')}, ${fieldValue(block, 'ECHO', '18')})`;
      case 'esp32_read_pir':
        return `${fieldValue(block, 'VAR', 'mov')} = Pin(${fieldValue(block, 'PIN', '27')}, Pin.IN).value()`;
      case 'esp32_read_ldr':
        return `${fieldValue(block, 'VAR', 'luz')} = ADC(Pin(${fieldValue(block, 'PIN', '32')})).read()`;
      case 'esp32_read_button':
        return `${fieldValue(block, 'VAR', 'boton')} = 1 if Pin(${fieldValue(block, 'PIN', '4')}, Pin.IN, Pin.PULL_UP).value() == 0 else 0`;
      /* --- Actuadores (ESP32): tira neopixel, buzzer y relé --- */
      case 'esp32_neopixel_fill': {
        const [r, g, b] = rgbFromHex(fieldValue(block, 'COLOR', '#ff5252'));
        return `_capi_np_set(${fieldValue(block, 'PIN', '16')}, ${Number(fieldValue(block, 'N', 8)) || 0}, ${r}, ${g}, ${b})`;
      }
      case 'esp32_neopixel_off':
        return `_capi_np_set(${fieldValue(block, 'PIN', '16')}, ${Number(fieldValue(block, 'N', 8)) || 0}, 0, 0, 0)`;
      case 'esp32_buzzer_tone':
        return `_capi_tone(${fieldValue(block, 'PIN', '17')}, ${Number(fieldValue(block, 'FREQ', 700)) || 0}, ${Number(fieldValue(block, 'MS', 300)) || 0})`;
      case 'esp32_relay':
        return `Pin(${fieldValue(block, 'PIN', '26')}, Pin.OUT).value(${fieldValue(block, 'STATE', '1')})`;
      /* --- Conectividad y energía (ESP32) --- */
      case 'esp32_wifi_connect':
        return `_capi_wifi("${esc(fieldValue(block, 'SSID', 'mi-red'))}", "${esc(fieldValue(block, 'PASS', '12345678'))}")`;
      case 'esp32_wifi_is_up':
        return `${fieldValue(block, 'VAR', 'wifi_ok')} = network.WLAN(network.STA_IF).isconnected()`;
      case 'esp32_http_get':
        return `${fieldValue(block, 'VAR', 'resp')} = _capi_http_get("${esc(fieldValue(block, 'URL', 'ejemplo.com/datos'))}")`;
      case 'esp32_http_post':
        return `_capi_http_post("${esc(fieldValue(block, 'URL', 'ejemplo.com/api'))}", "${esc(fieldValue(block, 'DATA', '{"temp":22}'))}")`;
      case 'esp32_ntp_sync':
        return 'ntptime.settime()';
      case 'esp32_deep_sleep':
        return `machine.deepsleep(int(${Number(fieldValue(block, 'SECS', 60)) || 0} * 1000))`;
      case 'led_all': {
        const [r, g, b] = rgbFromHex(fieldValue(block, 'COLOR', '#ff5252'));
        return `cyberpi.led.on(${r}, ${g}, ${b})`;
      }
      case 'led_single': {
        const [r, g, b] = rgbFromHex(fieldValue(block, 'COLOR', '#1eaaff'));
        return `cyberpi.led.on(${r}, ${g}, ${b}, id=1)`;
      }
      case 'disp_print':
        return `cyberpi.console.println("${esc(fieldValue(block, 'TEXT', '¡Hola!'))}")`;
      case 'ctrl_wait':
        return `time.sleep(${fieldValue(block, 'SECS', 1)})`;
      case 'ctrl_repeat':
        return `for i in range(${fieldValue(block, 'TIMES', 4)}):`;
      case 'play_note':
        return `cyberpi.audio.play_music(${fieldValue(block, 'NOTE', 60)}, 0.25)`;
      case 'iot_wifi':
        return `cyberpi.wifi.connect("${esc(fieldValue(block, 'SSID', 'mi-red'))}", "${esc(fieldValue(block, 'PASS', ''))}")`;
      case 'iot_send':
        return `cyberpi.cloud.broadcast("status", "${esc(fieldValue(block, 'VALUE', 'ok'))}")`;
      case 'var_set':
        return `${fieldValue(block, 'VAR', 'score')} = ${fieldValue(block, 'VALUE', 0)}`;
      case 'var_chg':
        return `${fieldValue(block, 'VAR', 'score')} += ${fieldValue(block, 'VALUE', 1)}`;
      default:
        return py;
    }
  }

  function emitChain(block, indent, lines) {
    let b = block;
    let guard = 0;
    while (b && guard < 400) {
      guard += 1;
      const id = idOf(b.type);
      const entry = catalogById[id];
      const kids = statementChildren(b);
      const code = pyFor(b);
      const codeLines = code.split('\n');
      const lastLine = codeLines[codeLines.length - 1] || '';
      const isHeader = kids.length > 0 || (entry && entry.hat) || /:$/.test(lastLine);
      codeLines.forEach((ln) => lines.push(indent + ln));
      if (kids.length) {
        kids.forEach((k) => emitChain(k, indent + '    ', lines));
      } else if (isHeader) {
        // A hat (or any ":" block) owns the stack that follows it.
        const next = b.getNextBlock();
        if (next) emitChain(next, indent + '    ', lines);
        else lines.push(indent + '    pass');
        return;
      }
      b = b.getNextBlock();
    }
  }

  /* ids de todos los bloques del programa: sombreros, cadenas y cuerpos DO. */
  function collectUsedIds() {
    const used = new Set<string>();
    const walk = (block) => {
      let b = block;
      let guard = 0;
      while (b && guard < 400) {
        guard += 1;
        used.add(idOf(b.type));
        statementChildren(b).forEach(walk);
        b = b.getNextBlock();
      }
    };
    if (workspace) workspace.getTopBlocks(true).forEach(walk);
    return used;
  }

  /* Programa MicroPython para ESP32: preámbulo con imports/helpers usados,
     cuerpo y llamada a los sombreros de evento al final. */
  function pythonEsp32() {
    const lines = [
      '# capiBlocks → MicroPython (ESP32)',
      'import machine, time',
      'from machine import Pin, PWM, ADC'
    ];
    const used = collectUsedIds();

    const extraImports = new Set<string>();
    used.forEach((id) => {
      const entry = catalogById[id];
      const declared = (entry && Array.isArray(entry.imports)) ? entry.imports : [];
      declared.forEach((name) => extraImports.add(name));
      (ESP32_IMPORTS[id] || []).forEach((name) => extraImports.add(name));
    });
    ESP32_IMPORT_ORDER.forEach((name) => {
      const code = ESP32_IMPORT_CODE[name];
      if (code && extraImports.has(name)) lines.push(code);
    });
    lines.push('');

    /* Solo los helpers que el programa usa, en orden de declaración. */
    HELPERS.forEach((helper) => {
      if (!helper.ids.some((id) => used.has(id))) return;
      lines.push(helper.code);
      lines.push('');
    });

    const tops = workspace ? workspace.getTopBlocks(true) : [];
    tops.forEach((b) => emitChain(b, '', lines));
    if (tops.length) lines.push('');

    /* Arranque: una llamada por sombrero de evento, sin repetir. */
    const calls: string[] = [];
    tops.forEach((b) => {
      const fn = ESP32_START_HATS[idOf(b.type)];
      if (fn && calls.indexOf(fn) === -1) calls.push(fn);
    });
    lines.push('# --- capiBlocks: arranque ---');
    if (calls.length) calls.forEach((fn) => lines.push(fn + '()'));
    else lines.push('pass');
    return lines.join('\n');
  }

  function actionFor(block) {
    const id = idOf(block.type);
    const entry = catalogById[id];
    if (!entry) return null;
    switch (id) {
      case 'led_all':
      case 'led_single':
        return { type: 'led', color: fieldValue(block, 'COLOR', '#ff5252') };
      case 'led_off':
        return { type: 'led', color: 'off' };
      case 'disp_print':
        return { type: 'screen', text: fieldValue(block, 'TEXT', '¡Hola!') };
      case 'disp_clear':
        return { type: 'screen', text: '' };
      case 'ctrl_wait':
        return { type: 'wait', ms: Math.max(50, Number(fieldValue(block, 'SECS', 1)) * 450) };
      case 'esp32_neopixel_fill':
        return { type: 'led', color: fieldValue(block, 'COLOR', '#ff5252') };
      case 'esp32_neopixel_off':
        return { type: 'led', color: 'off' };
      case 'esp32_buzzer_tone':
        return { type: 'beep', freq: Number(fieldValue(block, 'FREQ', 700)) || 700 };
      case 'play_note': {
        const n = Number(fieldValue(block, 'NOTE', 60));
        return { type: 'beep', freq: Math.round(440 * Math.pow(2, (n - 69) / 12)) };
      }
      default:
        return entry.action ? JSON.parse(JSON.stringify(entry.action)) : null;
    }
  }

  function collectActions(block, out, budget) {
    let b = block;
    while (b && budget.n < 250) {
      budget.n += 1;
      const id = idOf(b.type);
      const act = actionFor(b);
      if (act) out.push(act);
      const kids = statementChildren(b);
      if (kids.length) {
        if (id === 'ctrl_repeat') {
          const n = Math.max(1, Math.min(12, Number(fieldValue(b, 'TIMES', 4)) || 1));
          for (let i = 0; i < n && budget.n < 250; i += 1) kids.forEach((k) => collectActions(k, out, budget));
        } else {
          kids.forEach((k) => collectActions(k, out, budget));
        }
      }
      b = b.getNextBlock();
    }
  }

  function inject(div) {
    const options = {
      toolbox: null,
      renderer: 'zelos',
      media: 'blockly-media/',
      theme: theme(),
      grid: { spacing: 0, length: 0, colour: 'transparent', snap: false },
      zoom: { controls: false, wheel: true, startScale: 0.9, maxScale: 2.2, minScale: 0.35, scaleSpeed: 1.15 },
      move: { scrollbars: true, drag: true, wheel: true },
      trashcan: false,
      sounds: false,
      rtl: false,
      readOnly: false
    };
    workspace = B.inject(div, options);
    workspace.addChangeListener((event) => {
      if (event.isUiEvent) return;
      if (onChange) onChange();
    });
    if (B.svgResize) B.svgResize(workspace);
  }

  function refreshCount() {
    const el = document.getElementById('blockCountNum');
    if (el && workspace) el.textContent = String(workspace.getAllBlocks(false).length);
  }

  window.MBBlocks = {
/** ¿El workspace está montado y listo? */
    active() { return !!workspace; },

/** Fija el dispositivo activo (codegen y paleta). */
    setDevice(id) { device = id || 'esp32'; },

/** Registra los bloques del catálogo y monta Blockly en #blocklyDiv. */
    init(opts) {
      if (workspace) return;
      labelFor = opts.labelFor || labelFor;
      lang = opts.lang || lang;
      device = opts.device || device;
      catalogById = {};
      entries = [];
      Object.keys(opts.blocksByCat || {}).forEach((cat) => {
        (opts.blocksByCat[cat] || []).forEach((b) => {
          catalogById[b.id] = b;
          entries.push(b);
        });
      });
      onChange = opts.onChange || null;
      const div = document.getElementById('blocklyDiv');
      if (!div || div.offsetWidth === 0) return; // hidden: retry later
      defineBlocks();
      inject(div);
      div.closest('.blocks-canvas')?.classList.add('blockly-active');
      refreshCount();
    },

    /* Rebuild blocks with new labels, keeping the program. */
/** Reconstruye los bloques con otro idioma conservando el programa. */
    relabel(nextLabelFor) {
      if (!workspace) return;
      const state = B.serialization.workspaces.save(workspace);
      labelFor = nextLabelFor || labelFor;
      workspace.clear();
      workspace.dispose();
      workspace = null;
      entries.forEach((e) => { delete B.Blocks[typeOf(e.id)]; });
      const div = document.getElementById('blocklyDiv');
      defineBlocks();
      inject(div);
      B.serialization.workspaces.load(state, workspace);
      refreshCount();
    },

/** Añade un bloque debajo del contenido actual (clic en la paleta). */
    add(id) {
      if (!workspace || !catalogById[id]) return;
      const block = workspace.newBlock(typeOf(id));
      block.initSvg();
      block.render();
      const box = workspace.getBlocksBoundingBox ? workspace.getBlocksBoundingBox() : null;
      const m = workspace.getMetrics ? workspace.getMetrics() : null;
      const x = m ? m.viewLeft + 48 : 60;
      const y = box ? box.bottom + 40 : (m ? m.viewTop + 40 : 40);
      block.moveBy(x, y);
      block.select();
      refreshCount();
    },

    /* Suelta un bloque en un punto de la pantalla (arrastrar desde la paleta). */
/** Añade un bloque en el punto de la pantalla donde se suelta (arrastre). */
    addAt(id, clientX, clientY) {
      if (!workspace || !catalogById[id]) return false;
      const block = workspace.newBlock(typeOf(id));
      block.initSvg();
      block.render();
      const svg = workspace.getParentSvg ? workspace.getParentSvg() : null;
      const m = workspace.getMetrics ? workspace.getMetrics() : null;
      let x = 48;
      let y = 40;
      if (svg && m) {
        const r = svg.getBoundingClientRect();
        const scale = workspace.scale || 1;
        x = m.viewLeft + (clientX - r.left) / scale;
        y = m.viewTop + (clientY - r.top) / scale;
      }
      block.moveBy(x - 20, y - 14);
      block.select();
      refreshCount();
      return true;
    },

    /* Carga un programa de ejemplo en el lienzo: pasos en orden y `do` para anidar. */
/** Carga un programa de ejemplo: pasos en orden y `do` para anidar. */
    loadProgram(steps) {
      if (!workspace || !Array.isArray(steps)) return 0;
      workspace.clear();
      const m = workspace.getMetrics ? workspace.getMetrics() : null;
      const startX = (m ? m.viewLeft : 0) + 48;
      const startY = (m ? m.viewTop : 0) + 40;

      const build = (list: any[], isRoot: boolean): any => {
        let first: any = null;
        let prev: any = null;
        list.forEach((step) => {
          if (!catalogById[step.id]) return;
          const b = workspace.newBlock(typeOf(step.id));
          if (step.fields) {
            Object.keys(step.fields).forEach((name) => {
              try {
                const f = b.getField(name);
                if (f) f.setValue(step.fields[name]);
              } catch (_) {}
            });
          }
          b.initSvg();
          b.render();
          if (step.do && step.do.length) {
            const child = build(step.do, false);
            const input = b.getInput('DO');
            if (child && input && input.connection && child.previousConnection) {
              input.connection.connect(child.previousConnection);
            }
          }
          if (!first) {
            first = b;
            if (isRoot) b.moveBy(startX, startY);
          }
          if (prev && prev.nextConnection && b.previousConnection) {
            prev.nextConnection.connect(b.previousConnection);
          }
          prev = b;
        });
        return first;
      };

      build(steps, true);
      refreshCount();
      return workspace.getAllBlocks(false).length;
    },

/** Número de bloques en el workspace. */
    count() { return workspace ? workspace.getAllBlocks(false).length : 0; },
    refreshCount,

/** Código Python generado desde la pila actual. */
    python() {
      if (device === 'esp32') return pythonEsp32();
      const header = lang === 'es'
        ? '# Código Python generado desde los bloques'
        : lang === 'zh'
          ? '# 由积木自动生成的 Python 代码'
          : '# Python code generated from workspace blocks';
      const lines = [header, 'import cyberpi, event, time', ''];
      if (!workspace) return lines.join('\n');
      const tops = workspace.getTopBlocks(true);
      if (!tops.length) {
        lines.push('@event.start');
        lines.push('def on_start():');
        lines.push('    pass');
        return lines.join('\n');
      }
      tops.forEach((b) => emitChain(b, '', lines));
      return lines.join('\n');
    },

/** Acciones para el simulador del escenario (LED, pantalla, sonido, movimiento). */
    actions() {
      const out = [];
      if (!workspace) return out;
      const budget = { n: 0 };
      workspace.getTopBlocks(true).forEach((b) => collectActions(b, out, budget));
      return out;
    },

/** Estado serializable del workspace para guardar el proyecto. */
    serialize() { return workspace ? B.serialization.workspaces.save(workspace) : null; },

/** Reemplaza el workspace con un estado serializado. */
    load(state) {
      if (!workspace || !state) return;
      workspace.clear();
      try { B.serialization.workspaces.load(state, workspace); } catch (_) {}
      refreshCount();
    },

/** Vacía el workspace. */
    clear() { if (workspace) { workspace.clear(); refreshCount(); } },
/** Deshace el último cambio. */
    undo() { if (workspace) workspace.undo(false); },
/** Rehace el último cambio deshecho. */
    redo() { if (workspace) workspace.undo(true); },
/** Acerca la vista. */
    zoomIn() { if (workspace) workspace.zoomCenter(1); },
/** Aleja la vista. */
    zoomOut() { if (workspace) workspace.zoomCenter(-1); },
/** Restablece escala y posición. */
    zoomReset() { if (workspace) { workspace.setScale(0.9); workspace.scrollCenter(); } },
/** Reordena los bloques sueltos. */
    cleanUp() { if (workspace) workspace.cleanUp(); },
/** Recalcula el tamaño tras mostrar el contenedor. */
    resize() { if (workspace && B.svgResize) B.svgResize(workspace); }
  };
})();
