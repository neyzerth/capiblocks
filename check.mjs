#!/usr/bin/env node
/**
 * Verificación del build. Falla (exit 1) si algo esencial no está.
 * Uso: node check.mjs  (después de node build.mjs)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(root, 'dist');
const problems = [];
const ok = (msg) => console.log('OK  ', msg);
const bad = (msg) => { problems.push(msg); console.error('FALLO', msg); };

// 1. Archivos esenciales
const required = [
  'index.html', 'privacy.html', 'style.css', 'script.js', 'i18n.js',
  'blockly-app.js', 'blockly.min.js', 'favicon.svg', 'locales/locales.js'
];
for (const rel of required) {
  if (fs.existsSync(path.join(dist, rel))) ok(`dist/${rel}`);
  else bad(`falta dist/${rel}`);
}
const media = path.join(dist, 'blockly-media');
if (fs.existsSync(media) && fs.readdirSync(media).length >= 10) ok('dist/blockly-media/');
else bad('falta dist/blockly-media/ (media de Blockly)');

// 2. Nada de URLs externas en el sitio (debe funcionar offline / file://)
const sources = ['index.html', 'privacy.html', 'style.css', 'script.js', 'i18n.js', 'blockly-app.js', 'locales/locales.js'];
const allow = /https?:\/\/(www\.)?w3\.org/;
for (const rel of sources) {
  const text = fs.readFileSync(path.join(root, rel), 'utf8');
  const hits = (text.match(/https?:\/\/[^\s"'<>)]+/g) || []).filter((u) => !allow.test(u));
  if (hits.length) bad(`${rel} referencia recurso externo: ${hits.slice(0, 3).join(', ')}`);
}
if (!problems.length) ok('sin recursos externos en el código fuente');

// 3. Lo que referencia index.html existe en dist/
const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const refs = [...html.matchAll(/(?:src|href)="([^"#:]+)"/g)].map((m) => m[1]);
for (const ref of new Set(refs)) {
  if (fs.existsSync(path.join(dist, ref))) ok(`referencia ${ref}`);
  else bad(`index.html referencia ${ref} y no existe en dist/`);
}

// 4. El motor arranca: el hook de Blockly está en el HTML y en blockly-app.js
if (html.includes('blocklyDiv') && html.includes('blockly-app.js')) ok('hook del workspace presente');
else bad('index.html no monta el workspace de Blockly');
if (fs.readFileSync(path.join(root, 'blockly-app.js'), 'utf8').includes('window.MBBlocks')) ok('API window.MBBlocks');
else bad('blockly-app.js no expone window.MBBlocks');

// 5. La marca no vuelve a decir mBlock en texto visible
const visible = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<!--[\s\S]*?-->/g, '');
if (/\bmBlock\b/.test(visible)) bad('index.html todavía muestra la marca mBlock');
else ok('marca capiBlocks');

if (problems.length) {
  console.error(`\n${problems.length} problema(s). Build no listo.`);
  process.exit(1);
}
console.log('\nBuild verificado: capiBlocks está listo.');
