#!/usr/bin/env node
'use strict';
// Build/test-time gate: every spell in the standard library must satisfy the
// normalized schema. Missing important metadata is a hard failure - it must
// never be silently treated as "unrestricted".
const path = require('path');
const { loadApp } = require(path.join(__dirname, '..', 'tests', 'load-app.js'));

const A = loadApp();
const library = A.STANDARD_SPELLS || [];
if (!library.length) { console.error('ERROR: STANDARD_SPELLS is empty or unavailable'); process.exit(1); }

const res = A.validateSpellLibrary(library);
const bad = res.problems.filter(p => !p.ok);
const warned = res.problems.filter(p => p.ok && p.warnings.length);

if (warned.length) {
  console.warn(`WARN: ${warned.length} spell(s) with warnings:`);
  for (const p of warned) console.warn(`  ${p.name}: ${p.warnings.join('; ')}`);
}
if (bad.length) {
  console.error(`\nERROR: ${bad.length} of ${library.length} standard spells fail the schema:`);
  for (const p of bad.slice(0, 25)) console.error(`  ${p.name}: ${p.errors.join('; ')}`);
  if (bad.length > 25) console.error(`  ... and ${bad.length - 25} more`);
  process.exit(1);
}
console.log(`OK: all ${library.length} standard spells satisfy the schema${warned.length ? ` (${warned.length} warning(s))` : ''}`);
