#!/usr/bin/env node
'use strict';
// check-design-tokens.js - the stylesheet must theme, and it must be legible.
//
// Two rules, both learned from drift that had already happened:
//
// 1. NO PALETTE LITERALS. Newer combat, dock, workflow and mobile rules hard
//    coded the DARK theme's gold (#c9a34a, and rgba(201,163,74,...)). A literal
//    cannot be recoloured, so the other 11 themes only half applied - the
//    surfaces a player looks at most stayed gold whatever they picked.
//    Semantic tokens (--accent, --critical, --warning ...) are derived per
//    theme, so a rule that uses them themes for free.
//
// 2. NO TINY FAINT TEXT. 81 rules set type below 10px and 85 combined type
//    under 12px with opacity under 0.75. Either alone is a choice; together
//    they are unreadable on a projector, a tablet or any light theme.
//
// The check is on styles.css only. Inline styles in app.js are a separate and
// larger problem, recorded in CONTRACT rather than enforced here.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CSS = fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf8');

// Everything above the type scale is the token DEFINITIONS: literals are the
// point there. Everything below is rules, which must use the tokens.
const defsEnd = CSS.indexOf('--fs-micro');
const bodyStart = defsEnd > 0 ? CSS.indexOf('\n', defsEnd) : 0;
const body = CSS.slice(bodyStart);
const lineOf = (idx) => CSS.slice(0, bodyStart + idx).split('\n').length;

const problems = [];

// --- 1. palette literals ----------------------------------------------------
const BANNED = [
  [/#c9a34a/gi, '#c9a34a', 'var(--accent)'],
  [/#d9b45a/gi, '#d9b45a', 'var(--accent)'],
  [/#f0c98a/gi, '#f0c98a', 'var(--accent-strong)'],
  [/rgba\(201, ?163, ?74/gi, 'rgba gold', 'color-mix(in srgb, var(--accent) N%, transparent)'],
];
for (const [re, name, fix] of BANNED) {
  let m;
  re.lastIndex = 0;
  while ((m = re.exec(body)) !== null) {
    problems.push(`styles.css:${lineOf(m.index)}  hardcoded ${name} - use ${fix}`);
  }
}

// --- 2. font sizes come from the scale --------------------------------------
// 723 declarations carried 44 distinct values. They are rungs now. Display type
// above 24px stays literal: a hero number is bespoke by nature and a scale that
// tried to cover it would stop being small.
const FS_TOKENS = new Set(
  [...CSS.matchAll(/(--fs-[\w-]+):/g)].map((m) => m[1]));
for (const m of body.matchAll(/font-size:\s*([0-9.]+)(px|rem)/g)) {
  const px = parseFloat(m[1]) * (m[2] === 'px' ? 1 : 16);
  if (px > 24) continue;
  problems.push(`styles.css:${lineOf(m.index)}  font-size: ${m[1]}${m[2]} is a literal - use a --fs-* rung`);
}
for (const m of body.matchAll(/font-size:\s*var\((--fs-[\w-]+)\)/g)) {
  if (!FS_TOKENS.has(m[1])) {
    problems.push(`styles.css:${lineOf(m.index)}  ${m[1]} is not a defined rung`);
  }
}

// --- 3. tiny and faint ------------------------------------------------------
for (const m of body.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
  const decls = m[2];
  const lit = decls.match(/font-size:\s*([0-9.]+)(px|rem)/);
  const tok = decls.match(/font-size:\s*var\((--fs-[\w-]+)\)/);
  if (!lit && !tok) continue;
  // a rung has to be resolved back to pixels before it can be judged
  const px = lit
    ? parseFloat(lit[1]) * (lit[2] === 'px' ? 1 : 16)
    : (() => {
      const d = CSS.match(new RegExp(`${tok[1]}:\\s*([0-9.]+)rem`));
      return d ? parseFloat(d[1]) * 16 : 16;
    })();
  const sel = m[1].trim().replace(/\s+/g, ' ').slice(0, 48);
  const line = lineOf(m.index);
  if (px < 10) {
    problems.push(`styles.css:${line}  ${sel} is ${px}px - nothing readable goes below 10px (var(--fs-micro))`);
  }
  const om = decls.match(/opacity:\s*([0-9.]+)/);
  if (px < 12 && om && parseFloat(om[1]) < 0.75) {
    problems.push(`styles.css:${line}  ${sel} is ${px}px at opacity ${om[1]} - tiny AND faint`);
  }
}

if (problems.length) {
  console.error(`FAIL: ${problems.length} design-token problem(s).\n`);
  for (const p of problems.slice(0, 30)) console.error(`  ${p}`);
  if (problems.length > 30) console.error(`  ... and ${problems.length - 30} more`);
  process.exit(1);
}
console.log('OK: palette and type both come from tokens');
