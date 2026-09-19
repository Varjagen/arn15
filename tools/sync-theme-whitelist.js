#!/usr/bin/env node
'use strict';
// ============================================================================
// The no-FOUC boot whitelist, derived from THEMES (v14.4)
// ----------------------------------------------------------------------------
// index.html's boot script validated the saved theme against a HAND-TYPED list
// of eight ids. `THEMES` in app.js and the `[data-theme]` blocks in styles.css
// both defined twelve. Sketchbook, Charcoal, Accessible Dark and Accessible
// Light were not on the list, so the boot script discarded the saved value and
// painted `dark` until React mounted - a visible flash on every load, on the
// two colourblind-safe palettes whose entire purpose is contrast.
//
// The list is generated now. Run with --check to verify without writing.
// ============================================================================
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const APP = path.join(ROOT, 'app.js');
const HTML = path.join(ROOT, 'index.html');
const MARK = /var valid = \{[^}]*\};/;

function themeIds() {
  const src = fs.readFileSync(APP, 'utf8');
  const m = src.match(/const THEMES = \[([\s\S]*?)\n\];/);
  if (!m) throw new Error('could not find THEMES in app.js');
  const ids = [...m[1].matchAll(/id: '([^']+)'/g)].map(x => x[1]);
  if (!ids.length) throw new Error('THEMES parsed but held no ids');
  return ids;
}

function line(ids) {
  return `var valid = { ${ids.map(id => `${id}: 1`).join(', ')} };`;
}

function main() {
  const check = process.argv.includes('--check');
  const ids = themeIds();
  const html = fs.readFileSync(HTML, 'utf8');
  const found = html.match(MARK);
  if (!found) {
    console.error('FAIL: could not find the boot whitelist in index.html');
    process.exit(1);
  }
  const want = line(ids);
  if (found[0] === want) {
    console.log(`OK: boot whitelist matches THEMES (${ids.length} themes)`);
    return;
  }
  const have = [...found[0].matchAll(/(\w+): 1/g)].map(x => x[1]);
  const missing = ids.filter(id => !have.includes(id));
  const extra = have.filter(id => !ids.includes(id));
  if (check) {
    console.error('FAIL: the boot whitelist disagrees with THEMES.');
    if (missing.length) console.error(`  themes that would FLASH on load: ${missing.join(', ')}`);
    if (extra.length) console.error(`  ids in the whitelist that no longer exist: ${extra.join(', ')}`);
    console.error('  run: node tools/sync-theme-whitelist.js');
    process.exit(1);
  }
  fs.writeFileSync(HTML, html.replace(MARK, want));
  console.log(`OK: boot whitelist regenerated (${ids.length} themes${missing.length ? `, added ${missing.join(', ')}` : ''})`);
}

main();
