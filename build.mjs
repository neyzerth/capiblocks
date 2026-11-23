#!/usr/bin/env node
/**
 * Build capiBlocks: compila TypeScript (esbuild) y copia el sitio + los motores
 * vendorizados a dist/. Requiere `pnpm install` una vez (esbuild/TypeScript son
 * dependencias de desarrollo; el sitio servido no tiene dependencias).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build as esbuild } from 'esbuild';

const root = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(root, 'dist');
const vendor = path.join(root, 'vendor', 'blockly');

const siteFiles = ['index.html', 'style.css', 'privacy.html', 'favicon.ico', 'favicon.svg'];

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

for (const rel of siteFiles) {
  fs.copyFileSync(path.join(root, rel), path.join(out, rel));
  console.log('copiado', rel);
}

// App completa (locales + i18n + motor + editor + UI) y bundle solo de i18n para privacy.html
await esbuild({
  entryPoints: [path.join(root, 'src', 'app.ts')],
  bundle: true,
  format: 'iife',
  target: ['es2020'],
  outfile: path.join(out, 'app.js'),
  logLevel: 'warning'
});
console.log('compilado app.js');

await esbuild({
  entryPoints: [path.join(root, 'src', 'i18n-entry.ts')],
  bundle: true,
  format: 'iife',
  target: ['es2020'],
  outfile: path.join(out, 'i18n.js'),
  logLevel: 'warning'
});
console.log('compilado i18n.js');

fs.copyFileSync(path.join(vendor, 'blockly.min.js'), path.join(out, 'blockly.min.js'));
console.log('copiado blockly.min.js (vendor/blockly)');

fs.cpSync(path.join(vendor, 'media'), path.join(out, 'blockly-media'), { recursive: true });
fs.copyFileSync(path.join(vendor, 'LICENSE'), path.join(out, 'blockly-media', 'LICENSE'));
console.log('copiado blockly-media');

// CodeMirror (vendor/codemirror) con nombres planos
const cmVendor = path.join(root, 'vendor', 'codemirror');
const cmFiles = [
  ['codemirror.js', 'codemirror.js'],
  ['codemirror.css', 'codemirror.css'],
  ['python.js', 'codemirror-python.js'],
  ['closebrackets.js', 'codemirror-closebrackets.js'],
  ['matchbrackets.js', 'codemirror-matchbrackets.js']
];
for (const [from, to] of cmFiles) {
  fs.copyFileSync(path.join(cmVendor, from), path.join(out, to));
  console.log('copiado', to);
}

for (const page of ['index.html', 'privacy.html']) {
  if (!fs.existsSync(path.join(out, page))) throw new Error(`falta ${page} en dist/`);
}

console.log('build listo en', out);
