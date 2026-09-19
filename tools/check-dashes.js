#!/usr/bin/env node
'use strict';
// check-dashes.js - no em dashes or en dashes anywhere in the project.
//
// A house style rule, and one worth enforcing mechanically rather than by
// review: these characters are invisible in a diff at a glance, they arrive
// automatically from editors and from pasted prose, and a single one in a
// template literal reaches players through the UI. The spell reference card
// built its damage line as `${dice} \u2014 ${save}`, so every save spell showed
// one on screen.
//
// Both the literal characters and every escaped or entity form are rejected,
// because `\u2014` and `&mdash;` render identically to the reader and a check
// that only caught the literal would push the habit into the escapes.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SELF = path.basename(__filename);

const FORMS = [
  { what: 'em dash', re: /\u2014/g },
  { what: 'en dash', re: /\u2013/g },
  { what: 'escaped em dash', re: /\\u2014/g },
  { what: 'escaped en dash', re: /\\u2013/g },
  { what: '&mdash; entity', re: /&mdash;/g },
  { what: '&ndash; entity', re: /&ndash;/g },
  { what: '&#8212; entity', re: /&#8212;/g },
  { what: '&#8211; entity', re: /&#8211;/g },
];

// v10.8: walk the WHOLE tree rather than a hand-kept list. The first version
// named eight files and two directories, which missed `build.sh` and two
// READMEs - and a list like that is only ever correct on the day it is written.
// Third-party bundles in `vendor/` are excluded because they are not ours to
// edit; everything else we ship or maintain is checked.
const SKIP_DIRS = new Set(['node_modules', '.git', 'vendor']);
const CHECK_EXT = new Set(['.js', '.jsx', '.css', '.html', '.md', '.sh', '.json', '.txt']);
function filesToCheck(dir = ROOT, rel = '') {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const relPath = rel ? `${rel}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      out.push(...filesToCheck(path.join(dir, entry.name), relPath));
      continue;
    }
    if (entry.name === SELF) continue;               // this file names them on purpose
    if (!CHECK_EXT.has(path.extname(entry.name))) continue;
    out.push(relPath);
  }
  return out;
}

const hits = [];
for (const rel of filesToCheck()) {
  const text = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  const lines = text.split('\n');
  for (const { what, re } of FORMS) {
    lines.forEach((line, i) => {
      re.lastIndex = 0;
      if (re.test(line)) {
        hits.push({ rel, line: i + 1, what, text: line.trim().slice(0, 90) });
      }
    });
  }
}

if (hits.length) {
  console.error(`FAIL: ${hits.length} dash(es) found. Use a hyphen "-" instead.\n`);
  for (const h of hits.slice(0, 40)) {
    console.error(`  ${h.rel}:${h.line}  ${h.what}\n      ${h.text}`);
  }
  if (hits.length > 40) console.error(`  ... and ${hits.length - 40} more`);
  process.exit(1);
}
console.log('OK: no em or en dashes');
