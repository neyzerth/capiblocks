/* Conexión real al hardware: Web Serial + REPL crudo de MicroPython.
   window.MBSerial — ver docs/ARQUITECTURA.md. Sin Web Serial (Safari, móvil,
   Firefox viejo) available() es false y la UI se degrada con un aviso.

   El módulo no conoce la UI: recibe `onLine`/`onStatus` al conectar y expone
   operaciones que devuelven promesas. Todas las esperas de respuesta usan el
   mismo búfer, así que no pueden solaparse (waitFor lo rechaza). */
(function () {
  /** Tiempo máximo por defecto que se espera una respuesta de la placa. */
  const REPLY_TIMEOUT_MS = 15000;

  let port: any = null;
  let reader: any = null;
  let writer: any = null;
  let running = false;

  let buffer = '';
  let waitNeedle: string | null = null;
  let waitResolve: ((s: string) => void) | null = null;
  let waitTimer: any = null;
  let lineHandler: ((line: string) => void) | null = null;
  let statusHandler: ((s: string) => void) | null = null;

  /** Notifica el estado de la conexión ('connecting' | 'connected' | 'disconnected'). */
  function fireStatus(s: string) {
    if (statusHandler) statusHandler(s);
  }

  /** Entrega una línea de salida de la placa a quien escuche la consola. */
  function fireLine(line: string) {
    if (lineHandler) lineHandler(line);
  }

  /** Cancela la espera pendiente (sin resolver la promesa asociada). */
  function clearWait() {
    waitNeedle = null;
    waitResolve = null;
    if (waitTimer) clearTimeout(waitTimer);
    waitTimer = null;
  }

  /**
   * Procesa texto recién leído del puerto: resuelve la espera pendiente si el
   * patrón ya está en el búfer y emite las líneas completas a `onLine`.
   */
  function feed(text: string) {
    buffer += text;
    if (waitNeedle !== null) {
      const i = buffer.indexOf(waitNeedle);
      if (i !== -1) {
        const before = buffer.slice(0, i);
        buffer = buffer.slice(i + waitNeedle.length);
        const resolve = waitResolve!;
        clearWait();
        resolve(before);
      }
    }
    let nl: number;
    while ((nl = buffer.indexOf('\n')) !== -1) {
      const line = buffer.slice(0, nl).replace(/\r$/, '');
      buffer = buffer.slice(nl + 1);
      if (line.trim()) fireLine(line);
    }
  }

  /**
   * Espera hasta que el texto recibido contenga `needle` y resuelve con lo que
   * llegó antes del patrón. Rechaza si ya hay otra espera en curso o si vence
   * el plazo (la placa no respondió).
   */
  function waitFor(needle: string, timeoutMs = REPLY_TIMEOUT_MS): Promise<string> {
    if (waitNeedle !== null) {
      return Promise.reject(new Error('ya hay una espera de respuesta en curso'));
    }
    return new Promise((resolve, reject) => {
      waitNeedle = needle;
      waitResolve = resolve;
      waitTimer = setTimeout(() => {
        clearWait();
        reject(new Error('timeout esperando ' + JSON.stringify(needle)));
      }, timeoutMs);
      feed(''); // el patrón puede estar ya en el búfer
    });
  }

  /** Bucle de lectura del puerto: decodifica UTF-8 y alimenta el búfer. */
  async function readLoop() {
    const decoder = new TextDecoder();
    try {
      reader = port.readable.getReader();
    } catch (_) {
      return;
    }
    while (running) {
      const { value, done } = await reader.read().catch(() => ({ value: undefined, done: true }));
      if (done || value === undefined) break;
      feed(decoder.decode(value as Uint8Array, { stream: true }));
    }
    try {
      reader.releaseLock();
    } catch (_) {}
    reader = null;
    // El puerto se cerró o se desconectó el cable: la UI debe enterarse.
    if (running) {
      running = false;
      clearWait();
      try {
        if (writer) writer.releaseLock();
      } catch (_) {}
      writer = null;
      try {
        if (port) await port.close();
      } catch (_) {}
      port = null;
      fireStatus('disconnected');
    }
  }

  /** Escribe bytes en el puerto; falla claro si no hay conexión. */
  function writeBytes(data: Uint8Array): Promise<void> {
    if (!port || !writer) return Promise.reject(new Error('serial no conectado'));
    return writer.write(data);
  }

  /** Escribe texto UTF-8 en el puerto. */
  function writeText(s: string): Promise<void> {
    return writeBytes(new TextEncoder().encode(s));
  }

  /**
   * Abre el puerto elegido por el usuario (Web Serial) y arranca la lectura.
   * Resuelve `true` si queda conectado; rechaza con un mensaje legible si el
   * navegador no soporta Web Serial o si el usuario cancela el diálogo.
   */
  async function connect(opts: any = {}) {
    lineHandler = opts.onLine || null;
    statusHandler = opts.onStatus || null;
    if (port) return true;
    if (!('serial' in navigator)) {
      throw new Error('Web Serial no disponible en este navegador');
    }
    fireStatus('connecting');
    try {
      port = await (navigator as any).serial.requestPort(); // sin filtros: el usuario elige el puerto
      await port.open({ baudRate: opts.baudRate || 115200 });
      writer = port.writable.getWriter();
    } catch (err) {
      try {
        if (port) await port.close();
      } catch (_) {}
      port = null;
      writer = null;
      fireStatus('disconnected');
      throw err;
    }
    running = true;
    buffer = '';
    readLoop();
    fireStatus('connected');
    return true;
  }

  /** Cierra el puerto y deja el módulo listo para una nueva conexión. */
  async function disconnect() {
    running = false;
    clearWait();
    try {
      if (writer) writer.releaseLock();
    } catch (_) {}
    writer = null;
    try {
      if (reader) reader.cancel();
    } catch (_) {}
    reader = null;
    try {
      if (port) await port.close();
    } catch (_) {}
    port = null;
    buffer = '';
    fireStatus('disconnected');
  }

  /** Detiene el programa en ejecución (Ctrl-C). */
  async function interrupt() {
    await writeBytes(new Uint8Array([3]));
  }

  /** Envía una línea a la consola (input del usuario). */
  async function writeLine(s: string) {
    await writeText(s + '\r\n');
  }

  /** Entra en el REPL crudo de MicroPython (Ctrl-A) y espera su prompt. */
  async function enterRaw() {
    await writeBytes(new Uint8Array([1]));
    await waitFor('>');
  }

  /** Sale del REPL crudo (Ctrl-B) y vuelve al REPL amigable. */
  async function exitRaw() {
    await writeBytes(new Uint8Array([2]));
  }

  window.MBSerial = {
    /** ¿El navegador expone Web Serial? */
    available() {
      return 'serial' in navigator;
    },
    /** ¿Hay un puerto abierto ahora mismo? */
    isConnected() {
      return !!port;
    },
    connect,
    disconnect,
    interrupt,
    writeLine
    /* replRun y uploadMainPy llegan en T10 */
  };
})();
