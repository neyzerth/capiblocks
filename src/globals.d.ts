export {};

declare global {
  const MBBlocks: any;
  const MBPythonEditor: any;

  interface Window {
    __I18N_DICTS?: Record<string, Record<string, string>>;
    __I18N_LANG?: string;
    __I18N_DICT?: Record<string, string>;
    __I18N_APPLY?: () => void;
    __I18N_SET?: (lang: string) => boolean;
    t?: (key: string, fallback?: string) => string;
    /** Motor de bloques vendorizado (Blockly) — tipado laxo a propósito. */
    Blockly: any;
    /** Editor vendorizado (CodeMirror 5). */
    CodeMirror: any;
    MBBlocks?: any;
    MBPythonEditor?: any;
  }
}

/* Globals de la app (se asignan en runtime sobre window). */
declare const MBBlocks: any;
declare const MBPythonEditor: any;
