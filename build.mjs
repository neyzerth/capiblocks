#!/usr/bin/env node
/**
 * Build capiBlocks: copia el sitio y el motor Blockly (vendorizado) a dist/.
 * Sin dependencias: solo Node 18+.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(root, 'dist');
const vendor = path.join(root, 'vendor', 'blockly');

const siteFiles = [
  'index.html',
  'style.css',
  'script.js',
  'privacy.html',
  'i18n.js',
  'favicon.ico',
  'favicon.svg',
  'blockly-app.js'
];

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

for (const rel of siteFiles) {
  fs.copyFileSync(path.join(root, rel), path.join(out, rel));
  console.log('copiado', rel);
}

fs.cpSync(path.join(root, 'locales'), path.join(out, 'locales'), { recursive: true });
console.log('copiado locales');

fs.copyFileSync(path.join(vendor, 'blockly.min.js'), path.join(out, 'blockly.min.js'));
console.log('copiado blockly.min.js (vendor/blockly)');

fs.cpSync(path.join(vendor, 'media'), path.join(out, 'blockly-media'), { recursive: true });
fs.copyFileSync(path.join(vendor, 'LICENSE'), path.join(out, 'blockly-media', 'LICENSE'));
console.log('copiado blockly-media');

for (const page of ['index.html', 'privacy.html']) {
  if (!fs.existsSync(path.join(out, page))) throw new Error(`falta ${page} en dist/`);
}

console.log('build listo en', out);
