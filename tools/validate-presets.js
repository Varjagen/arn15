#!/usr/bin/env node
'use strict';
// ============================================================================
// BUILT-IN PRESET VALIDATION (v9.75)
// ----------------------------------------------------------------------------
// Fails the build when built-in preset data violates the modern schema, so an
// enrichment bug or a hand-edit cannot ship silently. Runs in `pretest`
// alongside the spell schema check.
const path = require('path');
const { loadApp } = require('../tests/load-app.js');

const A = loadApp();
const g = require(path.join(__dirname, '..', 'game-data.js'));
const presets = g.BUILTIN_TOKEN_PRESETS || [];

const MOVE_KEYS = new Set(['walk', 'climb', 'swim', 'fly', 'burrow', 'crawl', 'jump']);
const SIZES = new Set(['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan']);
const ABILITIES = new Set(['str', 'dex', 'con', 'int', 'wis', 'cha']);
const SKILLS = new Set(A.SKILL_NAMES || []);
const SPELL_NAMES = new Set((A.STANDARD_SPELLS || []).map(s => s.name));

const errors = [];
const fail = (id, msg) => errors.push(`${id}: ${msg}`);
const finite = (v) => typeof v === 'number' && Number.isFinite(v);

const seenPresetIds = new Set();

for (const p of presets) {
  const id = p.id || '(no id)';
  const e = p.entity || {};

  // --- general -------------------------------------------------------------
  if (!p.id) fail(id, 'preset has no id');
  if (seenPresetIds.has(p.id)) fail(id, 'duplicate preset id');
  seenPresetIds.add(p.id);

  // --- movement ------------------------------------------------------------
  if (!e.speeds || typeof e.speeds !== 'object') {
    fail(id, 'no structured `speeds`');
  } else {
    if (!finite(e.speeds.walk)) fail(id, 'no valid walk speed');
    for (const [k, v] of Object.entries(e.speeds)) {
      if (!MOVE_KEYS.has(k)) fail(id, `unsupported movement key "${k}"`);
      if (!finite(v)) fail(id, `speed "${k}" is not a finite number (${v})`);
      else if (v < 0) fail(id, `speed "${k}" is negative`);
    }
    // the legacy scalar must not drift from the structured value
    if (e.speed !== undefined && e.speed !== e.speeds.walk) {
      fail(id, `legacy speed ${e.speed} !== speeds.walk ${e.speeds.walk}`);
    }
  }

  // --- size ----------------------------------------------------------------
  if (e.sizeCategory !== undefined && !SIZES.has(e.sizeCategory)) {
    fail(id, `invalid sizeCategory "${e.sizeCategory}"`);
  }

  // --- weapons -------------------------------------------------------------
  const wIds = new Set();
  const aIds = new Set();
  for (const w of (e.weapons || [])) {
    if (!w.id) fail(id, 'a weapon has no id');
    else if (wIds.has(w.id)) fail(id, `duplicate weapon id "${w.id}"`);
    wIds.add(w.id);
    if (!w.name) fail(id, `weapon "${w.id}" has no name`);
    if (typeof w.equipped !== 'boolean') fail(id, `weapon "${w.id}" has no equipped state`);
    for (const atk of (w.attacks || [])) {
      if (!atk.id) fail(id, `an attack on "${w.id}" has no id`);
      else if (aIds.has(atk.id)) fail(id, `duplicate attack id "${atk.id}"`);
      aIds.add(atk.id);
      const hasMethod = finite(atk.toHit) || atk.save || atk.saveAbility;
      if (!hasMethod) fail(id, `attack "${atk.id}" has neither a to-hit nor a save`);
      if (atk.range !== undefined && !finite(atk.range)) {
        fail(id, `attack "${atk.id}" has a non-finite range`);
      }
      for (const d of (atk.damage || [])) {
        for (const f of ['count', 'sides', 'modifier']) {
          if (d[f] !== undefined && !finite(d[f])) {
            fail(id, `attack "${atk.id}" damage.${f} is not finite`);
          }
        }
        if (!d.type) fail(id, `attack "${atk.id}" damage has no type`);
      }
    }
  }

  // --- spells --------------------------------------------------------------
  const sIds = new Set();
  for (const sp of (e.spellbook || [])) {
    if (!sp.id) fail(id, `spell "${sp.name}" has no id`);
    else if (sIds.has(sp.id)) fail(id, `duplicate spell id "${sp.id}"`);
    sIds.add(sp.id);
    if (!sp.name) fail(id, 'a spell has no name');
    else if (!SPELL_NAMES.has(sp.name)) {
      fail(id, `spell "${sp.name}" does not resolve to STANDARD_SPELLS`);
    }
    if (!finite(Number(sp.level))) fail(id, `spell "${sp.name}" has no valid level`);
  }
  if ((e.spellbook || []).length && e.spellcastingAbility
      && !ABILITIES.has(String(e.spellcastingAbility).toLowerCase())) {
    fail(id, `invalid spellcastingAbility "${e.spellcastingAbility}"`);
  }
  for (const [lvl, n] of Object.entries(e.spellSlots || {})) {
    if (!finite(Number(n)) || Number(n) < 0) fail(id, `spell slot level ${lvl} is invalid`);
  }

  // --- secondary structured fields ----------------------------------------
  for (const [k, v] of Object.entries(e.skillBonuses || {})) {
    if (SKILLS.size && !SKILLS.has(k)) fail(id, `unknown skill "${k}"`);
    if (!finite(Number(v))) fail(id, `skill bonus "${k}" is not a number`);
  }
  for (const [k, v] of Object.entries(e.saveBonuses || {})) {
    if (!ABILITIES.has(String(k).toLowerCase())) fail(id, `unknown save key "${k}"`);
    if (!finite(Number(v))) fail(id, `save bonus "${k}" is not a number`);
  }

  // --- no NaN anywhere in the structured mechanics -------------------------
  const scan = (v, at) => {
    if (typeof v === 'number' && Number.isNaN(v)) fail(id, `NaN at ${at}`);
    else if (Array.isArray(v)) v.forEach((x, i) => scan(x, `${at}[${i}]`));
    else if (v && typeof v === 'object') {
      for (const [k, x] of Object.entries(v)) scan(x, `${at}.${k}`);
    }
  };
  for (const f of ['speeds', 'weapons', 'spellbook', 'skillBonuses', 'saveBonuses']) {
    if (e[f] !== undefined) scan(e[f], f);
  }
}

if (errors.length) {
  console.error(`FAILED: ${errors.length} preset schema violation(s):`);
  for (const e of errors.slice(0, 40)) console.error(`  ${e}`);
  if (errors.length > 40) console.error(`  ... and ${errors.length - 40} more`);
  process.exit(1);
}
console.log(`OK: all ${presets.length} built-in presets satisfy the modern schema`);
