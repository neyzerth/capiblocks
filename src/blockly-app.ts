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

  /* Blocks whose label placeholders become editable fields. */
  const FIELD_SPECS: Record<string, any[]> = {
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
      return { type: 'field_input', name: f.name, text: f.def };
    });
  }

  function messageFor(entry) {
    let label = String(labelFor(entry.id) || entry.id);
    const specs = FIELD_SPECS[entry.id] || [];
    let n = 0;
    label = label.replace(/\[[^\]]*\]/g, (m) => {
      n += 1;
      return specs[n - 1] ? '%' + n : '';
    });
    return { message: label.trim(), specs: specs.slice(0, n) };
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
    let py = entry.py || 'pass';
    switch (id) {
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
    active() { return !!workspace; },

    init(opts) {
      if (workspace) return;
      labelFor = opts.labelFor || labelFor;
      lang = opts.lang || lang;
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

    count() { return workspace ? workspace.getAllBlocks(false).length : 0; },
    refreshCount,

    python() {
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

    actions() {
      const out = [];
      if (!workspace) return out;
      const budget = { n: 0 };
      workspace.getTopBlocks(true).forEach((b) => collectActions(b, out, budget));
      return out;
    },

    serialize() { return workspace ? B.serialization.workspaces.save(workspace) : null; },

    load(state) {
      if (!workspace || !state) return;
      workspace.clear();
      try { B.serialization.workspaces.load(state, workspace); } catch (_) {}
      refreshCount();
    },

    clear() { if (workspace) { workspace.clear(); refreshCount(); } },
    undo() { if (workspace) workspace.undo(false); },
    redo() { if (workspace) workspace.undo(true); },
    zoomIn() { if (workspace) workspace.zoomCenter(1); },
    zoomOut() { if (workspace) workspace.zoomCenter(-1); },
    zoomReset() { if (workspace) { workspace.setScale(0.9); workspace.scrollCenter(); } },
    cleanUp() { if (workspace) workspace.cleanUp(); },
    resize() { if (workspace && B.svgResize) B.svgResize(workspace); }
  };
})();
