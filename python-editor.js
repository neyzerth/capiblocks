/* Editor ligero de Python (CodeMirror 5, MIT) para capiBlocks.
   - Resaltado de sintaxis, números de línea, Tab = 4 espacios, Shift+Tab = menos sangría.
   - Se usa tanto en la pestaña Python (editable) como en el panel de vista previa (solo lectura). */
(function () {
  if (!window.CodeMirror) return;

  let main = null;
  let preview = null;

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
    mount(textarea) {
      if (main || !textarea) return false;
      main = CodeMirror.fromTextArea(textarea, Object.assign({}, base, {
        readOnly: false,
        styleActiveLine: true
      }));
      return true;
    },

    mountPreview(el) {
      if (preview || !el) return false;
      preview = CodeMirror(el, Object.assign({}, base, {
        readOnly: true,
        cursorBlinkRate: -1
      }));
      return true;
    },

    setValue(value) {
      if (main && main.getValue() !== value) main.setValue(value);
    },

    getValue() {
      if (main) return main.getValue();
      const ta = document.getElementById('pythonTextarea');
      return ta ? ta.value : '';
    },

    setPreview(value) {
      if (preview && preview.getValue() !== value) preview.setValue(value);
    },

    refresh() {
      if (main) setTimeout(() => main.refresh(), 0);
      if (preview) setTimeout(() => preview.refresh(), 0);
    },

    focus() {
      if (main) main.focus();
    }
  };
})();
