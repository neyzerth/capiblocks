#!/usr/bin/env node
/**
 * Modo desarrollo: construye, sirve dist/ y recarga el navegador al guardar.
 * Uso: node dev.mjs [puerto] [--no-open]      (por defecto 8080)
 * Sin dependencias: SSE + fs.watch.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(root, 'dist');
const port = Number(process.argv.find((a) => /^\d+$/.test(a)) || process.env.PORT || 8080);
const shouldOpen = !process.argv.includes('--no-open');

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.mp3': 'audio/mpeg',
  '.cur': 'image/x-icon',
  '.gif': 'image/gif'
};

const RELOAD_SNIPPET = `<script>
(() => {
  const es = new EventSource('/__reload');
  es.onmessage = () => location.reload();
  es.onerror = () => setTimeout(() => location.reload(), 800);
})();
</script>`;

function build() {
  const r = spawnSync(process.execPath, [path.join(root, 'build.mjs')], { stdio: 'inherit' });
  if (r.status !== 0) console.error('\n[dev] build falló; sigo sirviendo la última versión buena.');
}

console.log('[dev] build inicial');
build();

const clients = new Set();
const server = http.createServer((req, res) => {
  const url = decodeURIComponent((req.url || '/').split('?')[0]);

  if (url === '/__reload') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    });
    res.write('retry: 1000\n\n');
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }

  let file = path.normalize(path.join(dist, url));
  if (!file.startsWith(dist)) {
    res.writeHead(403).end('Prohibido');
    return;
  }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('No encontrado');
    return;
  }

  const ext = path.extname(file).toLowerCase();
  if (ext === '.html') {
    const html = fs.readFileSync(file, 'utf8').replace('</body>', `${RELOAD_SNIPPET}\n</body>`);
    res.writeHead(200, { 'Content-Type': mime['.html'], 'Cache-Control': 'no-store' });
    res.end(html);
    return;
  }

  res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(file).pipe(res);
});

server.listen(port, '127.0.0.1', () => {
  const url = `http://localhost:${port}`;
  console.log(`[dev] capiBlocks en ${url}  (Ctrl+C para parar)`);
  if (shouldOpen) {
    const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'explorer' : 'xdg-open';
    spawn(cmd, [url], { detached: true, stdio: 'ignore' }).on('error', () => {}).unref();
  }
});

// Vigila el código fuente (no dist/ ni docs/)
const watchFiles = ['index.html', 'style.css', 'privacy.html', 'build.mjs', 'tsconfig.json'];
const watchDirs = ['src', 'vendor'];

let timer = null;
function schedule(reason) {
  clearTimeout(timer);
  timer = setTimeout(() => {
    console.log(`[dev] cambio en ${reason}; reconstruyendo`);
    build();
    for (const res of clients) res.write('data: reload\n\n');
  }, 120);
}

for (const rel of watchFiles) {
  const abs = path.join(root, rel);
  if (fs.existsSync(abs)) fs.watch(abs, () => schedule(rel));
}
for (const rel of watchDirs) {
  const abs = path.join(root, rel);
  if (fs.existsSync(abs)) fs.watch(abs, { recursive: true }, () => schedule(rel));
}
