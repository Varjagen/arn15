#!/usr/bin/env node
'use strict';
// ============================================================================
// BUILT-IN PRESET ENRICHMENT (v9.75)
// ----------------------------------------------------------------------------
// The 152 built-in presets predate the structured systems: every one carried a
// scalar `speed` and free-text `abilities`, and NONE had `speeds`, a
// `sizeCategory` or a `spellbook`. Their mechanics lived in prose, so a
// creature's fly speed existed only if some runtime path happened to re-parse
// the English at spawn time - and the paths did not agree.
//
// This runs at BUILD time, not at spawn. It reads the prose once, writes
// canonical structured fields into game-data.js, and leaves the descriptive
// text untouched.
//
//   node tools/enrich-presets.js          report what would change
//   node tools/enrich-presets.js --write  apply it
//
// Anything it cannot convert safely is REPORTED, never guessed.
const fs = require('fs');
const path = require('path');
const { loadApp } = require('../tests/load-app.js');

const A = loadApp();
const GAME_DATA = path.join(__dirname, '..', 'game-data.js');

// --- deterministic ids ------------------------------------------------------
// Built-in records must have stable ids: the parser mints random ones, which
// would make every rebuild a diff and every test non-deterministic.
const slug = (s) => String(s || '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 40);
const presetSlug = (id) => slug(String(id).replace(/[:\/]/g, '_'));
const weaponId = (presetId, name) => `wpn_${presetSlug(presetId)}_${slug(name)}`;
const attackId = (presetId, name, i) =>
  `atk_${presetSlug(presetId)}_${slug(name)}${i ? `_${i + 1}` : ''}`;

// --- the manual override layer ---------------------------------------------
// Only for what parsing cannot safely determine. Kept small on purpose: a large
// override table means the parser is being worked around rather than trusted.
const PRESET_ENRICHMENT = require('./preset-overrides.js');

// --- movement ---------------------------------------------------------------
// `deriveSpeeds` is the app's own parser and already understands
// "Speed: Walk 10 ft., Fly 30 ft." - reusing it means the build and any legacy
// runtime path cannot disagree about what the prose meant.
const MOVE_KEYS = new Set(A.MOVE_MODE_IDS.filter(
  k => !['dash', 'teleport', 'forced'].includes(k)).concat('burrow'));

function enrichSpeeds(entity) {
  const derived = A.deriveSpeeds(entity) || {};
  const out = {};
  for (const [k, v] of Object.entries(derived)) {
    if (!MOVE_KEYS.has(k)) continue;
    const n = Number(v);
    if (Number.isFinite(n) && n >= 0) out[k] = n;
  }
  // walk is required; fall back to the legacy scalar
  if (out.walk == null) {
    const n = Number(entity.speed);
    out.walk = Number.isFinite(n) && n >= 0 ? n : 30;
  }
  return out;
}

// --- size -------------------------------------------------------------------
const SIZES = ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'];
function enrichSize(entity) {
  const text = `${entity.abilities || ''}\n${entity.notes || ''}\n${entity.playerDescription || ''}`;
  // an explicit statement only: "Large beast", "Size: Huge". A bare mention of
  // the word elsewhere in the prose is not evidence.
  // The stat blocks carry a tag line: "Flying | Medium | CR 1/4". That is the
  // creature's OWN size, and it is the only form that means so.
  //
  // NB: "Carrying Capacity: 1 Small creature or 75 lbs." also contains a size
  // word and describes what the creature can CARRY - matching it would have
  // labelled a Medium bird as Small. Anchoring on the pipe-delimited tag avoids
  // that whole class of mistake.
  const m = text.match(/\|\s*(Tiny|Small|Medium|Large|Huge|Gargantuan)\s*\|/i)
    || text.match(/\bSize:\s*(Tiny|Small|Medium|Large|Huge|Gargantuan)\b/i)
    || text.match(/\b(Tiny|Small|Medium|Large|Huge|Gargantuan)\s+(?:beast|humanoid|monstrosity|dragon|undead|construct|fey|fiend|giant|ooze|plant|elemental)\b/i);
  if (!m) return null;
  const found = SIZES.find(s => s.toLowerCase() === m[1].toLowerCase());
  return found || null;
}

// --- weapons ----------------------------------------------------------------
const PRESET_BY_NAME = new Map(
  (A.WEAPON_PRESETS || []).map(w => [String(w.name).toLowerCase(), w]));

function enrichWeapons(preset) {
  const e = preset.entity;
  if ((e.weapons || []).length) return null;          // already structured
  if (!e.abilities) return null;
  let parsed;
  try { parsed = A.parseAttacksFromAbilities(e.abilities) || []; }
  catch { return null; }
  if (!parsed.length) return null;

  return parsed.map(w => {
    // a standard weapon by name comes from the SHARED library rather than being
    // reproduced here, so the picker and the presets stay one source of truth
    const std = PRESET_BY_NAME.get(String(w.name).toLowerCase());
    const base = std ? { ...A.weaponFromPreset(std), name: w.name } : w;
    return {
      ...base,
      id: weaponId(preset.id, w.name),
      equipped: true,
      fromPreset: std ? std.name : undefined,
      attacks: (w.attacks || []).map((atk, i) => ({
        ...atk,
        id: attackId(preset.id, w.name, i),
        name: atk.name && atk.name !== 'Attack' ? atk.name : w.name,
      })),
    };
  });
}

// --- spells -----------------------------------------------------------------
const SPELL_BY_NAME = new Map(
  (A.STANDARD_SPELLS || []).map(s => [String(s.name).toLowerCase(), s]));

function enrichSpellbook(presetId, over, report) {
  const names = over?.spells;
  if (!Array.isArray(names) || !names.length) return null;
  const book = [];
  for (const n of names) {
    const sp = SPELL_BY_NAME.get(String(n).toLowerCase());
    if (!sp) { report.missingSpells.add(n); continue; }
    book.push({ ...sp, id: `spl_${presetSlug(presetId)}_${slug(n)}`, prepared: true });
  }
  return book.length ? book : null;
}

// --- the pipeline -----------------------------------------------------------
function enrich(presets) {
  const report = {
    total: presets.length, speeds: 0, altSpeeds: 0, sizes: 0, weapons: 0,
    fromPresetWeapons: 0, spellbooks: 0, overrides: 0,
    missingSpells: new Set(), unconverted: [],
  };
  const out = presets.map(p => {
    const e = { ...p.entity };
    const over = PRESET_ENRICHMENT[p.id] || null;
    if (over) report.overrides++;

    // 1. movement (every preset)
    const speeds = over?.speeds || enrichSpeeds(e);
    e.speeds = speeds;
    e.speed = speeds.walk;            // legacy scalar stays in step
    report.speeds++;
    if (Object.keys(speeds).length > 1) report.altSpeeds++;

    // 2. size
    const size = over?.sizeCategory || enrichSize(e);
    if (size) { e.sizeCategory = size; e.size = size; report.sizes++; }

    // 3. weapons
    const weapons = over?.weapons || enrichWeapons(p);
    if (weapons) {
      e.weapons = weapons;
      report.weapons++;
      if (weapons.some(w => w.fromPreset)) report.fromPresetWeapons++;
    } else if (/Melee Attack|Ranged Attack/i.test(e.abilities || '') && !(e.weapons || []).length) {
      report.unconverted.push({ id: p.id, why: 'attack text the parser could not read' });
    }

    // 4. spellcasting
    const book = enrichSpellbook(p.id, over, report);
    if (book) {
      e.spellbook = book;
      if (over.spellcastingAbility) e.spellcastingAbility = over.spellcastingAbility;
      if (over.class) e.class = over.class;
      if (over.level) e.level = over.level;
      if (over.spellSlots) e.spellSlots = over.spellSlots;
      if (over.pactSlots) e.pactSlots = over.pactSlots;
      report.spellbooks++;
    }

    // 5. secondary structured fields, override-only (never inferred)
    for (const f of ['moveTraits', 'skillBonuses', 'saveBonuses']) {
      if (over?.[f]) e[f] = over[f];
    }
    return { ...p, entity: e };
  });
  return { presets: out, report };
}

// --- rewrite game-data.js ---------------------------------------------------
// The enriched fields are written as a MERGE TABLE appended to the file rather
// than by regenerating 152 literals: the descriptive text stays exactly as it
// was authored, and the diff shows only the mechanics.
function render(enriched) {
  const rows = enriched.map(p => {
    const e = p.entity;
    const keep = {};
    for (const f of ['speeds', 'speed', 'sizeCategory', 'size', 'weapons',
      'spellbook', 'spellcastingAbility', 'class', 'level', 'spellSlots',
      'pactSlots', 'moveTraits', 'skillBonuses', 'saveBonuses']) {
      if (e[f] !== undefined) keep[f] = e[f];
    }
    return `  ${JSON.stringify(p.id)}: ${JSON.stringify(keep)},`;
  });
  return `
// ============================================================================
// GENERATED by tools/enrich-presets.js - DO NOT EDIT BY HAND (v9.75)
// ----------------------------------------------------------------------------
// Structured mechanics for the built-in presets, derived once at build time
// from their stat-block prose. The prose above is unchanged and remains the
// human-readable description; these fields are the authoritative MECHANICS, so
// no runtime path has to re-parse English to spawn a creature.
// Regenerate with: node tools/enrich-presets.js --write
// ============================================================================
var PRESET_MECHANICS = {
${rows.join('\n')}
};
BUILTIN_TOKEN_PRESETS = BUILTIN_TOKEN_PRESETS.map(function (p) {
  var m = PRESET_MECHANICS[p.id];
  return m ? Object.assign({}, p, { entity: Object.assign({}, p.entity, m) }) : p;
});
`;
}

function main() {
  const g = require(GAME_DATA);
  const { presets, report } = enrich(g.BUILTIN_TOKEN_PRESETS);
  const write = process.argv.includes('--write');

  console.log(`presets:            ${report.total}`);
  console.log(`structured movement:${String(report.speeds).padStart(5)}`);
  console.log(`  with alt speeds:  ${String(report.altSpeeds).padStart(5)}`);
  console.log(`structured size:    ${String(report.sizes).padStart(5)}`);
  console.log(`structured weapons: ${String(report.weapons).padStart(5)}`);
  console.log(`  from the library: ${String(report.fromPresetWeapons).padStart(5)}`);
  console.log(`spellbooks:         ${String(report.spellbooks).padStart(5)}`);
  console.log(`manual overrides:   ${String(report.overrides).padStart(5)}`);
  if (report.missingSpells.size) {
    console.log(`\nMISSING from STANDARD_SPELLS (add them before referencing):`);
    for (const n of report.missingSpells) console.log(`  - ${n}`);
  }
  if (report.unconverted.length) {
    console.log(`\nNOT CONVERTED (${report.unconverted.length}) - reported, not guessed:`);
    for (const u of report.unconverted.slice(0, 12)) console.log(`  - ${u.id}: ${u.why}`);
    if (report.unconverted.length > 12) console.log(`  ... and ${report.unconverted.length - 12} more`);
  }

  if (!write) { console.log('\n(dry run - pass --write to apply)'); return; }

  let src = fs.readFileSync(GAME_DATA, 'utf8');
  const MARK = '// GENERATED by tools/enrich-presets.js';
  const at = src.indexOf(MARK);
  if (at >= 0) {
    // replace the previous block, up to the module.exports tail
    const tail = src.indexOf('if (typeof module !==', at);
    src = src.slice(0, src.lastIndexOf('\n// ====', at)) + (tail >= 0 ? src.slice(tail) : '');
  }
  const tail = src.indexOf('if (typeof module !==');
  src = tail >= 0 ? src.slice(0, tail) + render(presets) + '\n' + src.slice(tail)
    : src + render(presets);
  fs.writeFileSync(GAME_DATA, src);
  console.log('\nwritten to game-data.js');
}
main();
