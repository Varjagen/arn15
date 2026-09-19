#!/usr/bin/env node
'use strict';
// ============================================================================
// One noun per concept (v14.7)
// ----------------------------------------------------------------------------
// The same object was an Entity, a Character, a Token, a Creature and a Preset
// depending which surface you were looking at. This checks the USER-FACING
// strings only - button text, titles and confirm() copy - because the code is
// free to call things whatever it likes internally.
//
// It is deliberately narrow. It flags the specific confusions that existed, not
// every use of a common word, because a gate that cries wolf gets disabled.
// ============================================================================
const fs = require('fs');
const path = require('path');

const SRC = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');

// strings a user reads: title="...", confirm('...'), and plain JSX text
function userStrings() {
  const out = [];
  for (const m of SRC.matchAll(/title="([^"]{3,80})"/g)) out.push(m[1]);
  for (const m of SRC.matchAll(/confirm\('([^']{3,160})'\)/g)) out.push(m[1]);
  for (const m of SRC.matchAll(/>\s*([A-Z][A-Za-z ']{2,40})\s*</g)) out.push(m[1].trim());
  return out;
}

const BANNED = [
  { re: /\bpreset\b/i, ok: /stat block|token preset|quick add/i,
    why: 'the bestiary deals in STAT BLOCKS; "preset" was the old name' },
  { re: /^Delete Entity$/, ok: /$^/,
    why: 'sentence case: "Delete entity"' },
  { re: /^Remove token$/, ok: /$^/,
    why: 'say where: "Remove token from map", so it cannot be read as deleting the entity' },
];

const strings = userStrings();
const problems = [];
for (const s of strings) {
  for (const rule of BANNED) {
    if (rule.re.test(s) && !rule.ok.test(s)) problems.push({ s, why: rule.why });
  }
}

if (problems.length) {
  console.error(`FAIL: ${problems.length} user-facing string(s) drift from the vocabulary.`);
  for (const p of problems) console.error(`  "${p.s}"\n    ${p.why}`);
  console.error('  the four nouns are documented above REQUIREMENT_PURPOSES in app.js');
  process.exit(1);
}
console.log(`OK: vocabulary consistent across ${strings.length} user-facing strings`);
