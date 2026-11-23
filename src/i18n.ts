/**
 * i18n mínimo: diccionarios en window.__I18N_DICTS, traducción por data-t y
 * cambio de idioma con evento `i18n:change`.
 */
(() => {
  const DICTS: Record<string, Record<string, string>> = window.__I18N_DICTS || {};
  const SUPPORTED = Object.keys(DICTS).length ? Object.keys(DICTS) : ['en'];

  function detectInitialLang(): string {
    const params = new URLSearchParams(window.location.search);
    const paramLang = (params.get('lang') || '').toLowerCase().slice(0, 2);
    if (SUPPORTED.includes(paramLang)) return paramLang;
    try {
      const saved = (localStorage.getItem('mblock.lang') || '').toLowerCase().slice(0, 2);
      if (SUPPORTED.includes(saved)) return saved;
    } catch (_) {}
    const navLangs = (navigator.languages && navigator.languages.length
      ? navigator.languages
      : [navigator.language || '']).map((l) => l.toLowerCase().slice(0, 2));
    for (const lang of navLangs) {
      if (SUPPORTED.includes(lang)) return lang;
    }
    return SUPPORTED.includes('en') ? 'en' : SUPPORTED[0];
  }

  let currentLang = detectInitialLang();
  let currentDict: Record<string, string> = DICTS[currentLang] || DICTS.en || {};

  /** Traduce una clave; cae al inglés y luego al fallback. */
  function t(key: string, fallback?: string): string {
    if (Object.prototype.hasOwnProperty.call(currentDict, key)) {
      return currentDict[key];
    }
    if (DICTS.en && Object.prototype.hasOwnProperty.call(DICTS.en, key)) {
      return DICTS.en[key];
    }
    return fallback !== undefined ? fallback : key;
  }

  function apply(): void {
    document.documentElement.lang = currentLang;

    const titleKey = document.body && document.body.classList.contains('privacy-page')
      ? 'privacyPageTitle'
      : 'pageTitle';
    document.title = t(titleKey, document.title);

    document.querySelectorAll('[data-t]').forEach((el) => {
      const key = el.getAttribute('data-t');
      if (key) el.textContent = t(key);
    });

    document.querySelectorAll('[data-t-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-t-placeholder');
      if (key) el.setAttribute('placeholder', t(key));
    });

    document.querySelectorAll('[data-t-title]').forEach((el) => {
      const key = el.getAttribute('data-t-title');
      if (key) el.setAttribute('title', t(key));
    });

    document.querySelectorAll('[data-t-aria]').forEach((el) => {
      const key = el.getAttribute('data-t-aria');
      if (key) el.setAttribute('aria-label', t(key));
    });

    document.querySelectorAll('[data-lang-choice]').forEach((el) => {
      const code = el.getAttribute('data-lang-choice');
      const isSelected = code === currentLang;
      el.classList.toggle('active', isSelected);
      el.setAttribute('aria-checked', isSelected ? 'true' : 'false');
    });

    const settingsSelect = document.getElementById('settingsLangSelect') as HTMLSelectElement | null;
    if (settingsSelect) settingsSelect.value = currentLang;

    const projectInput = document.getElementById('projectInput') as HTMLInputElement | null;
    if (projectInput && projectInput.dataset.userEdited !== 'true') {
      projectInput.value = t('untitled');
    }
  }

  function setLang(langCode: string): boolean {
    const code = (langCode || '').toLowerCase().slice(0, 2);
    if (!SUPPORTED.includes(code)) return false;
    currentLang = code;
    currentDict = DICTS[code];
    try {
      localStorage.setItem('mblock.lang', code);
    } catch (_) {}
    window.__I18N_LANG = currentLang;
    window.__I18N_DICT = currentDict;
    apply();
    window.dispatchEvent(new CustomEvent('i18n:change', { detail: { lang: currentLang } }));
    return true;
  }

  window.__I18N_LANG = currentLang;
  window.__I18N_DICT = currentDict;
  window.t = t;
  window.__I18N_APPLY = apply;
  window.__I18N_SET = setLang;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
  }
})();
