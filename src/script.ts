import { SPRITE_LIBRARY, SPRITE_CATEGORIES as SPRITE_ASSET_CATEGORIES, BACKDROP_LIBRARY, BACKDROP_CATEGORIES } from './sprite-library';

/**
 * UI del IDE: menús, dispositivos, paleta, ejemplos, guardado y simulación.
 * El catálogo BLOCKS_BY_CAT es la fuente única de los bloques; el workspace de
 * Blockly es la fuente de verdad del programa (window.MBBlocks).
 */
(() => {
  const $ = (sel: string, root: ParentNode = document): any => root.querySelector(sel);
  const $$ = (sel: string, root: ParentNode = document): any[] => Array.from(root.querySelectorAll(sel));
  const t = (key: string, def?: string): string => (window.t ? window.t(key, def) : (def || key));

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
  const state: Record<string, any> = {
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
    sprites: [{ id: 'capi', name: 'Capi', x: 0, y: 0, size: 100, dir: 90, visible: true, hue: 0, asset: 'capi' }],
    activeSpriteId: 'capi',
    /* Fondos del proyecto (ids del catálogo BACKDROP_LIBRARY) y el que está puesto.
       mBlock trata cada fondo como un disfraz del escenario: la lista puede crecer
       desde la biblioteca y "siguiente fondo" cicla por ella. */
    backdrops: ['blank'],
    activeBackdropId: 'blank',
    running: false,
    runTimers: []
  };

  /* ===========================
     Utilities
     =========================== */
  let toastTimer: any = null;
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
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
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
  let openSubmenu: any = null;
  function closeMenus() {
    if (!openSubmenu) return;
    openSubmenu.classList.remove('open');
    const btn = openSubmenu.querySelector('.menu-trigger');
    if (btn) btn.setAttribute('aria-expanded', 'false');
    openSubmenu = null;
  }

  document.addEventListener('click', (e) => {
    const trigger = (e.target as Element)?.closest('.has-submenu > .menu-trigger');
    if (trigger) {
      e.stopPropagation();
      const parent = trigger.parentElement as HTMLElement;
      if (!parent) return;
      const wasOpen = parent.classList.contains('open');
      closeMenus();
      if (!wasOpen) {
        parent.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
        openSubmenu = parent;
      }
      return;
    }
    if (!(e.target as Element)?.closest('.submenu')) {
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
      renderSpriteList();
      renderSpriteLibraryModal();
      renderBackdropList();
      renderBackdropLibraryModal();
      renderEnvCheck();
      updateEnvBadge();
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
    let raw: string | null = null;
    try { raw = localStorage.getItem('mblock.lastProject'); } catch (_) {}
    if (!raw) return false;
    let p: any = null;
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

  /* ===========================
     Stage Controls & Sprite Execution
     =========================== */
  /* Devuelve el sprite activo; si su id ya no existe cae al primero y corrige el estado. */
  function activeSprite(): any {
    const active = state.sprites.find((s) => s.id === state.activeSpriteId);
    if (active) return active;
    const first = state.sprites[0] || null;
    if (first) state.activeSpriteId = first.id;
    return first;
  }

  /* SVG aprobado del capibara, clonado de #stageSprite en el primer render (regla 4). */
  let capiTemplateSvg: Element | null = null;

  function captureCapiTemplate(root: ParentNode) {
    if (capiTemplateSvg) return;
    const template = root.querySelector('#stageSprite svg')
      || root.querySelector('.stage-sprite-wrap[data-sprite-id="capi"] svg')
      || root.querySelector('.stage-sprite-wrap svg');
    if (template) capiTemplateSvg = template.cloneNode(true) as Element;
  }

  /* Contenido visual de un sprite: el capibara aprobado o el asset externo (futuro). */
  function spriteVisual(sprite): Element | null {
    if (sprite.asset === 'capi') {
      return capiTemplateSvg ? (capiTemplateSvg.cloneNode(true) as Element) : null;
    }
    const img = document.createElement('img');
    img.src = String(sprite.asset || '');
    img.alt = sprite.name || '';
    img.draggable = false;
    return img;
  }

  /* Aplica transform/visibilidad/color de un sprite a su wrap. */
  function applySpriteStyle(wrap: HTMLElement, sprite) {
    const scale = Math.max(0.2, Math.min(2, sprite.size / 100));
    const rot = sprite.dir - 90;
    wrap.style.visibility = sprite.visible ? 'visible' : 'hidden';
    wrap.style.transform = `translate(-50%, -50%) translate(${sprite.x}px, ${-sprite.y}px) rotate(${rot}deg) scale(${scale})`;
    wrap.style.filter = sprite.hue ? `hue-rotate(${sprite.hue}deg)` : 'none';
  }

  /* Pinta todos los sprites de la escena; uno por <div class="stage-sprite-wrap">. */
  function renderSprites() {
    const box = $('#stageCanvasBox');
    if (!box) return;
    captureCapiTemplate(box);
    $$('.stage-sprite-wrap', box).forEach((el) => el.remove());
    const anchor = $('#stageScreenReadout', box);

    state.sprites.forEach((sprite) => {
      const wrap = document.createElement('div');
      wrap.className = 'stage-sprite-wrap';
      wrap.setAttribute('data-sprite-id', sprite.id);
      if (sprite.id === 'capi') wrap.id = 'stageSprite';

      const visual = spriteVisual(sprite);
      if (visual) wrap.appendChild(visual);
      applySpriteStyle(wrap, sprite);
      if (anchor) box.insertBefore(wrap, anchor);
      else box.appendChild(wrap);
    });
  }

  /* Sincroniza la escena sin recrear los wraps, para conservar la transición CSS. */
  function updateStage() {
    const box = $('#stageCanvasBox');
    if (!box) return;
    const wraps = $$('.stage-sprite-wrap', box);
    const rendered = wraps.map((w) => w.getAttribute('data-sprite-id')).join('|');
    const wanted = state.sprites.map((s) => s.id).join('|');
    if (rendered !== wanted) {
      renderSprites();
      return;
    }
    state.sprites.forEach((sprite, i) => applySpriteStyle(wraps[i], sprite));
  }

  /* ===========================
     Sprite list (pestaña Objetos)
     =========================== */
  let spriteIdSeq = 0;

  /* Id único para sprites nuevos (biblioteca/subidas); nunca repite uno existente. */
  function nextSpriteId(): string {
    let id = '';
    do {
      spriteIdSeq += 1;
      id = `sprite_${Date.now().toString(36)}_${spriteIdSeq}`;
    } while (state.sprites.some((s) => s.id === id));
    return id;
  }

  /* Vuelca los valores del sprite activo en los inputs de propiedades. */
  function syncSpriteInputs() {
    const sprite = activeSprite();
    if (!sprite) return;
    const setValue = (selector: string, value) => {
      const input = $(selector);
      if (input && String(input.value) !== String(value)) input.value = value;
    };
    setValue('#spriteNameInput', sprite.name);
    setValue('#spriteXInput', sprite.x);
    setValue('#spriteYInput', sprite.y);
    setValue('#spriteSizeInput', sprite.size);
    setValue('#spriteDirInput', sprite.dir);
    const visible = $('#spriteVisibleCheck');
    if (visible) visible.checked = Boolean(sprite.visible);
  }

  /* "nombre | ..." del encabezado: sigue al sprite activo cuando la pestaña Objetos está abierta. */
  function updateInfoTargetName() {
    if (state.activeTargetTab !== 'sprites') return;
    const infoName = $('#infoTargetName');
    const sprite = activeSprite();
    if (infoName && sprite) infoName.textContent = sprite.name;
  }

  function selectSprite(id) {
    if (!state.sprites.some((s) => s.id === id)) return;
    state.activeSpriteId = id;
    syncSpriteInputs();
    renderSpriteList();
    updateInfoTargetName();
  }

  /* Borra un sprite; nunca deja la escena vacía. */
  function deleteSprite(id) {
    if (state.sprites.length <= 1) {
      showToast(t('cannotDeleteLastSprite'));
      return;
    }
    const index = state.sprites.findIndex((s) => s.id === id);
    if (index === -1) return;
    const wasActive = state.activeSpriteId === id;
    state.sprites.splice(index, 1);
    if (wasActive || !state.sprites.some((s) => s.id === state.activeSpriteId)) {
      state.activeSpriteId = state.sprites[0].id;
    }
    renderSprites();
    syncSpriteInputs();
    renderSpriteList();
    updateInfoTargetName();
  }

  /* ===========================
     Biblioteca de objetos (modal)
     =========================== */

  /* Estado efímero del modal: pestaña, categoría, búsqueda y tarjeta seleccionada. */
  const spriteLibraryState = {
    tab: 'library',
    cat: 'all',
    query: '',
    selected: null as null | { id: string; name: string; asset: string }
  };

  /* Búsqueda sin acentos ni mayúsculas: "avion" encuentra "Avión". */
  function normalizeSearchText(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  /* Nombre visible único dentro del proyecto: si ya existe, añade " 2", " 3"... */
  function uniqueSpriteName(base) {
    const wanted = String(base || '').trim() || t('spriteName');
    let name = wanted;
    let n = 2;
    while (state.sprites.some((s) => String(s.name).toLowerCase() === name.toLowerCase())) {
      name = `${wanted} ${n}`;
      n += 1;
    }
    return name;
  }

  /* Posición escalonada como mBlock (+72 px por sprite), sin salirse del escenario. */
  function staggeredSpritePosition() {
    const box = $('#stageCanvasBox');
    const halfW = (box ? box.clientWidth : 400) / 2;
    const halfH = (box ? box.clientHeight : 212) / 2;
    /* 40 px cubre el ancho real de un wrapper (66 px con size 100) y evita que
       el sprite quede cortado en el borde del escenario. */
    const margin = 40;
    const clamp = (value, min, max) => Math.round(Math.max(min, Math.min(max, value)));
    return {
      x: clamp(72 * state.sprites.length, -halfW + margin, halfW - margin),
      y: clamp(25, -halfH + margin, halfH - margin)
    };
  }

  /* Añade un sprite al proyecto (biblioteca o subida), lo selecciona y repinta lista/escena. */
  function addSpriteFromAsset(name, asset) {
    const pos = staggeredSpritePosition();
    const sprite = {
      id: nextSpriteId(),
      name: uniqueSpriteName(name),
      x: pos.x,
      y: pos.y,
      size: 100,
      dir: 90,
      visible: true,
      hue: 0,
      asset
    };
    state.sprites.push(sprite);
    state.activeSpriteId = sprite.id;
    renderSprites();
    syncSpriteInputs();
    renderSpriteList();
    updateInfoTargetName();
    return sprite;
  }

  /* Entradas del grid según la pestaña; "Mis objetos" solo lista assets subidos (data-URI).
     Aceptar sobre una tarjeta de "Mis objetos" vuelve a añadir una copia (no la mueve). */
  function currentLibraryItems() {
    if (spriteLibraryState.tab === 'mine') {
      return state.sprites
        .filter((s) => typeof s.asset === 'string' && s.asset.startsWith('data:'))
        .map((s) => ({ id: s.id, name: s.name, cat: 'mine', file: s.asset }));
    }
    return SPRITE_LIBRARY;
  }

  function updateSpriteLibraryOk() {
    const ok = $('#spriteLibraryOkBtn');
    if (ok) ok.disabled = !spriteLibraryState.selected;
  }

  function resetSpriteLibrary() {
    spriteLibraryState.tab = 'library';
    spriteLibraryState.cat = 'all';
    spriteLibraryState.query = '';
    spriteLibraryState.selected = null;
    const search = $('#spriteLibrarySearch');
    if (search) search.value = '';
    updateSpriteLibraryOk();
  }

  /* Pinta pestañas, pills, buscador y grid con el filtro actual. */
  function renderSpriteLibraryModal() {
    const modal = $('#spriteLibraryModal');
    if (!modal) return;

    $$('.library-tab', modal).forEach((tab) => {
      const active = tab.getAttribute('data-sprite-tab') === spriteLibraryState.tab;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    const cats = $('#spriteCats', modal);
    if (cats) {
      cats.hidden = spriteLibraryState.tab === 'mine';
      cats.innerHTML = '';
      if (spriteLibraryState.tab === 'library') {
        const pills = [{ id: 'all', label: t('catAll') }].concat(
          SPRITE_ASSET_CATEGORIES.map((cat) => ({ id: cat.id, label: t(cat.labelKey, cat.label) }))
        );
        pills.forEach((pill) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          const isActive = spriteLibraryState.cat === pill.id;
          btn.className = 'cat-pill' + (isActive ? ' active' : '');
          btn.setAttribute('data-cat', pill.id);
          btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
          btn.textContent = pill.label;
          btn.addEventListener('click', () => {
            spriteLibraryState.cat = pill.id;
            renderSpriteLibraryModal();
          });
          cats.appendChild(btn);
        });
      }
    }

    const search = $('#spriteLibrarySearch', modal);
    if (search && search.value !== spriteLibraryState.query) search.value = spriteLibraryState.query;

    const grid = $('#spriteGrid', modal);
    const empty = $('#spriteLibraryEmpty', modal);
    if (!grid) return;
    grid.innerHTML = '';

    const query = normalizeSearchText(spriteLibraryState.query);
    const items = currentLibraryItems().filter((item) => {
      if (spriteLibraryState.tab === 'library' && spriteLibraryState.cat !== 'all' && item.cat !== spriteLibraryState.cat) {
        return false;
      }
      return !query || normalizeSearchText(item.name).includes(query);
    });

    items.forEach((item) => {
      const card = document.createElement('button');
      card.type = 'button';
      const isSelected = Boolean(spriteLibraryState.selected && spriteLibraryState.selected.id === item.id);
      card.className = 'asset-card' + (isSelected ? ' selected' : '');
      card.setAttribute('data-asset-id', item.id);
      card.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
      card.title = item.name;

      const img = document.createElement('img');
      img.src = item.file;
      img.alt = '';
      img.draggable = false;
      img.loading = 'lazy';
      card.appendChild(img);

      const label = document.createElement('span');
      label.className = 'asset-name';
      label.textContent = item.name;
      card.appendChild(label);

      /* Un clic marca; doble clic añade y cierra sin pasar por Aceptar. */
      card.addEventListener('click', () => {
        spriteLibraryState.selected = { id: item.id, name: item.name, asset: item.file };
        renderSpriteLibraryModal();
      });
      card.addEventListener('dblclick', () => {
        spriteLibraryState.selected = { id: item.id, name: item.name, asset: item.file };
        acceptSpriteLibrarySelection();
      });
      grid.appendChild(card);
    });

    const hasItems = items.length > 0;
    grid.hidden = !hasItems;
    if (empty) {
      empty.hidden = hasItems;
      const text = $('#spriteLibraryEmptyText', modal);
      const hasUploads = state.sprites.some((s) => typeof s.asset === 'string' && s.asset.startsWith('data:'));
      if (text) text.textContent = spriteLibraryState.tab === 'mine' && !hasUploads
        ? t('mySpritesEmpty')
        : t('noResults');
    }
    updateSpriteLibraryOk();
  }

  function acceptSpriteLibrarySelection() {
    const selected = spriteLibraryState.selected;
    if (!selected) return;
    addSpriteFromAsset(selected.name, selected.asset);
    closeAllModals();
    resetSpriteLibrary();
  }

  /* Abre el modal (una sola vez): repinta el grid y limpia la selección previa. */
  function openSpriteLibrary() {
    if (!$('#spriteLibraryModal')) return;
    resetSpriteLibrary();
    renderSpriteLibraryModal();
    openModal('spriteLibraryModal');
  }

  $$('[data-sprite-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      spriteLibraryState.tab = btn.getAttribute('data-sprite-tab');
      spriteLibraryState.cat = 'all';
      spriteLibraryState.selected = null;
      renderSpriteLibraryModal();
    });
  });

  $('#spriteLibrarySearch')?.addEventListener('input', (e) => {
    spriteLibraryState.query = e.target.value;
    renderSpriteLibraryModal();
  });

  $('#spriteLibraryOkBtn')?.addEventListener('click', acceptSpriteLibrarySelection);

  $('#spriteUploadBtn')?.addEventListener('click', () => $('#spriteUploadInput')?.click());

  $('#spriteUploadInput')?.addEventListener('change', (e) => {
    const input = e.target;
    const file = input.files && input.files[0];
    if (!file) return;
    if (!/^image\/(png|svg\+xml)$/i.test(file.type)) {
      showToast(t('uploadFailed'));
      input.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      /* El data-URI se guarda dentro del sprite: un PNG grande puede agotar el
         localStorage (~5 MB por origen) al guardar el proyecto. La tarea de
         guardado deberá limitar/omitir los assets > 2 MB y avisar con un toast. */
      addSpriteFromAsset(String(file.name).replace(/\.[^.]+$/, ''), String(reader.result));
      spriteLibraryState.tab = 'mine';
      spriteLibraryState.cat = 'all';
      spriteLibraryState.query = '';
      spriteLibraryState.selected = null;
      const search = $('#spriteLibrarySearch');
      if (search) search.value = '';
      renderSpriteLibraryModal();
    };
    reader.onerror = () => showToast(t('uploadFailed'));
    reader.readAsDataURL(file);
    input.value = '';
  });


  /* Miniatura: clon del capibara aprobado (asset 'capi') o el <img> del asset. */
  function spriteThumb(sprite): HTMLElement {
    const thumb = document.createElement('div');
    thumb.className = 'mtarget-thumb';
    if (sprite.asset === 'capi') {
      if (!capiTemplateSvg) captureCapiTemplate(document);
      const svg = capiTemplateSvg ? (capiTemplateSvg.cloneNode(true) as Element) : null;
      if (svg) {
        svg.setAttribute('width', '34');
        svg.setAttribute('height', '40');
        svg.setAttribute('aria-hidden', 'true');
        svg.removeAttribute('role');
        svg.removeAttribute('aria-label');
        thumb.appendChild(svg);
      }
      return thumb;
    }
    const img = document.createElement('img');
    img.src = String(sprite.asset || '');
    img.alt = '';
    img.width = 40;
    img.height = 40;
    img.draggable = false;
    thumb.appendChild(img);
    return thumb;
  }

  /* Pinta la lista de tarjetas: una por sprite, X en la activa y "+ Añadir" al final. */
  function renderSpriteList() {
    const list = $('#spriteList');
    if (!list) return;
    list.innerHTML = '';

    state.sprites.forEach((sprite) => {
      const isActive = sprite.id === state.activeSpriteId;
      const card = document.createElement('div');
      card.className = 'mtarget-card' + (isActive ? ' selected' : '');
      card.setAttribute('data-sprite-id', sprite.id);
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      card.setAttribute('aria-label', sprite.name);
      card.title = sprite.name;
      card.appendChild(spriteThumb(sprite));

      const name = document.createElement('p');
      name.className = 'mtarget-name';
      name.textContent = sprite.name;
      card.appendChild(name);

      if (isActive) {
        const del = document.createElement('button');
        del.type = 'button';
        del.className = 'mtarget-delete-btn';
        del.textContent = '×';
        del.setAttribute('aria-label', `${t('deleteSprite')}: ${sprite.name}`);
        del.title = t('deleteSprite');
        del.addEventListener('click', (e) => {
          e.stopPropagation();
          deleteSprite(sprite.id);
        });
        card.appendChild(del);
      }

      card.addEventListener('click', () => selectSprite(sprite.id));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectSprite(sprite.id);
        }
      });
      list.appendChild(card);
    });

    const add = document.createElement('div');
    add.className = 'mtarget-card mtarget-card--add';
    add.setAttribute('role', 'button');
    add.setAttribute('tabindex', '0');
    add.setAttribute('data-modal-open', 'spriteLibraryModal');
    add.setAttribute('aria-label', t('add'));
    add.title = t('add');
    const circle = document.createElement('span');
    circle.className = 'add-circle';
    circle.setAttribute('aria-hidden', 'true');
    circle.textContent = '+';
    add.appendChild(circle);
    const addName = document.createElement('p');
    addName.className = 'mtarget-name';
    addName.textContent = t('add');
    add.appendChild(addName);
    /* La tarjeta se crea después del binding global de [data-modal-open] (solo
       cubre elementos estáticos), así que este es el único listener que abre el
       modal; el atributo queda como hook declarativo y para las pruebas. */
    add.addEventListener('click', openSpriteLibrary);
    add.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openSpriteLibrary();
      }
    });
    list.appendChild(add);
  }

  /* API mínima de sprites: la usan las pruebas y la futura biblioteca (Task 4+). */
  (window as any).MBSprites = {
    list: () => state.sprites,
    add: (sprite) => {
      const id = (sprite && sprite.id) || nextSpriteId();
      state.sprites.push({
        x: 0, y: 0, size: 100, dir: 90, visible: true, hue: 0, asset: 'capi',
        ...sprite,
        id
      });
      renderSprites();
      selectSprite(id);
      return id;
    },
    select: selectSprite,
    remove: deleteSprite,
    render: () => {
      renderSprites();
      renderSpriteList();
      syncSpriteInputs();
      updateInfoTargetName();
    }
  };

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
        const sprite = activeSprite();
        if (act.type === 'move' && sprite) {
          sprite.x = Math.max(-70, Math.min(70, sprite.x + (act.dx || 20)));
          const xIn = $('#spriteXInput');
          if (xIn) xIn.value = sprite.x;
          updateStage();
        } else if (act.type === 'turn' && sprite) {
          sprite.dir = (sprite.dir + (act.deg || 15)) % 360;
          const dIn = $('#spriteDirInput');
          if (dIn) dIn.value = sprite.dir;
          updateStage();
        } else if (act.type === 'say') {
          const bubble = $('#stageSpeechBubble');
          if (bubble) {
            bubble.textContent = act.text || 'Hello!';
            bubble.hidden = false;
          }
        } else if (act.type === 'hue' && sprite) {
          sprite.hue = (sprite.hue + (act.deg || 30)) % 360;
          updateStage();
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
          /* Cicla la lista de fondos del proyecto (no el orden fijo del catálogo).
             Con un solo fondo vuelve a sí mismo: no hay cambio visible. */
          const order = state.backdrops.length ? state.backdrops : ['blank'];
          const next = order[(order.indexOf(state.activeBackdropId) + 1) % order.length];
          setBackdrop(next || order[0]);
        }
      }, delay);
      state.runTimers.push(timerId);
      delay += act.type === 'wait' ? (act.ms || 450) : 260;
    });
  }

  $('#runBtn')?.addEventListener('click', runBlocksSimulation);
  $('#stopBtn')?.addEventListener('click', () => {
    stopExecution();
    const sprite = activeSprite();
    if (sprite) {
      Object.assign(sprite, { x: 0, y: 0, size: 100, dir: 90, visible: true, hue: 0 });
    }
    if ($('#spriteXInput')) $('#spriteXInput').value = 0;
    if ($('#spriteYInput')) $('#spriteYInput').value = 0;
    if ($('#spriteDirInput')) $('#spriteDirInput').value = 90;
    updateStage();
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
      else if (tab === 'sprites') infoName.textContent = activeSprite()?.name || $('#spriteNameInput')?.value || t('panda');
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

  // Sprite inputs (propiedades del sprite activo)
  $('#spriteNameInput')?.addEventListener('input', (e) => {
    const sprite = activeSprite();
    if (!sprite) return;
    sprite.name = e.target.value;
    const card = $$('.mtarget-card', $('#spriteList') || document)
      .find((c) => c.getAttribute('data-sprite-id') === sprite.id);
    if (card) {
      const label = $('.mtarget-name', card);
      if (label) label.textContent = sprite.name;
      card.setAttribute('aria-label', sprite.name);
      card.title = sprite.name;
      const del = $('.mtarget-delete-btn', card);
      if (del) del.setAttribute('aria-label', `${t('deleteSprite')}: ${sprite.name}`);
    }
    updateInfoTargetName();
  });
  $('#spriteXInput')?.addEventListener('input', (e) => { const s = activeSprite(); if (s) s.x = Number(e.target.value) || 0; updateStage(); });
  $('#spriteYInput')?.addEventListener('input', (e) => { const s = activeSprite(); if (s) s.y = Number(e.target.value) || 0; updateStage(); });
  $('#spriteSizeInput')?.addEventListener('input', (e) => { const s = activeSprite(); if (s) s.size = Number(e.target.value) || 100; updateStage(); });
  $('#spriteDirInput')?.addEventListener('input', (e) => { const s = activeSprite(); if (s) s.dir = Number(e.target.value) || 90; updateStage(); });
  $('#spriteVisibleCheck')?.addEventListener('change', (e) => { const s = activeSprite(); if (s) s.visible = e.target.checked; updateStage(); });

  /* ===========================
     Fondos del proyecto (pestaña Fondo + biblioteca)
     =========================== */

  /* Clases de los presets CSS: las que ya pinta style.css. */
  const BACKDROP_PRESET_CLASSES = ['backdrop-grid', 'backdrop-sky', 'backdrop-night'];

  function backdropById(id) {
    return BACKDROP_LIBRARY.find((b) => b.id === id) || null;
  }

  /* Nombre visible: presets con clave i18n; assets con el nombre del catálogo. */
  const BACKDROP_I18N_KEYS = {
    blank: 'backdropBlank',
    grid: 'backdropGrid',
    sky: 'backdropSky',
    night: 'backdropNight'
  };
  function backdropLabel(asset) {
    const key = BACKDROP_I18N_KEYS[asset.id];
    return key ? t(key, asset.name) : asset.name;
  }

  /* Pinta un fondo sobre un elemento: preset → clase CSS; asset → background-image
     local (regla 1: sin URLs remotas). Un id desconocido deja el lienzo blanco. */
  function applyBackdropVisual(id, el) {
    if (!el) return;
    BACKDROP_PRESET_CLASSES.forEach((cls) => el.classList.remove(cls));
    el.classList.remove('backdrop-asset');
    el.style.backgroundImage = '';
    const asset = backdropById(id);
    if (!asset) return;
    if (asset.file) {
      el.classList.add('backdrop-asset');
      el.style.backgroundImage = `url("${asset.file}")`;
    } else if (asset.id !== 'blank') {
      el.classList.add(`backdrop-${asset.id}`);
    }
  }

  /* Activa un fondo del catálogo (debe estar en el proyecto, pero no lo exige). */
  function setBackdrop(id) {
    const asset = backdropById(id);
    state.activeBackdropId = asset ? asset.id : 'blank';
    applyBackdropVisual(state.activeBackdropId, $('#stageCanvasBox'));
    renderBackdropList();
  }

  /* Añade un fondo al proyecto; si ya existe solo lo activa (sin duplicados). */
  function addBackdrop(id) {
    const asset = backdropById(id);
    if (!asset) return false;
    if (!state.backdrops.includes(asset.id)) state.backdrops.push(asset.id);
    setBackdrop(asset.id);
    return true;
  }

  /* Miniatura: preset → swatch con las clases del escenario; asset → <img> local. */
  function backdropThumb(asset, className) {
    const thumb = document.createElement('div');
    thumb.className = className;
    if (asset.file) {
      const img = document.createElement('img');
      img.src = asset.file;
      img.alt = '';
      img.loading = 'lazy';
      img.draggable = false;
      thumb.appendChild(img);
    } else {
      const swatch = document.createElement('div');
      swatch.className = 'bg-swatch';
      applyBackdropVisual(asset.id, swatch);
      thumb.appendChild(swatch);
    }
    return thumb;
  }

  /* Lista de fondos del proyecto: una tarjeta por fondo, "+" y contador dinámico. */
  function renderBackdropList() {
    const list = $('#backdropList');
    if (!list) return;
    list.innerHTML = '';

    state.backdrops
      .map((id) => backdropById(id))
      .filter(Boolean)
      .forEach((asset) => {
        const isActive = asset.id === state.activeBackdropId;
        const card = document.createElement('div');
        card.className = 'bg-card' + (isActive ? ' selected' : '');
        card.setAttribute('data-backdrop-id', asset.id);
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        card.setAttribute('aria-label', backdropLabel(asset));
        card.title = backdropLabel(asset);
        card.appendChild(backdropThumb(asset, 'bg-thumb'));

        const name = document.createElement('p');
        name.className = 'bg-card-name';
        name.textContent = backdropLabel(asset);
        card.appendChild(name);

        card.addEventListener('click', () => setBackdrop(asset.id));
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setBackdrop(asset.id);
          }
        });
        list.appendChild(card);
      });

    const add = document.createElement('div');
    add.className = 'bg-card bg-card--add';
    add.setAttribute('role', 'button');
    add.setAttribute('tabindex', '0');
    add.setAttribute('data-modal-open', 'backdropLibraryModal');
    add.setAttribute('aria-label', t('add'));
    add.title = t('add');
    const circle = document.createElement('span');
    circle.className = 'add-circle';
    circle.setAttribute('aria-hidden', 'true');
    circle.textContent = '+';
    add.appendChild(circle);
    const addName = document.createElement('p');
    addName.className = 'bg-card-name';
    addName.textContent = t('add');
    add.appendChild(addName);
    /* Igual que en la lista de sprites: la tarjeta nace después del binding global
       de [data-modal-open], así que este listener es el que abre el modal. */
    add.addEventListener('click', openBackdropLibrary);
    add.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openBackdropLibrary();
      }
    });
    list.appendChild(add);

    const count = $('#backdropCountText');
    if (count) count.textContent = `${t('numberOfCostumes')}: ${state.backdrops.length}`;
  }

  /* Estado efímero del modal de fondos: categoría, búsqueda y tarjeta marcada. */
  const backdropLibraryState = {
    cat: 'all',
    query: '',
    selected: null as null | string
  };

  function updateBackdropLibraryOk() {
    const ok = $('#backdropLibraryOkBtn');
    if (ok) ok.disabled = !backdropLibraryState.selected;
  }

  function resetBackdropLibrary() {
    backdropLibraryState.cat = 'all';
    backdropLibraryState.query = '';
    backdropLibraryState.selected = null;
    const search = $('#backdropLibrarySearch');
    if (search) search.value = '';
    updateBackdropLibraryOk();
  }

  /* Pinta pills, buscador y grid del modal con el filtro actual. */
  function renderBackdropLibraryModal() {
    const modal = $('#backdropLibraryModal');
    if (!modal) return;

    const cats = $('#backdropCats', modal);
    if (cats) {
      cats.innerHTML = '';
      const pills = [{ id: 'all', label: t('catAll') }].concat(
        BACKDROP_CATEGORIES.map((cat) => ({ id: cat.id, label: t(cat.labelKey, cat.label) }))
      );
      pills.forEach((pill) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        const isActive = backdropLibraryState.cat === pill.id;
        btn.className = 'cat-pill' + (isActive ? ' active' : '');
        btn.setAttribute('data-cat', pill.id);
        btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        btn.textContent = pill.label;
        btn.addEventListener('click', () => {
          backdropLibraryState.cat = pill.id;
          renderBackdropLibraryModal();
        });
        cats.appendChild(btn);
      });
    }

    const search = $('#backdropLibrarySearch', modal);
    if (search && search.value !== backdropLibraryState.query) search.value = backdropLibraryState.query;

    const grid = $('#backdropGrid', modal);
    const empty = $('#backdropLibraryEmpty', modal);
    if (!grid) return;
    grid.innerHTML = '';

    const query = normalizeSearchText(backdropLibraryState.query);
    const items = BACKDROP_LIBRARY.filter((item) => {
      if (backdropLibraryState.cat !== 'all' && item.cat !== backdropLibraryState.cat) return false;
      return !query || normalizeSearchText(backdropLabel(item)).includes(query);
    });

    items.forEach((item) => {
      const card = document.createElement('button');
      card.type = 'button';
      const isSelected = backdropLibraryState.selected === item.id;
      card.className = 'asset-card asset-card--backdrop' + (isSelected ? ' selected' : '');
      card.setAttribute('data-asset-id', item.id);
      card.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
      card.title = backdropLabel(item);
      card.appendChild(backdropThumb(item, 'asset-thumb'));

      const label = document.createElement('span');
      label.className = 'asset-name';
      label.textContent = backdropLabel(item);
      card.appendChild(label);

      /* Un clic marca; doble clic añade y cierra sin pasar por Aceptar. */
      card.addEventListener('click', () => {
        backdropLibraryState.selected = item.id;
        renderBackdropLibraryModal();
      });
      card.addEventListener('dblclick', () => {
        backdropLibraryState.selected = item.id;
        acceptBackdropLibrarySelection();
      });
      grid.appendChild(card);
    });

    const hasItems = items.length > 0;
    grid.hidden = !hasItems;
    if (empty) {
      empty.hidden = hasItems;
      const text = $('#backdropLibraryEmptyText', modal);
      if (text) text.textContent = t('noResults');
    }
    updateBackdropLibraryOk();
  }

  function acceptBackdropLibrarySelection() {
    const selected = backdropLibraryState.selected;
    if (!selected) return;
    addBackdrop(selected);
    closeAllModals();
    resetBackdropLibrary();
  }

  function openBackdropLibrary() {
    if (!$('#backdropLibraryModal')) return;
    resetBackdropLibrary();
    renderBackdropLibraryModal();
    openModal('backdropLibraryModal');
  }

  $('#backdropLibrarySearch')?.addEventListener('input', (e) => {
    backdropLibraryState.query = e.target.value;
    renderBackdropLibraryModal();
  });

  $('#backdropLibraryOkBtn')?.addEventListener('click', acceptBackdropLibrarySelection);

  /* API mínima de fondos para pruebas y para la futura tarea de guardado. */
  (window as any).MBBackdrops = {
    list: () => state.backdrops.slice(),
    active: () => state.activeBackdropId,
    catalog: () => BACKDROP_LIBRARY.map((b) => b.id),
    add: addBackdrop,
    set: setBackdrop,
    render: renderBackdropList
  };

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

    let blocksToShow: any[] = [];
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

  function attachFlyoutDrag(btn: HTMLElement, blk: any) {
    let press: any = null;
    let ghost: any = null;
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
    if (window.MBPythonEditor) {
      MBPythonEditor.setValue(code);
      MBPythonEditor.setPreview(code);
      return;
    }
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
      if (mode === 'python' && window.MBPythonEditor) MBPythonEditor.refresh();
      updatePythonViews();
    });
  });

  $('#codePreviewBtn')?.addEventListener('click', () => {
    const drawer = $('#codePreviewDrawer');
    if (!drawer) return;
    drawer.hidden = !drawer.hidden;
    updatePythonViews();
    if (window.MBPythonEditor) MBPythonEditor.refresh();
  });

  $('#closePreviewBtn')?.addEventListener('click', () => {
    $('#codePreviewDrawer').hidden = true;
  });

  function copyPythonText(btn) {
    const code = (window.MBPythonEditor ? MBPythonEditor.getValue() : $('#pythonTextarea')?.value) || generatePythonCode();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    const orig = btn.textContent;
    btn.textContent = t('copiedCode');
    setTimeout(() => { btn.textContent = t('copyCode', orig); }, 1400);
  }

  $('#copyPythonBtn')?.addEventListener('click', function (this: any) { copyPythonText(this); });
  $('#copyPreviewBtn')?.addEventListener('click', function (this: any) { copyPythonText(this); });
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

  function getEnvChecks() {
    return [
      { label: t('envWebGL'), ok: true, critical: true },
      { label: t('envStorage'), ok: typeof window.localStorage !== 'undefined', critical: true },
      { label: t('envAudio'), ok: Boolean(window.AudioContext || (window as any).webkitAudioContext), critical: true },
      { label: t('envSerial'), ok: 'serial' in navigator },
      { label: t('envBluetooth'), ok: 'bluetooth' in navigator }
    ];
  }

  function updateEnvBadge() {
    const dot = $('#envStatusDot');
    if (!dot) return;
    dot.hidden = !getEnvChecks().some((c) => c.critical && !c.ok);
  }

  function renderEnvCheck() {
    const list = $('#envCheckList');
    if (!list) return;
    const checks = getEnvChecks();
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
      card.querySelector('button')?.addEventListener('click', () => {
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
        if ((e.target as Element)?.closest('.mtarget-delete-btn')) {
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
      card.querySelector('button')?.addEventListener('click', () => {
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
      const flat: any[] = [];
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

  // Settings toggles
  $('#toggleGridDots')?.addEventListener('change', (e) => {
    $('#blocksCanvas')?.classList.toggle('no-grid', !e.target.checked);
  });

  $('#resetPrefsBtn')?.addEventListener('click', () => {
    try {
      localStorage.removeItem('mblock.lang');
      localStorage.removeItem('mblock.privacyAgreed');
      localStorage.removeItem('mblock.lastProject');
    } catch (_) {}
    $('#toggleGridDots').checked = true;
    $('#blocksCanvas')?.classList.remove('no-grid');
    if (window.__I18N_SET) window.__I18N_SET('en');
    closeAllModals();
  });

  /* ===========================
     Initialize
     =========================== */
  const BLOCK_INDEX: Record<string, any> = {};
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
  if (window.MBPythonEditor) {
    MBPythonEditor.mount($('#pythonTextarea'));
    MBPythonEditor.mountPreview($('#codePreviewPre'));
  }
  updateEnvBadge();
  renderDeviceList();
  restoreLastProject();
  renderWorkspaceBlocks();
  updatePythonViews();
  updateDeviceStatusText();
  updateUndoRedoButtons();
  renderSprites();
  renderSpriteList();
  syncSpriteInputs();
  /* Pinta la lista de fondos y aplica el activo (restoreLastProject puede cambiarlo). */
  setBackdrop(state.activeBackdropId);
})();
