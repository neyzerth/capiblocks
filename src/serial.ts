/* Conexión real al hardware: Web Serial + REPL crudo de MicroPython.
   window.MBSerial — ver docs/ARQUITECTURA.md. Sin Web Serial (Safari, móvil,
   Firefox viejo) available() es false y la UI se degrada con un aviso.

   El módulo no conoce la UI: recibe `onLine`/`onStatus` al conectar y expone
   operaciones que devuelven promesas. Todas las esperas de respuesta usan el
   mismo búfer, así que no pueden solaparse (waitFor lo rechaza). */
(function () {
  /** Tiempo máximo por defecto que se espera una respuesta de la placa. */
  const REPLY_TIMEOUT_MS = 15000;
  /** Bytes de código fuente que viajan en cada `exec` de la subida. */
  const UPLOAD_CHUNK = 768;
  /** Tiempo máximo por chunk durante la subida (la placa escribe a flash). */
  const UPLOAD_TIMEOUT_MS = 8000;

  /** Resultado de `replRun`. */
  interface ReplResult {
    /** El código se envió y la placa lo aceptó. */
    ok: boolean;
    /** Salida del programa hasta que terminó (vacía si sigue corriendo). */
    output: string;
    /** true si el programa finito terminó; false si quedó en ejecución. */
    finished: boolean;
  }

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
  /** Líneas recogidas mientras se mide la salida de un programa Live. */
  let capture: string[] | null = null;

  /** Notifica el estado de la conexión ('connecting' | 'connected' | 'disconnected'). */
  function fireStatus(s: string) {
    if (statusHandler) statusHandler(s);
  }

  /** Entrega una línea de salida de la placa a quien escuche la consola. */
  function fireLine(line: string) {
    if (capture) capture.push(line);
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

  /** Codifica bytes en base64 con btoa (disponible con target es2020). */
  function base64FromBytes(slice: Uint8Array): string {
    let bin = '';
    for (let i = 0; i < slice.length; i++) bin += String.fromCharCode(slice[i]);
    return btoa(bin);
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

  /**
   * Live: ejecuta el código por REPL crudo (no se guarda en la placa).
   * `finished` es false cuando el programa sigue corriendo (p. ej. `while True`)
   * y por eso no llegó el fin de ejecución; en ese caso NO se sale del REPL
   * crudo para que su salida siga llegando a la consola.
   */
  async function replRun(code: string): Promise<ReplResult> {
    if (!port || !writer) throw new Error('serial no conectado');
    await interrupt();
    await writeText('\r\n');
    await interrupt();
    await enterRaw();
    try {
      await writeText(code);
      await writeBytes(new Uint8Array([4])); // EOT: acepta el código
      await waitFor('OK', 3000); // la placa responde OK antes de ejecutar
    } catch (err) {
      // Si no aceptó el código, no dejar el REPL en modo crudo.
      try {
        await exitRaw();
      } catch (_) {}
      throw err;
    }
    let out = '';
    try {
      out = await waitFor('\x04>', 2500); // término = el programa finito terminó
    } catch (_) {
      return { ok: true, output: '', finished: false }; // while True: sigue corriendo
    }
    await exitRaw();
    const clean = out.replace('OK', '').replace(/\x04/g, '').replace(/\r/g, '').trim();
    return { ok: true, output: clean, finished: true };
  }

  /**
   * Upload: escribe `main.py` por chunks base64 y reinicia la placa (Ctrl-D).
   * El primer chunk abre el archivo ('wb') y los siguientes lo añaden ('ab');
   * cada chunk es un `exec` crudo independiente que espera `\x04>`.
   * Resuelve `true` cuando la placa se reinició y rechaza si un chunk falla.
   */
  async function uploadMainPy(code: string): Promise<boolean> {
    if (!port || !writer) throw new Error('serial no conectado');
    await interrupt();
    await interrupt();
    await enterRaw();
    try {
      const bytes = new TextEncoder().encode(code);
      for (let i = 0; i < bytes.length || i === 0; i += UPLOAD_CHUNK) {
        const slice = bytes.subarray(i, i + UPLOAD_CHUNK);
        const b64 = base64FromBytes(slice);
        // ubinascii viene en el firmware oficial: sin dependencias en la placa.
        const exec =
          i === 0
            ? "import ubinascii\nwith open('main.py','wb') as _f: _f.write(ubinascii.a2b_base64('" +
              b64 +
              "'))\n"
            : "with open('main.py','ab') as _f: _f.write(ubinascii.a2b_base64('" +
              b64 +
              "'))\n";
        await writeText(exec);
        await writeBytes(new Uint8Array([4]));
        await waitFor('\x04>', UPLOAD_TIMEOUT_MS);
      }
      await exitRaw();
    } catch (err) {
      // Nunca dejar la placa atrapada en el REPL crudo tras un fallo.
      try {
        await exitRaw();
      } catch (_) {}
      throw err;
    }
    await writeText('\x04'); // Ctrl-D: soft reset → corre main.py
    try {
      await waitFor('>>>', 3000);
    } catch (_) {
      // El reinicio puede tardar más que la espera: no es un fallo de subida.
    }
    return true;
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
    writeLine,
    /** Live: ejecuta el código por REPL crudo. */
    replRun,
    /** Upload: escribe main.py y reinicia la placa. */
    uploadMainPy
  };
})();
