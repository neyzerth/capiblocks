(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const t = (key, def) => (window.t ? window.t(key, def) : (def || key));

  /* ===========================
     Data: Categories, Blocks, Devices, Extensions
     =========================== */
  const DEVICE_CATEGORIES = [
    { id: 'audio', labelKey: 'catAudio', color: '#ab47bc', icon: 'chip' },
    { id: 'led', labelKey: 'catLed', color: '#9300d8', icon: 'chip' },
    { id: 'display', labelKey: 'catDisplay', color: '#6739b6', icon: 'chip' },
    { id: 'motion_sensing', labelKey: 'catMotionSensing', color: '#ff6f00', icon: 'chip' },
    { id: 'sensing', labelKey: 'catSensing', color: '#ff6f00', icon: 'chip' },
    { id: 'lan', labelKey: 'catLan', color: '#00d7b0', icon: 'chip' },
    { id: 'ai', labelKey: 'catAi', color: '#a6d200', icon: 'chip' },
    { id: 'iot', labelKey: 'catIot', color: '#a6d200', icon: 'chip' },
    { id: 'events', labelKey: 'catEvents', color: '#ffbf00', icon: 'bubble' },
    { id: 'control', labelKey: 'catControl', color: '#ffab19', icon: 'bubble' },
    { id: 'operators', labelKey: 'catOperators', color: '#59c059', icon: 'bubble' },
    { id: 'variables', labelKey: 'catVariables', color: '#ff8c1a', icon: 'bubble' },
    { id: 'my_blocks', labelKey: 'catMyBlocks', color: '#ff6680', icon: 'bubble' }
  ];

  const SPRITE_CATEGORIES = [
    { id: 'motion', labelKey: 'catMotion', color: '#4c97ff', icon: 'bubble' },
    { id: 'looks', labelKey: 'catLooks', color: '#9966ff', icon: 'bubble' },
    { id: 'sound', labelKey: 'catSound', color: '#cf63cf', icon: 'bubble' },
    { id: 'events', labelKey: 'catEvents', color: '#ffbf00', icon: 'bubble' },
    { id: 'control', labelKey: 'catControl', color: '#ffab19', icon: 'bubble' },
    { id: 'sensing', labelKey: 'catSensing', color: '#5cb1d6', icon: 'bubble' },
    { id: 'operators', labelKey: 'catOperators', color: '#59c059', icon: 'bubble' },
    { id: 'variables', labelKey: 'catVariables', color: '#ff8c1a', icon: 'bubble' },
    { id: 'my_blocks', labelKey: 'catMyBlocks', color: '#ff6680', icon: 'bubble' }
  ];

  const BLOCKS_BY_CAT = {
    audio: [
      { id: 'play_until_done', key: 'blkPlayUntilDone', color: '#ab47bc', py: 'cyberpi.audio.play_until("hi")', action: { type: 'beep', freq: 523 } },
      { id: 'play_sound', key: 'blkPlaySound', color: '#ab47bc', py: 'cyberpi.audio.play("hi")', action: { type: 'beep', freq: 587 } },
      { id: 'play_note', key: 'blkPlayNote', color: '#ab47bc', py: 'cyberpi.audio.play_music(60, 0.25)', action: { type: 'beep', freq: 659 } },
      { id: 'play_hz', key: 'blkPlayHz', color: '#ab47bc', py: 'cyberpi.audio.play_tone(700, 1)', action: { type: 'beep', freq: 700 } },
      { id: 'set_volume', key: 'blkSetVolume', color: '#ab47bc', py: 'cyberpi.audio.set_vol(80)' },
      { id: 'stop_sounds', key: 'blkStopSounds', color: '#ab47bc', py: 'cyberpi.audio.stop()' }
    ],
    led: [
      { id: 'led_all', key: 'blkLedAll', color: '#9300d8', py: 'cyberpi.led.on(255, 50, 50)', action: { type: 'led', color: '#ff5252' } },
      { id: 'led_single', key: 'blkLedSingle', color: '#9300d8', py: 'cyberpi.led.on(30, 170, 255, id=1)', action: { type: 'led', color: '#1eaaff' } },
      { id: 'led_off', key: 'blkLedOff', color: '#9300d8', py: 'cyberpi.led.off("all")', action: { type: 'led', color: 'off' } },
      { id: 'led_bri', key: 'blkLedBrightness', color: '#9300d8', py: 'cyberpi.led.set_bri(50)' }
    ],
    display: [
      { id: 'disp_print', key: 'blkDisplayPrint', color: '#6739b6', py: 'cyberpi.console.println("Hello mBlock!")', action: { type: 'screen', text: 'Hello mBlock!' } },
      { id: 'disp_clear', key: 'blkDisplayClear', color: '#6739b6', py: 'cyberpi.console.clear()', action: { type: 'screen', text: '' } },
      { id: 'disp_chart', key: 'blkDisplayChart', color: '#6739b6', py: 'cyberpi.linechart.add(75)', action: { type: 'screen', text: 'Chart: 75%' } }
    ],
    motion_sensing: [
      { id: 'ms_tilt', key: 'blkMotionTilt', color: '#ff6f00', hat: true, py: '@event.is_tiltforward\ndef on_tilt():' },
      { id: 'ms_shake', key: 'blkMotionShake', color: '#ff6f00', py: 'strength = cyberpi.get_shakeval()' }
    ],
    sensing: [
      { id: 'sen_loud', key: 'blkSensingLoudness', color: '#ff6f00', py: 'loudness = cyberpi.get_loudness()' },
      { id: 'sen_light', key: 'blkSensingLight', color: '#ff6f00', py: 'light = cyberpi.get_bri()' },
      { id: 'sen_btn', key: 'blkSensingButton', color: '#ff6f00', py: 'if cyberpi.controller.is_press("a"):' }
    ],
    lan: [
      { id: 'lan_send', key: 'blkLanBroadcast', color: '#00d7b0', py: 'cyberpi.mesh_broadcast.set("ping", 1)' },
      { id: 'lan_recv', key: 'blkLanReceive', color: '#00d7b0', hat: true, py: '@event.mesh_broadcast("ping")\ndef on_lan():' }
    ],
    ai: [
      { id: 'ai_speech', key: 'blkAiSpeech', color: '#a6d200', py: 'cyberpi.cloud.listen("es", 2)' },
      { id: 'ai_text', key: 'blkAiText', color: '#a6d200', py: 'result = cyberpi.cloud.listen_result()' }
    ],
    iot: [
      { id: 'iot_wifi', key: 'blkIotWifi', color: '#a6d200', py: 'cyberpi.wifi.connect("Network", "****")' },
      { id: 'iot_send', key: 'blkIotSend', color: '#a6d200', py: 'cyberpi.cloud.broadcast("status", "ok")' }
    ],
    events: [
      { id: 'evt_flag', key: 'blkEvtFlag', color: '#ffbf00', hat: true, py: '@event.start\ndef on_start():' },
      { id: 'evt_key', key: 'blkEvtKey', color: '#ffbf00', hat: true, py: '@event.is_press("space")\ndef on_key():' },
      { id: 'evt_start', key: 'blkEvtStart', color: '#ffbf00', hat: true, py: '@event.start\ndef on_cyberpi_start():' }
    ],
    control: [
      { id: 'ctrl_wait', key: 'blkCtrlWait', color: '#ffab19', py: 'time.sleep(1)', action: { type: 'wait', ms: 450 } },
      { id: 'ctrl_repeat', key: 'blkCtrlRepeat', color: '#ffab19', py: 'for count in range(4):' },
      { id: 'ctrl_forever', key: 'blkCtrlForever', color: '#ffab19', py: 'while True:' },
      { id: 'ctrl_if', key: 'blkCtrlIf', color: '#ffab19', py: 'if True:' }
    ],
    operators: [
      { id: 'op_add', key: 'blkOpAdd', color: '#59c059', py: 'total = 10 + 20' },
      { id: 'op_rand', key: 'blkOpRandom', color: '#59c059', py: 'value = random.randint(1, 10)' },
      { id: 'op_join', key: 'blkOpJoin', color: '#59c059', py: 'msg = "hello" + "world"' }
    ],
    variables: [
      { id: 'var_set', key: 'blkVarSet', color: '#ff8c1a', py: 'score = 0' },
      { id: 'var_chg', key: 'blkVarChange', color: '#ff8c1a', py: 'score += 1' }
    ],
    my_blocks: [
      { id: 'my_def', key: 'blkMyBlockDef', color: '#ff6680', hat: true, py: 'def my_routine():' },
      { id: 'my_call', key: 'blkMyBlockCall', color: '#ff6680', py: 'my_routine()' }
    ],
    motion: [
      { id: 'mov_steps', key: 'blkMoveSteps', color: '#4c97ff', py: 'sprite.forward(20)', action: { type: 'move', dx: 24 } },
      { id: 'mov_turn', key: 'blkTurnRight', color: '#4c97ff', py: 'sprite.right(15)', action: { type: 'turn', deg: 15 } }
    ],
    looks: [
      { id: 'look_say', key: 'blkSayHello', color: '#9966ff', py: 'sprite.say("Hello!", 2)', action: { type: 'say', text: 'Hello!' } },
      { id: 'look_color', key: 'blkChangeColor', color: '#9966ff', py: 'sprite.change_color(25)', action: { type: 'hue', deg: 45 } },
      { id: 'look_bg', key: 'blkNextBackdrop', color: '#9966ff', py: 'stage.next_backdrop()', action: { type: 'backdrop' } }
    ],
    sound: [
      { id: 'snd_pop', key: 'blkPlayMeow', color: '#cf63cf', py: 'sprite.play("pop")', action: { type: 'beep', freq: 440 } }
    ]
  };

  const DEVICE_LIBRARY = [
    { id: 'cyberpi', name: 'CyberPi', desc: 'Wi-Fi & AI single-board computer' },
    { id: 'mbot2', name: 'mBot2', desc: 'Smart educational coding robot' },
    { id: 'halocode', name: 'Halocode', desc: 'Wireless IoT board with LED ring' },
    { id: 'arduino_uno', name: 'Arduino Uno', desc: 'Classic microcontroller board' },
    { id: 'esp32', name: 'ESP32', desc: 'Wi-Fi + Bluetooth IoT microcontroller' }
  ];

  const EXTENSION_LIBRARY = [
    { id: 'ext_music', nameKey: 'extMusic', descKey: 'extMusicDesc', color: '#0fbd8c' },
    { id: 'ext_pen', nameKey: 'extPen', descKey: 'extPenDesc', color: '#0fbd8c' },
    { id: 'ext_translate', nameKey: 'extTranslate', descKey: 'extTranslateDesc', color: '#0fbd8c' },
    { id: 'ext_vision', nameKey: 'extAiVision', descKey: 'extAiVisionDesc', color: '#0fbd8c' }
  ];

  /* ===========================
     Application State
     =========================== */
  const state = {
    activeTargetTab: 'devices',
    activeDevice: 'esp32',
    addedDevices: ['esp32'],
    addedExtensions: [],
    activeCategory: null,
    searchMode: false,
    editorMode: 'blocks',
    deviceMode: 'live',
    usingMlink: false,
    serialConnected: false,
    zoom: 1,
    blocks: [],
    undoStack: [],
    redoStack: [],
    sprite: { x: 0, y: 0, size: 100, dir: 90, visible: true, hue: 0 },
    backdrop: 'blank',
    running: false,
    runTimers: []
  };

  /* ===========================
     Utilities
     =========================== */
  let toastTimer = null;
  function showToast(msg) {
    const banner = $('#toastBanner');
    if (!banner) return;
    banner.textContent = msg;
    banner.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { banner.hidden = true; }, 2200);
  }

  function formatBlockMarkup(rawText) {
    return rawText.replace(/\[([^\]]+)\]/g, '<span class="block-pill">$1</span>');
  }

  function playTone(freq = 523, durationMs = 180) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + durationMs / 1000);
    } catch (_) {}
  }

  /* ===========================
     Header Dropdown Menus
     =========================== */
  let openSubmenu = null;
  function closeMenus() {
    if (!openSubmenu) return;
    openSubmenu.classList.remove('open');
    const btn = openSubmenu.querySelector('.menu-trigger');
    if (btn) btn.setAttribute('aria-expanded', 'false');
    openSubmenu = null;
  }

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.has-submenu > .menu-trigger');
    if (trigger) {
      e.stopPropagation();
      const parent = trigger.parentElement;
      const wasOpen = parent.classList.contains('open');
      closeMenus();
      if (!wasOpen) {
        parent.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
        openSubmenu = parent;
      }
      return;
    }
    if (!e.target.closest('.submenu')) {
      closeMenus();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMenus();
      closeAllModals();
      const stageBox = $('#stageCanvasBox');
      if (stageBox) stageBox.classList.remove('fullscreen-stage');
    }
  });

  /* ===========================
     Language Switching (English / Español / 中文)
     =========================== */
  function bindLanguageControls() {
    $$('[data-lang-choice]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const code = el.getAttribute('data-lang-choice');
        if (window.__I18N_SET) window.__I18N_SET(code);
        closeMenus();
      });
    });

    const settingsSelect = $('#settingsLangSelect');
    if (settingsSelect) {
      settingsSelect.addEventListener('change', () => {
        if (window.__I18N_SET) window.__I18N_SET(settingsSelect.value);
      });
    }

    window.addEventListener('i18n:change', () => {
      renderToolbox();
      if (window.MBBlocks && MBBlocks.active()) MBBlocks.relabel(blockLabelFor);
      if (state.activeCategory || state.searchMode) renderFlyout();
      renderWorkspaceBlocks();
      renderDeviceLibrary();
      renderExtensionLibrary();
      renderEnvCheck();
      updateDeviceStatusText();
      updatePythonViews();
    });
  }

  /* ===========================
     Project Name Sync & File Actions
     =========================== */
  function syncProjectName(val, sourceId) {
    const desktopInput = $('#projectInput');
    const mobileInput = $('#projectInputMobile');
    if (desktopInput && sourceId !== 'projectInput') desktopInput.value = val;
    if (mobileInput && sourceId !== 'projectInputMobile') mobileInput.value = val;
    if (desktopInput) desktopInput.dataset.userEdited = 'true';
    if (mobileInput) mobileInput.dataset.userEdited = 'true';
  }

  ['projectInput', 'projectInputMobile'].forEach((id) => {
    const inp = $(`#${id}`);
    if (inp) {
      inp.addEventListener('input', () => syncProjectName(inp.value, id));
    }
  });

  function saveProjectLocally(downloadFile = false) {
    const name = ($('#projectInput')?.value || t('untitled')).trim() || t('untitled');
    const payload = {
      name,
      lang: window.__I18N_LANG || 'en',
      device: state.activeDevice,
      blocks: (window.MBBlocks && MBBlocks.active())
        ? { engine: 'blockly', state: MBBlocks.serialize() }
        : state.blocks,
      savedAt: new Date().toISOString()
    };
    let stored = false;
    try {
      localStorage.setItem('mblock.lastProject', JSON.stringify(payload));
      stored = !!localStorage.getItem('mblock.lastProject');
    } catch (_) {}
    if (downloadFile) {
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${name.replace(/\s+/g, '_')}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
    }
    showToast(stored ? t('savedToast') : t('saveFailedToast'));
  }

  /* Vuelve a abrir el último proyecto guardado en este navegador. */
  function restoreLastProject() {
    let raw = null;
    try { raw = localStorage.getItem('mblock.lastProject'); } catch (_) {}
    if (!raw) return false;
    let p = null;
    try { p = JSON.parse(raw); } catch (_) { return false; }
    if (!p) return false;

    if (p.name) syncProjectName(p.name, '');
    if (p.device && DEVICE_LIBRARY.some((d) => d.id === p.device)) {
      if (!state.addedDevices.includes(p.device)) state.addedDevices.unshift(p.device);
      state.activeDevice = p.device;
      const dev = DEVICE_LIBRARY.find((d) => d.id === p.device);
      if (dev && $('#infoTargetName')) $('#infoTargetName').textContent = dev.name;
    }
    if (p.blocks && p.blocks.engine === 'blockly' && window.MBBlocks && MBBlocks.active()) {
      MBBlocks.load(p.blocks.state);
    } else if (Array.isArray(p.blocks)) {
      state.blocks = p.blocks;
    }
    return true;
  }

  function exportPythonFile() {
    const name = ($('#projectInput')?.value || t('untitled')).trim() || t('untitled');
    const code = generatePythonCode();
    const blob = new Blob([code], { type: 'text/x-python' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${name.replace(/\s+/g, '_')}.py`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  $('#saveBtn')?.addEventListener('click', () => saveProjectLocally(false));

  $$('[data-file-action]').forEach((item) => {
    item.addEventListener('click', () => {
      const action = item.getAttribute('data-file-action');
      closeMenus();
      if (action === 'new') {
        pushUndo();
        state.blocks = [];
        if (window.MBBlocks && MBBlocks.active()) MBBlocks.clear();
        try { localStorage.removeItem('mblock.lastProject'); } catch (_) {}
        syncProjectName(t('untitled'), '');
        renderWorkspaceBlocks();
        updatePythonViews();
        showToast(t('newProjectConfirm'));
      } else if (action === 'open') {
        $('#projectFileInput')?.click();
      } else if (action === 'save-local') {
        saveProjectLocally(true);
      } else if (action === 'export-py') {
        exportPythonFile();
      }
    });
  });

  $('#projectFileInput')?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const enginePayload = parsed.blocks && parsed.blocks.engine === 'blockly' ? parsed.blocks.state : null;
        if (enginePayload && window.MBBlocks && MBBlocks.active()) {
          MBBlocks.load(enginePayload);
          if (parsed.name) syncProjectName(parsed.name, '');
          renderWorkspaceBlocks();
          updatePythonViews();
        } else if (Array.isArray(parsed.blocks)) {
          pushUndo();
          state.blocks = parsed.blocks;
          if (parsed.name) syncProjectName(parsed.name, '');
          renderWorkspaceBlocks();
          updatePythonViews();
        }
      } catch (_) {}
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  /* ===========================
     Privacidad (en Ajustes) y barra de compatibilidad
     =========================== */
  $('#settingsPrivacyBtn')?.addEventListener('click', () => openModal('privacyModal'));

  $('#privacyModalAgreeBtn')?.addEventListener('click', () => {
    closeAllModals();
  });

  $('#compatCloseBtn')?.addEventListener('click', () => {
    const bar = $('#compatTipBar');
    if (bar) bar.hidden = true;
    const toggle = $('#toggleCompatBar');
    if (toggle) toggle.checked = false;
  });

  /* ===========================
     Stage Controls & Sprite Execution
     =========================== */
  function applySpriteTransform() {
    const el = $('#stageSprite');
    if (!el) return;
    const scale = Math.max(0.2, Math.min(2, state.sprite.size / 100));
    const rot = state.sprite.dir - 90;
    el.style.visibility = state.sprite.visible ? 'visible' : 'hidden';
    el.style.transform = `translate(${state.sprite.x}px, ${-state.sprite.y}px) rotate(${rot}deg) scale(${scale})`;
    el.style.filter = state.sprite.hue ? `hue-rotate(${state.sprite.hue}deg)` : 'none';
  }

  function stopExecution() {
    state.running = false;
    state.runTimers.forEach((id) => clearTimeout(id));
    state.runTimers = [];
    const bubble = $('#stageSpeechBubble');
    if (bubble) bubble.hidden = true;
    const ledStrip = $('#stageLedStrip');
    if (ledStrip) ledStrip.hidden = true;
    const screen = $('#stageScreenReadout');
    if (screen) screen.hidden = true;
  }

  function runBlocksSimulation() {
    stopExecution();
    state.running = true;
    const engineActions = (window.MBBlocks && MBBlocks.active()) ? MBBlocks.actions() : null;
    const actions = engineActions || state.blocks.map((b) => b.action).filter(Boolean);
    if (!actions.length) {
      // Gentle default hop + note when running with empty workspace
      actions.push({ type: 'say', text: window.__I18N_LANG === 'es' ? '¡Hola!' : 'Hello!' });
      actions.push({ type: 'move', dx: 18 });
      actions.push({ type: 'beep', freq: 587 });
      actions.push({ type: 'wait', ms: 400 });
      actions.push({ type: 'move', dx: -18 });
    }

    let delay = 0;
    actions.forEach((act) => {
      const timerId = setTimeout(() => {
        if (!state.running) return;
        if (act.type === 'move') {
          state.sprite.x = Math.max(-70, Math.min(70, state.sprite.x + (act.dx || 20)));
          const xIn = $('#spriteXInput');
          if (xIn) xIn.value = state.sprite.x;
          applySpriteTransform();
        } else if (act.type === 'turn') {
          state.sprite.dir = (state.sprite.dir + (act.deg || 15)) % 360;
          const dIn = $('#spriteDirInput');
          if (dIn) dIn.value = state.sprite.dir;
          applySpriteTransform();
        } else if (act.type === 'say') {
          const bubble = $('#stageSpeechBubble');
          if (bubble) {
            bubble.textContent = act.text || 'Hello!';
            bubble.hidden = false;
          }
        } else if (act.type === 'hue') {
          state.sprite.hue = (state.sprite.hue + (act.deg || 30)) % 360;
          applySpriteTransform();
        } else if (act.type === 'led') {
          const strip = $('#stageLedStrip');
          if (strip) {
            strip.hidden = act.color === 'off';
            $$('.led-dot', strip).forEach((dot) => {
              dot.style.backgroundColor = act.color === 'off' ? '#475569' : act.color;
              dot.style.boxShadow = act.color === 'off' ? 'none' : `0 0 8px ${act.color}`;
            });
          }
        } else if (act.type === 'screen') {
          const scr = $('#stageScreenReadout');
          if (scr) {
            scr.hidden = !act.text;
            scr.textContent = act.text;
          }
        } else if (act.type === 'beep') {
          playTone(act.freq || 523);
        } else if (act.type === 'backdrop') {
          const order = ['blank', 'grid', 'sky', 'night'];
          const next = order[(order.indexOf(state.backdrop) + 1) % order.length];
          setBackdrop(next);
        }
      }, delay);
      state.runTimers.push(timerId);
      delay += act.type === 'wait' ? (act.ms || 450) : 260;
    });
  }

  $('#runBtn')?.addEventListener('click', runBlocksSimulation);
  $('#stopBtn')?.addEventListener('click', () => {
    stopExecution();
    state.sprite = { x: 0, y: 0, size: 100, dir: 90, visible: true, hue: 0 };
    if ($('#spriteXInput')) $('#spriteXInput').value = 0;
    if ($('#spriteYInput')) $('#spriteYInput').value = 0;
    if ($('#spriteDirInput')) $('#spriteDirInput').value = 90;
    applySpriteTransform();
  });

  $('#fullscreenBtn')?.addEventListener('click', () => {
    $('#stageCanvasBox')?.classList.toggle('fullscreen-stage');
  });

  $('#smallStageBtn')?.addEventListener('click', () => {
    $('#layoutSide')?.classList.add('small-stage-mode');
    $('#smallStageBtn')?.classList.add('active');
    $('#normalStageBtn')?.classList.remove('active');
  });

  $('#normalStageBtn')?.addEventListener('click', () => {
    $('#layoutSide')?.classList.remove('small-stage-mode');
    $('#normalStageBtn')?.classList.add('active');
    $('#smallStageBtn')?.classList.remove('active');
  });

  $('#gridToggleBtn')?.addEventListener('click', () => {
    $('#stageGridOverlay')?.classList.toggle('visible');
    $('#gridToggleBtn')?.classList.toggle('active');
  });

  /* ===========================
     Target Tabs (Devices / Sprites / Background)
     =========================== */
  function switchTargetTab(tab) {
    state.activeTargetTab = tab;
    $$('[data-target-tab]').forEach((btn) => {
      const active = btn.getAttribute('data-target-tab') === tab;
      btn.classList.toggle('target-selected', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    $('#paneDevices').hidden = tab !== 'devices';
    $('#paneSprites').hidden = tab !== 'sprites';
    $('#paneBackground').hidden = tab !== 'background';

    const infoName = $('#infoTargetName');
    if (infoName) {
      if (tab === 'devices') infoName.textContent = t('cyberpi');
      else if (tab === 'sprites') infoName.textContent = $('#spriteNameInput')?.value || t('panda');
      else infoName.textContent = t('background');
    }

    state.activeCategory = null;
    state.searchMode = false;
    $('#blocklyFlyout').hidden = true;
    renderToolbox();
  }

  $$('[data-target-tab]').forEach((btn) => {
    btn.addEventListener('click', () => switchTargetTab(btn.getAttribute('data-target-tab')));
  });

  // Device controls
  function updateDeviceStatusText() {
    const statusText = $('#deviceStatusText');
    const serialBtn = $('#serialConnectBtn');
    const serialLabel = $('#serialConnectLabel');
    if (statusText) {
      statusText.textContent = state.serialConnected ? t('deviceConnectedMsg') : t('connectYourDevice');
    }
    if (serialBtn) {
      serialBtn.classList.toggle('connected', state.serialConnected);
    }
    if (serialLabel) {
      serialLabel.textContent = state.serialConnected ? t('connected') : t('serial');
    }
    const mlinkText = $('#switchMlinkText');
    if (mlinkText) {
      mlinkText.textContent = state.usingMlink ? t('switchToWeb') : t('switchToMlink');
    }
  }

  $('#switchMlinkBtn')?.addEventListener('click', () => {
    state.usingMlink = !state.usingMlink;
    updateDeviceStatusText();
  });

  $('#serialConnectBtn')?.addEventListener('click', () => {
    state.serialConnected = !state.serialConnected;
    updateDeviceStatusText();
    showToast(state.serialConnected ? t('deviceConnectedMsg') : t('connectYourDevice'));
  });

  $$('[data-mode]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.deviceMode = btn.getAttribute('data-mode');
      $$('[data-mode]').forEach((b) => b.classList.toggle('active', b === btn));
    });
  });

  // Sprite inputs
  $('#spriteXInput')?.addEventListener('input', (e) => { state.sprite.x = Number(e.target.value) || 0; applySpriteTransform(); });
  $('#spriteYInput')?.addEventListener('input', (e) => { state.sprite.y = Number(e.target.value) || 0; applySpriteTransform(); });
  $('#spriteSizeInput')?.addEventListener('input', (e) => { state.sprite.size = Number(e.target.value) || 100; applySpriteTransform(); });
  $('#spriteDirInput')?.addEventListener('input', (e) => { state.sprite.dir = Number(e.target.value) || 90; applySpriteTransform(); });
  $('#spriteVisibleCheck')?.addEventListener('change', (e) => { state.sprite.visible = e.target.checked; applySpriteTransform(); });

  // Backdrop presets
  function setBackdrop(name) {
    state.backdrop = name;
    const stageBox = $('#stageCanvasBox');
    const preview = $('#bgPreviewBox');
    ['backdrop-grid', 'backdrop-sky', 'backdrop-night'].forEach((cls) => {
      stageBox?.classList.remove(cls);
      preview?.classList.remove(cls);
    });
    if (name !== 'blank') {
      stageBox?.classList.add(`backdrop-${name}`);
      preview?.classList.add(`backdrop-${name}`);
    }
    $$('.bg-preset-btn').forEach((b) => b.classList.toggle('active', b.getAttribute('data-backdrop') === name));
  }

  $$('.bg-preset-btn').forEach((btn) => {
    btn.addEventListener('click', () => setBackdrop(btn.getAttribute('data-backdrop')));
  });

  /* ===========================
     Toolbox & Block Flyout
     =========================== */
  function getActiveCategories() {
    const base = state.activeTargetTab === 'devices' ? DEVICE_CATEGORIES : SPRITE_CATEGORIES;
    const extras = state.addedExtensions.map((extId) => {
      const ext = EXTENSION_LIBRARY.find((e) => e.id === extId);
      return { id: extId, labelKey: ext ? ext.nameKey : extId, color: ext ? ext.color : '#0fbd8c', icon: 'bubble' };
    });
    return [...base, ...extras];
  }

  function chipSvg(color) {
    return `<svg viewBox="0 0 24 16" width="20" height="14" aria-hidden="true">
      <rect x="2" y="2" width="20" height="12" rx="2.5" fill="${color}"/>
      <circle cx="6.5" cy="8" r="1.4" fill="#ffffff"/>
      <rect x="10" y="5" width="6" height="6" rx="1" fill="#ffffff" opacity="0.9"/>
      <circle cx="18.5" cy="8" r="1.1" fill="#ffffff"/>
    </svg>`;
  }

  function renderToolbox() {
    const container = $('#toolboxCategories');
    if (!container) return;
    const cats = getActiveCategories();
    container.innerHTML = '';

    cats.forEach((cat) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'category-item' + (state.activeCategory === cat.id && !state.searchMode ? ' selected' : '');
      btn.style.color = cat.color;

      const iconHtml = cat.icon === 'chip'
        ? `<span class="category-chip-icon">${chipSvg(cat.color)}</span>`
        : `<span class="category-bubble" style="background-color:${cat.color};"></span>`;

      btn.innerHTML = `${iconHtml}<span class="category-label">${t(cat.labelKey)}</span>`;
      btn.addEventListener('click', () => {
        if (state.activeCategory === cat.id && !state.searchMode && !$('#blocklyFlyout').hidden) {
          state.activeCategory = null;
          $('#blocklyFlyout').hidden = true;
          renderToolbox();
          return;
        }
        state.searchMode = false;
        state.activeCategory = cat.id;
        $('#toolboxSearchBtn')?.classList.remove('active');
        $('#blocklyFlyout').hidden = false;
        renderToolbox();
        renderFlyout();
      });
      container.appendChild(btn);
    });
  }

  function getBlocksForCategory(catId) {
    if (BLOCKS_BY_CAT[catId]) return BLOCKS_BY_CAT[catId];
    return [
      { id: `${catId}_1`, key: 'blkPlayNote', color: '#0fbd8c', py: `# ${catId}\ncyberpi.audio.play_music(64, 0.25)`, action: { type: 'beep', freq: 659 } },
      { id: `${catId}_2`, key: 'blkSayHello', color: '#0fbd8c', py: `# ${catId}\nprint("Extension active")`, action: { type: 'say', text: 'Extension!' } }
    ];
  }

  function renderFlyout() {
    const flyout = $('#blocklyFlyout');
    const titleEl = $('#flyoutTitle');
    const searchWrap = $('#flyoutSearchWrap');
    const listEl = $('#flyoutBlocks');
    if (!flyout || !listEl) return;

    searchWrap.hidden = !state.searchMode;
    listEl.innerHTML = '';

    let blocksToShow = [];
    if (state.searchMode) {
      titleEl.textContent = t('search');
      const query = ($('#blockSearchInput')?.value || '').trim().toLowerCase();
      const all = Object.values(BLOCKS_BY_CAT).flat();
      blocksToShow = query
        ? all.filter((b) => t(b.key).toLowerCase().includes(query))
        : all.slice(0, 12);
    } else if (state.activeCategory) {
      const catObj = getActiveCategories().find((c) => c.id === state.activeCategory);
      titleEl.textContent = catObj ? t(catObj.labelKey) : '';
      blocksToShow = getBlocksForCategory(state.activeCategory);
    }

    if (!blocksToShow.length) {
      const p = document.createElement('p');
      p.style.color = '#8f9aaa';
      p.style.fontSize = '12px';
      p.textContent = t('noBlocksFound');
      listEl.appendChild(p);
      return;
    }

    blocksToShow.forEach((blk) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'scratch-block' + (blk.hat ? ' hat-block' : '');
      btn.draggable = false;
      btn.style.backgroundColor = blk.color;
      btn.innerHTML = formatBlockMarkup(t(blk.key));
      attachFlyoutDrag(btn, blk);
      listEl.appendChild(btn);
    });
  }

  /* Arrastrar un bloque de la paleta al lienzo (el clic sigue funcionando). */
  let flyoutSuppressClick = false;

  function attachFlyoutDrag(btn, blk) {
    let press = null;
    let ghost = null;
    let dragging = false;

    const onMove = (e) => {
      if (!press || e.pointerId !== press.id) return;
      const dx = e.clientX - press.x;
      const dy = e.clientY - press.y;
      if (!dragging && Math.hypot(dx, dy) < 7) return;
      if (!dragging) {
        dragging = true;
        ghost = btn.cloneNode(true);
        ghost.classList.add('flyout-drag-ghost');
        ghost.style.width = `${btn.offsetWidth}px`;
        document.body.appendChild(ghost);
        document.body.classList.add('is-dragging-block');
      }
      e.preventDefault();
      ghost.style.left = `${e.clientX - 22}px`;
      ghost.style.top = `${e.clientY - 16}px`;
      const over = document.elementFromPoint(e.clientX, e.clientY);
      const onCanvas = !!(over && over.closest('#blocksCanvas'));
      $('#blocksCanvas')?.classList.toggle('drop-active', onCanvas);
    };

    const cleanup = () => {
      if (ghost) { ghost.remove(); ghost = null; }
      document.body.classList.remove('is-dragging-block');
      $('#blocksCanvas')?.classList.remove('drop-active');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
      press = null;
      dragging = false;
    };

    const onUp = (e) => {
      if (!press || e.pointerId !== press.id) return;
      const wasDragging = dragging;
      const x = e.clientX;
      const y = e.clientY;
      cleanup();
      if (!wasDragging) return;
      flyoutSuppressClick = true;
      setTimeout(() => { flyoutSuppressClick = false; }, 250);
      const over = document.elementFromPoint(x, y);
      if (over && over.closest('#blocksCanvas') && window.MBBlocks && MBBlocks.active()) {
        MBBlocks.addAt(blk.id, x, y);
        updatePythonViews();
      }
      e.preventDefault();
    };

    const onCancel = () => cleanup();

    btn.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      press = { x: e.clientX, y: e.clientY, id: e.pointerId };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onCancel);
    });

    btn.addEventListener('click', (e) => {
      if (flyoutSuppressClick) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      addBlockToWorkspace(blk);
    });
  }

  $('#toolboxSearchBtn')?.addEventListener('click', () => {
    state.searchMode = !state.searchMode;
    state.activeCategory = null;
    $('#toolboxSearchBtn')?.classList.toggle('active', state.searchMode);
    $('#blocklyFlyout').hidden = !state.searchMode;
    renderToolbox();
    if (state.searchMode) {
      renderFlyout();
      $('#blockSearchInput')?.focus();
    }
  });

  $('#blockSearchInput')?.addEventListener('input', renderFlyout);

  $('#flyoutCloseBtn')?.addEventListener('click', () => {
    state.activeCategory = null;
    state.searchMode = false;
    $('#blocklyFlyout').hidden = true;
    $('#toolboxSearchBtn')?.classList.remove('active');
    renderToolbox();
  });

  /* ===========================
     Workspace Blocks, Undo/Redo, Zoom, Python Generation
     =========================== */
  function pushUndo() {
    state.undoStack.push(JSON.stringify(state.blocks));
    if (state.undoStack.length > 30) state.undoStack.shift();
    state.redoStack = [];
    updateUndoRedoButtons();
  }

  function updateUndoRedoButtons() {
    const u = $('#undoBtn');
    const r = $('#redoBtn');
    if (u) u.disabled = state.undoStack.length === 0;
    if (r) r.disabled = state.redoStack.length === 0;
  }

  function addBlockToWorkspace(blk) {
    if (window.MBBlocks && MBBlocks.active()) {
      MBBlocks.add(blk.id);
      updatePythonViews();
      return;
    }
    pushUndo();
    state.blocks.push({ ...blk, uid: `${blk.id}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}` });
    renderWorkspaceBlocks();
    updatePythonViews();
  }

  function removeBlockFromWorkspace(uid) {
    pushUndo();
    state.blocks = state.blocks.filter((b) => b.uid !== uid);
    renderWorkspaceBlocks();
    updatePythonViews();
  }

  function renderWorkspaceBlocks() {
    const layer = $('#workspaceBlocksLayer');
    const countEl = $('#blockCountNum');
    if (window.MBBlocks && MBBlocks.active()) {
      MBBlocks.refreshCount();
      return;
    }
    if (countEl) countEl.textContent = String(state.blocks.length);
    if (!layer) return;

    layer.innerHTML = '';
    layer.style.transform = `scale(${state.zoom})`;

    state.blocks.forEach((blk) => {
      const row = document.createElement('div');
      row.className = 'workspace-block-row';

      const chip = document.createElement('div');
      chip.className = 'scratch-block' + (blk.hat ? ' hat-block' : '');
      chip.style.backgroundColor = blk.color;
      chip.innerHTML = formatBlockMarkup(t(blk.key));

      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'ws-delete-btn';
      del.setAttribute('aria-label', 'Delete block');
      del.textContent = '×';
      del.addEventListener('click', () => removeBlockFromWorkspace(blk.uid));

      row.appendChild(chip);
      row.appendChild(del);
      layer.appendChild(row);
    });
  }

  $('#undoBtn')?.addEventListener('click', () => {
    if (window.MBBlocks && MBBlocks.active()) { MBBlocks.undo(); updatePythonViews(); return; }
    if (!state.undoStack.length) return;
    state.redoStack.push(JSON.stringify(state.blocks));
    state.blocks = JSON.parse(state.undoStack.pop());
    updateUndoRedoButtons();
    renderWorkspaceBlocks();
    updatePythonViews();
  });

  $('#redoBtn')?.addEventListener('click', () => {
    if (window.MBBlocks && MBBlocks.active()) { MBBlocks.redo(); updatePythonViews(); return; }
    if (!state.redoStack.length) return;
    state.undoStack.push(JSON.stringify(state.blocks));
    state.blocks = JSON.parse(state.redoStack.pop());
    updateUndoRedoButtons();
    renderWorkspaceBlocks();
    updatePythonViews();
  });

  $('#zoomInBtn')?.addEventListener('click', () => {
    if (window.MBBlocks && MBBlocks.active()) { MBBlocks.zoomIn(); return; }
    state.zoom = Math.min(1.5, +(state.zoom + 0.1).toFixed(2));
    renderWorkspaceBlocks();
  });

  $('#zoomOutBtn')?.addEventListener('click', () => {
    if (window.MBBlocks && MBBlocks.active()) { MBBlocks.zoomOut(); return; }
    state.zoom = Math.max(0.6, +(state.zoom - 0.1).toFixed(2));
    renderWorkspaceBlocks();
  });

  $('#zoomResetBtn')?.addEventListener('click', () => {
    if (window.MBBlocks && MBBlocks.active()) { MBBlocks.zoomReset(); return; }
    state.zoom = 1;
    renderWorkspaceBlocks();
  });

  function generatePythonCode() {
    if (window.MBBlocks && MBBlocks.active()) return MBBlocks.python();
    const headerComment = window.__I18N_LANG === 'es'
      ? '# Código Python generado desde los bloques'
      : window.__I18N_LANG === 'zh'
        ? '# 由积木自动生成的 Python 代码'
        : '# Python code generated from workspace blocks';

    const lines = [headerComment, 'import cyberpi, event, time', ''];
    if (!state.blocks.length) {
      lines.push('@event.start');
      lines.push('def on_start():');
      lines.push('    pass');
      return lines.join('\n');
    }

    let indent = '';
    state.blocks.forEach((blk) => {
      const py = blk.py || 'pass';
      if (blk.hat || py.endsWith(':')) {
        lines.push(py);
        indent = '    ';
      } else {
        lines.push(`${indent}${py}`);
      }
    });
    return lines.join('\n');
  }

  function updatePythonViews() {
    const code = generatePythonCode();
    const pre = $('#codePreviewPre');
    if (pre) pre.textContent = code;
    const ta = $('#pythonTextarea');
    if (ta) ta.value = code;
  }

  /* ===========================
     Blocks / Python Mode Switcher & Code Preview Drawer
     =========================== */
  $$('[data-editor-mode]').forEach((tabBtn) => {
    tabBtn.addEventListener('click', () => {
      const mode = tabBtn.getAttribute('data-editor-mode');
      state.editorMode = mode;
      $$('[data-editor-mode]').forEach((b) => {
        const active = b.getAttribute('data-editor-mode') === mode;
        b.classList.toggle('active', active);
        b.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      $('#pythonEditorPane').hidden = mode !== 'python';
      if (mode === 'blocks' && window.MBBlocks) MBBlocks.resize();
      updatePythonViews();
    });
  });

  $('#codePreviewBtn')?.addEventListener('click', () => {
    const drawer = $('#codePreviewDrawer');
    if (!drawer) return;
    drawer.hidden = !drawer.hidden;
    updatePythonViews();
  });

  $('#closePreviewBtn')?.addEventListener('click', () => {
    $('#codePreviewDrawer').hidden = true;
  });

  function copyPythonText(btn) {
    const code = $('#pythonTextarea')?.value || generatePythonCode();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    const orig = btn.textContent;
    btn.textContent = t('copiedCode');
    setTimeout(() => { btn.textContent = t('copyCode', orig); }, 1400);
  }

  $('#copyPythonBtn')?.addEventListener('click', function () { copyPythonText(this); });
  $('#copyPreviewBtn')?.addEventListener('click', function () { copyPythonText(this); });
  $('#runPythonBtn')?.addEventListener('click', runBlocksSimulation);

  /* ===========================
     Modals & Libraries
     =========================== */
  function openModal(id) {
    closeMenus();
    closeAllModals();
    const el = $(`#${id}`);
    if (el) el.hidden = false;
    if (id === 'envModal') renderEnvCheck();
    if (id === 'addDeviceModal') renderDeviceLibrary();
    if (id === 'extensionModal') renderExtensionLibrary();
  }

  function closeAllModals() {
    $$('.modal-backdrop').forEach((m) => { m.hidden = true; });
  }

  $$('[data-modal-open]').forEach((btn) => {
    btn.addEventListener('click', () => openModal(btn.getAttribute('data-modal-open')));
  });

  $$('[data-modal-close]').forEach((btn) => {
    btn.addEventListener('click', closeAllModals);
  });

  $$('.modal-backdrop').forEach((backdrop) => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeAllModals();
    });
  });

  function renderEnvCheck() {
    const list = $('#envCheckList');
    if (!list) return;
    const checks = [
      { label: t('envWebGL'), ok: true },
      { label: t('envStorage'), ok: typeof window.localStorage !== 'undefined' },
      { label: t('envAudio'), ok: Boolean(window.AudioContext || window.webkitAudioContext) },
      { label: t('envSerial'), ok: 'serial' in navigator },
      { label: t('envBluetooth'), ok: 'bluetooth' in navigator }
    ];
    list.innerHTML = checks.map((c) => `
      <li class="env-check-item">
        <span>${c.label}</span>
        <span class="env-badge ${c.ok ? 'ok' : 'warn'}">${c.ok ? t('envSupported') : t('envUnavailable')}</span>
      </li>
    `).join('');
  }

  function renderDeviceLibrary() {
    const grid = $('#deviceLibraryGrid');
    if (!grid) return;
    grid.innerHTML = '';
    DEVICE_LIBRARY.forEach((dev) => {
      const added = state.addedDevices.includes(dev.id);
      const card = document.createElement('div');
      card.className = 'example-card';
      card.innerHTML = `
        <h3>${dev.name}</h3>
        <p>${dev.desc}</p>
        <button type="button" class="${added ? 'modal-btn-secondary' : 'modal-btn-primary'}">${added ? t('addedBtn') : t('addBtn')}</button>
      `;
      card.querySelector('button').addEventListener('click', () => {
        if (!added) {
          state.addedDevices.push(dev.id);
          renderDeviceList();
          renderDeviceLibrary();
        }
      });
      grid.appendChild(card);
    });
  }

  function renderDeviceList() {
    const col = $('#deviceListCol');
    const addBtn = $('#addDeviceBtn');
    if (!col || !addBtn) return;
    $$('.mtarget-card', col).forEach((el) => el.remove());

    state.addedDevices.forEach((devId) => {
      const dev = DEVICE_LIBRARY.find((d) => d.id === devId) || { id: devId, name: devId };
      const card = document.createElement('div');
      card.className = 'mtarget-card' + (state.activeDevice === dev.id ? ' selected' : '');
      card.innerHTML = `
        <button type="button" class="mtarget-delete-btn" aria-label="Remove ${dev.name}">×</button>
        <div class="mtarget-thumb">
          <svg viewBox="0 0 64 42" width="46" height="30" role="img" aria-label="${dev.name}">
            <rect x="4" y="4" width="56" height="34" rx="5" fill="#3a4552" stroke="#1d242b" stroke-width="1.5"/>
            <rect x="22" y="10" width="20" height="16" rx="2" fill="#111922"/>
            <rect x="25" y="13" width="14" height="10" rx="1" fill="#1eaaff" opacity="0.75"/>
            <circle cx="13" cy="21" r="4.5" fill="#1d242b" stroke="#6d7c8d" stroke-width="1"/>
            <circle cx="51" cy="16" r="2.6" fill="#ff695a"/>
            <circle cx="51" cy="25" r="2.6" fill="#25cc76"/>
            <rect x="19" y="30" width="26" height="3" rx="1.5" fill="#63b3ed"/>
          </svg>
        </div>
        <p class="mtarget-name">${dev.name}</p>
      `;
      card.addEventListener('click', (e) => {
        if (e.target.closest('.mtarget-delete-btn')) {
          if (state.addedDevices.length > 1) {
            state.addedDevices = state.addedDevices.filter((x) => x !== dev.id);
            state.activeDevice = state.addedDevices[0];
            const nextDev = DEVICE_LIBRARY.find((d) => d.id === state.activeDevice);
            if (nextDev) $('#infoTargetName').textContent = nextDev.name;
            renderDeviceList();
          }
          return;
        }
        state.activeDevice = dev.id;
        $('#infoTargetName').textContent = dev.name;
        renderDeviceList();
      });
      col.insertBefore(card, addBtn);
    });
  }

  function renderExtensionLibrary() {
    const grid = $('#extensionLibraryGrid');
    if (!grid) return;
    grid.innerHTML = '';
    EXTENSION_LIBRARY.forEach((ext) => {
      const added = state.addedExtensions.includes(ext.id);
      const card = document.createElement('div');
      card.className = 'example-card';
      card.innerHTML = `
        <h3>${t(ext.nameKey)}</h3>
        <p>${t(ext.descKey)}</p>
        <button type="button" class="${added ? 'modal-btn-secondary' : 'modal-btn-primary'}">${added ? t('addedBtn') : t('addBtn')}</button>
      `;
      card.querySelector('button').addEventListener('click', () => {
        if (!added) {
          state.addedExtensions.push(ext.id);
          renderToolbox();
          renderExtensionLibrary();
        }
      });
      grid.appendChild(card);
    });
  }

  // Example programs loader
  const EXAMPLES = {
    panda: [
      { id: 'evt_flag' },
      { id: 'mov_steps' },
      { id: 'look_say' },
      { id: 'play_note', fields: { NOTE: 64 } }
    ],
    leds: [
      { id: 'evt_start' },
      { id: 'led_all', fields: { COLOR: '#ff5252' } },
      { id: 'disp_print', fields: { TEXT: '¡Hola desde ESP32!' } },
      { id: 'ctrl_wait', fields: { SECS: 1 } },
      { id: 'led_single', fields: { COLOR: '#25cc76' } }
    ],
    counter: [
      { id: 'evt_flag' },
      { id: 'var_set', fields: { VAR: 'contador', VALUE: 1 } },
      {
        id: 'ctrl_repeat',
        fields: { TIMES: 5 },
        do: [
          { id: 'var_chg', fields: { VAR: 'contador', VALUE: 1 } },
          { id: 'play_note', fields: { NOTE: 67 } }
        ]
      },
      { id: 'disp_print', fields: { TEXT: '¡Listo!' } }
    ]
  };

  function workspaceHasWork() {
    if (window.MBBlocks && MBBlocks.active()) return MBBlocks.count() > 0;
    return state.blocks.length > 0;
  }

  function askReplace() {
    return new Promise((resolve) => {
      const modal = $('#replaceModal');
      if (!modal) { resolve(true); return; }
      const okBtn = $('#replaceOkBtn');
      const cancelBtn = $('#replaceCancelBtn');
      const finish = (ok) => {
        okBtn?.removeEventListener('click', onOk);
        cancelBtn?.removeEventListener('click', onCancel);
        closeAllModals();
        resolve(ok);
      };
      const onOk = () => finish(true);
      const onCancel = () => finish(false);
      okBtn?.addEventListener('click', onOk);
      cancelBtn?.addEventListener('click', onCancel);
      openModal('replaceModal');
    });
  }

  function loadExampleProgram(ex) {
    const steps = EXAMPLES[ex];
    if (!steps) return;
    closeAllModals();
    if (window.MBBlocks && MBBlocks.active()) {
      MBBlocks.loadProgram(steps);
    } else {
      const flat = [];
      const walk = (list) => list.forEach((s) => {
        flat.push({ ...(BLOCK_INDEX[s.id] || {}), uid: `${s.id}_${flat.length}` });
        if (s.do) walk(s.do);
      });
      walk(steps);
      state.blocks = flat;
    }
    renderWorkspaceBlocks();
    updatePythonViews();
    runBlocksSimulation();
  }

  $$('[data-load-example]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const ex = btn.getAttribute('data-load-example');
      if (workspaceHasWork()) {
        const ok = await askReplace();
        if (!ok) return;
      }
      loadExampleProgram(ex);
    });
  });

  // Feedback form
  $('#feedbackForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    $('#feedbackText').value = '';
    $('#feedbackEmail').value = '';
    closeAllModals();
    showToast(t('feedbackThanks'));
  });

  // Settings toggles
  $('#toggleGridDots')?.addEventListener('change', (e) => {
    $('#blocksCanvas')?.classList.toggle('no-grid', !e.target.checked);
  });

  $('#toggleCompatBar')?.addEventListener('change', (e) => {
    $('#compatTipBar').hidden = !e.target.checked;
  });

  $('#resetPrefsBtn')?.addEventListener('click', () => {
    try {
      localStorage.removeItem('mblock.lang');
      localStorage.removeItem('mblock.privacyAgreed');
      localStorage.removeItem('mblock.lastProject');
    } catch (_) {}
    $('#compatTipBar').hidden = false;
    $('#toggleCompatBar').checked = true;
    $('#toggleGridDots').checked = true;
    $('#blocksCanvas')?.classList.remove('no-grid');
    if (window.__I18N_SET) window.__I18N_SET('en');
    closeAllModals();
  });

  /* ===========================
     Initialize
     =========================== */
  const BLOCK_INDEX = {};
  Object.keys(BLOCKS_BY_CAT).forEach((cat) => {
    (BLOCKS_BY_CAT[cat] || []).forEach((b) => { BLOCK_INDEX[b.id] = b; });
  });
  function blockLabelFor(id) {
    const entry = BLOCK_INDEX[id];
    return entry ? t(entry.key) : id;
  }

  bindLanguageControls();
  renderToolbox();
  {
    const bootDev = DEVICE_LIBRARY.find((d) => d.id === state.activeDevice);
    if (bootDev && $('#infoTargetName')) $('#infoTargetName').textContent = bootDev.name;
  }
  if (window.MBBlocks) {
    MBBlocks.init({
      blocksByCat: BLOCKS_BY_CAT,
      labelFor: blockLabelFor,
      lang: window.__I18N_LANG || 'en',
      onChange: () => {
        MBBlocks.refreshCount();
        updatePythonViews();
      }
    });
  }
  renderDeviceList();
  restoreLastProject();
  renderWorkspaceBlocks();
  updatePythonViews();
  updateDeviceStatusText();
  updateUndoRedoButtons();
  applySpriteTransform();
})();
