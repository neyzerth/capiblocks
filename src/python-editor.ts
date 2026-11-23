/* Editor ligero de Python (CodeMirror 5, MIT) para capiBlocks.
   - Resaltado de sintaxis, números de línea, Tab = 4 espacios, Shift+Tab = menos sangría.
   - Se usa tanto en la pestaña Python (editable) como en el panel de vista previa (solo lectura). */
(function () {
  const CodeMirror: any = window.CodeMirror;
  if (!CodeMirror) return;

  let main: any = null;
  let preview: any = null;

  const base = {
    mode: 'python',
    lineNumbers: true,
    indentUnit: 4,
    tabSize: 4,
    indentWithTabs: false,
    lineWrapping: false,
    autoCloseBrackets: true,
    matchBrackets: true,
    extraKeys: {
      Tab: (cm) => cm.replaceSelection('    '),
      'Shift-Tab': (cm) => cm.execCommand('indentLess'),
      'Ctrl-/': (cm) => cm.execCommand('toggleComment')
    }
  };

  window.MBPythonEditor = {
/** Monta el editor editable sobre el textarea de la pestaña Python. */
    mount(textarea) {
      if (main || !textarea) return false;
      main = CodeMirror.fromTextArea(textarea, Object.assign({}, base, {
        readOnly: false,
        styleActiveLine: true
      }));
      return true;
    },

/** Monta una instancia de solo lectura para el panel de vista previa. */
    mountPreview(el) {
      if (preview || !el) return false;
      preview = CodeMirror(el, Object.assign({}, base, {
        readOnly: true,
        cursorBlinkRate: -1
      }));
      return true;
    },

/** Reemplaza el código del editor principal. */
    setValue(value) {
      if (main && main.getValue() !== value) main.setValue(value);
    },

/** Código actual del editor (o del textarea si no hay CodeMirror). */
    getValue() {
      if (main) return main.getValue();
      const ta = document.getElementById('pythonTextarea') as HTMLTextAreaElement | null;
      return ta ? ta.value : '';
    },

/** Actualiza el código del panel de vista previa. */
    setPreview(value) {
      if (preview && preview.getValue() !== value) preview.setValue(value);
    },

/** Recalcula el layout (llamar al mostrar el contenedor). */
    refresh() {
      if (main) setTimeout(() => main.refresh(), 0);
      if (preview) setTimeout(() => preview.refresh(), 0);
    },

/** Enfoca el editor. */
    focus() {
      if (main) main.focus();
    }
  };
})();
