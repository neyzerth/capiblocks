#!/usr/bin/env node
/**
 * Servidor estático mínimo para dist/ (solo 127.0.0.1).
 * Uso: node serve.mjs [puerto]   (por defecto 8080)
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), 'dist');
const port = Number(process.argv[2] || process.env.PORT || 8080);

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

if (!fs.existsSync(path.join(root, 'index.html'))) {
  console.error('No hay dist/. Ejecuta primero: node build.mjs');
  process.exit(1);
}

http.createServer((req, res) => {
  const url = decodeURIComponent((req.url || '/').split('?')[0]);
  let file = path.normalize(path.join(root, url));
  if (!file.startsWith(root)) {
    res.writeHead(403).end('Prohibido');
    return;
  }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('No encontrado');
    return;
  }
  res.writeHead(200, { 'Content-Type': mime[path.extname(file).toLowerCase()] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}).listen(port, '127.0.0.1', () => {
  console.log(`capiBlocks en http://localhost:${port}  (Ctrl+C para parar)`);
});
