#!/usr/bin/env node
'use strict';
// One-off: enrich every STANDARD_SPELLS record in game-data.js with accurate
// NON-EFFECT metadata for the normalized schema (v8.72). Effect mechanics are
// untouched; spells needing bespoke resolution get a documented
// customResolution key only (mechanics land in prompts 25-29).
const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '..', 'game-data.js');

// name -> metadata. V/S/M, ritual, classes, casting time, target shape, sight.
const M = (verbal, somatic, material, desc = '', extra = {}) => ({
  verbal, somatic, material, materialDesc: desc, materialItem: null, goldCost: 0, consumed: false, ...extra,
});
const A = { type: 'action', amount: 1, unit: 'action', trigger: '' };
const BONUS = { type: 'bonus', amount: 1, unit: 'bonus action', trigger: '' };
const META = {
  'Fire Bolt':        { school: 'Evocation', classes: ['Sorcerer', 'Wizard'], subclasses: ['Arcane Trickster', 'Eldritch Knight'], castingTime: A, targetType: 'creature', requiresSight: true, components: M(true, true, false), ritual: false },
  'Ray of Frost':     { school: 'Evocation', classes: ['Sorcerer', 'Wizard'], subclasses: ['Arcane Trickster', 'Eldritch Knight'], castingTime: A, targetType: 'creature', requiresSight: true, components: M(true, true, false), ritual: false },
  'Shocking Grasp':   { school: 'Evocation', classes: ['Sorcerer', 'Wizard'], subclasses: ['Arcane Trickster', 'Eldritch Knight'], castingTime: A, targetType: 'creature', requiresSight: true, components: M(true, true, false), ritual: false },
  'Sacred Flame':     { school: 'Evocation', classes: ['Cleric'], subclasses: [], castingTime: A, targetType: 'creature', requiresSight: true, components: M(true, true, false), ritual: false },
  'Toll the Dead':    { school: 'Necromancy', classes: ['Cleric', 'Warlock', 'Wizard'], subclasses: [], castingTime: A, targetType: 'creature', requiresSight: true, components: M(true, true, false), ritual: false, customResolution: 'toll-the-dead' },
  'Vicious Mockery':  { school: 'Enchantment', classes: ['Bard'], subclasses: [], castingTime: A, targetType: 'creature', requiresSight: true, components: M(true, false, false), ritual: false },
  'Eldritch Blast':   { school: 'Evocation', classes: ['Warlock'], subclasses: [], castingTime: A, targetType: 'creature', requiresSight: true, components: M(true, true, false), ritual: false, customResolution: 'eldritch-blast' },
  'Poison Spray':     { school: 'Conjuration', classes: ['Artificer', 'Druid', 'Sorcerer', 'Warlock', 'Wizard'], subclasses: [], castingTime: A, targetType: 'creature', requiresSight: true, components: M(true, true, false), ritual: false },
  'Create Bonfire':   { school: 'Conjuration', classes: ['Artificer', 'Druid', 'Sorcerer', 'Warlock', 'Wizard'], subclasses: [], castingTime: A, targetType: 'point', requiresSight: true, components: M(true, true, false), ritual: false },
  'Produce Flame':    { school: 'Conjuration', classes: ['Druid'], subclasses: [], castingTime: A, targetType: 'self', requiresSight: false, components: M(true, true, false), ritual: false, customResolution: 'produce-flame' },

  'Magic Missile':    { school: 'Evocation', classes: ['Sorcerer', 'Wizard'], subclasses: [], castingTime: A, targetType: 'creature', requiresSight: true, components: M(true, true, false), ritual: false, customResolution: 'magic-missile', scaling: { targetsPerSlot: 1 } },
  'Burning Hands':    { school: 'Evocation', classes: ['Sorcerer', 'Wizard'], subclasses: [], castingTime: A, targetType: 'area', requiresSight: false, components: M(true, true, false), ritual: false, scaling: { damagePerSlot: { count: 1, sides: 6 } } },
  'Thunderwave':      { school: 'Evocation', classes: ['Bard', 'Druid', 'Sorcerer', 'Wizard'], subclasses: [], castingTime: A, targetType: 'area', requiresSight: false, components: M(true, true, false), ritual: false, scaling: { damagePerSlot: { count: 1, sides: 8 } } },
  'Chromatic Orb':    { school: 'Evocation', classes: ['Sorcerer', 'Wizard'], subclasses: [], castingTime: A, targetType: 'creature', requiresSight: true, components: M(true, true, true, 'a diamond worth at least 50 gp', { goldCost: 50, consumed: false, materialItem: { key: 'diamond', value: 50, qty: 1 } }), ritual: false, scaling: { damagePerSlot: { count: 1, sides: 8 } } },
  'Guiding Bolt':     { school: 'Evocation', classes: ['Cleric'], subclasses: [], castingTime: A, targetType: 'creature', requiresSight: true, components: M(true, true, false), ritual: false, scaling: { damagePerSlot: { count: 1, sides: 6 } } },
  'Inflict Wounds':   { school: 'Necromancy', classes: ['Cleric'], subclasses: [], castingTime: A, targetType: 'creature', requiresSight: true, components: M(true, true, false), ritual: false, scaling: { damagePerSlot: { count: 1, sides: 10 } } },
  'Cure Wounds':      { school: 'Evocation', classes: ['Artificer', 'Bard', 'Cleric', 'Druid', 'Paladin', 'Ranger'], subclasses: [], castingTime: A, targetType: 'creature', requiresSight: false, components: M(true, true, false), ritual: false, scaling: { healPerSlot: { count: 1, sides: 8 } } },
  'Healing Word':     { school: 'Evocation', classes: ['Bard', 'Cleric', 'Druid'], subclasses: [], castingTime: BONUS, targetType: 'creature', requiresSight: true, components: M(true, false, false), ritual: false, scaling: { healPerSlot: { count: 1, sides: 4 } } },
  'Bless':            { school: 'Enchantment', classes: ['Cleric', 'Paladin'], subclasses: [], castingTime: A, targetType: 'creature', requiresSight: false, components: M(true, true, true, 'a sprinkling of holy water'), ritual: false, scaling: { targetsPerSlot: 1 } },
  'Bane':             { school: 'Enchantment', classes: ['Bard', 'Cleric'], subclasses: [], castingTime: A, targetType: 'creature', requiresSight: true, components: M(true, true, true, 'a drop of blood'), ritual: false, scaling: { targetsPerSlot: 1 } },
  'Faerie Fire':      { school: 'Evocation', classes: ['Artificer', 'Bard', 'Druid'], subclasses: [], castingTime: A, targetType: 'area', requiresSight: false, components: M(true, false, false), ritual: false },
  'Sleep':            { school: 'Enchantment', classes: ['Bard', 'Sorcerer', 'Wizard'], subclasses: [], castingTime: A, targetType: 'area', requiresSight: false, components: M(true, true, true, 'a pinch of fine sand, rose petals, or a cricket'), ritual: false, customResolution: 'sleep' },
  'Witch Bolt':       { school: 'Evocation', classes: ['Sorcerer', 'Warlock', 'Wizard'], subclasses: [], castingTime: A, targetType: 'creature', requiresSight: true, components: M(true, true, true, 'a twig from a tree struck by lightning'), ritual: false, customResolution: 'witch-bolt' },

  'Scorching Ray':    { school: 'Evocation', classes: ['Sorcerer', 'Wizard'], subclasses: [], castingTime: A, targetType: 'creature', requiresSight: true, components: M(true, true, false), ritual: false, customResolution: 'scorching-ray', scaling: { targetsPerSlot: 1 } },
  'Shatter':          { school: 'Evocation', classes: ['Bard', 'Sorcerer', 'Warlock', 'Wizard'], subclasses: [], castingTime: A, targetType: 'area', requiresSight: true, components: M(true, true, true, 'a chip of mica'), ritual: false, scaling: { damagePerSlot: { count: 1, sides: 8 } } },
  'Hold Person':      { school: 'Enchantment', classes: ['Bard', 'Cleric', 'Druid', 'Sorcerer', 'Warlock', 'Wizard'], subclasses: [], castingTime: A, targetType: 'creature', requiresSight: true, components: M(true, true, true, 'a small, straight piece of iron'), ritual: false, scaling: { targetsPerSlot: 1 } },
  'Moonbeam':         { school: 'Evocation', classes: ['Druid'], subclasses: [], castingTime: A, targetType: 'area', requiresSight: true, components: M(true, true, true, 'several seeds of any moonseed plant and a piece of opalescent feldspar'), ritual: false, customResolution: 'moonbeam', scaling: { damagePerSlot: { count: 1, sides: 10 } } },
  'Web':              { school: 'Conjuration', classes: ['Artificer', 'Sorcerer', 'Wizard'], subclasses: [], castingTime: A, targetType: 'area', requiresSight: true, components: M(true, true, true, 'a bit of spiderweb'), ritual: false },
  'Aid':              { school: 'Abjuration', classes: ['Artificer', 'Cleric', 'Paladin'], subclasses: [], castingTime: A, targetType: 'creature', requiresSight: false, components: M(true, true, true, 'a tiny strip of white cloth'), ritual: false, scaling: { healPerSlot: { count: 5, sides: 1 } } },

  'Fireball':         { school: 'Evocation', classes: ['Sorcerer', 'Wizard'], subclasses: [], castingTime: A, targetType: 'area', requiresSight: true, components: M(true, true, true, 'a tiny ball of bat guano and sulfur'), ritual: false, scaling: { damagePerSlot: { count: 1, sides: 6 } } },
  'Lightning Bolt':   { school: 'Evocation', classes: ['Sorcerer', 'Wizard'], subclasses: [], castingTime: A, targetType: 'area', requiresSight: false, components: M(true, true, true, 'a bit of fur and a rod of amber, crystal, or glass'), ritual: false, scaling: { damagePerSlot: { count: 1, sides: 6 } } },
  'Spirit Guardians': { school: 'Conjuration', classes: ['Cleric'], subclasses: [], castingTime: A, targetType: 'area', requiresSight: false, components: M(true, true, true, 'a holy symbol'), ritual: false, scaling: { damagePerSlot: { count: 1, sides: 8 } }, effectSchedule: { trigger: 'enterArea', oncePerTurn: true } },
  'Vampiric Touch':   { school: 'Necromancy', classes: ['Sorcerer', 'Warlock', 'Wizard'], subclasses: [], castingTime: A, targetType: 'creature', requiresSight: true, components: M(true, true, false), ritual: false, scaling: { damagePerSlot: { count: 1, sides: 6 } } },
  'Mass Healing Word': { school: 'Evocation', classes: ['Bard', 'Cleric'], subclasses: [], castingTime: BONUS, targetType: 'creature', requiresSight: true, components: M(true, false, false), ritual: false, scaling: { healPerSlot: { count: 1, sides: 4 } } },

  'Wall of Fire':     { school: 'Evocation', classes: ['Druid', 'Sorcerer', 'Wizard'], subclasses: [], castingTime: A, targetType: 'area', requiresSight: true, components: M(true, true, true, 'a small piece of phosphorus'), ritual: false, customResolution: 'wall-of-fire', scaling: { damagePerSlot: { count: 1, sides: 8 } } },
  'Ice Storm':        { school: 'Evocation', classes: ['Druid', 'Sorcerer', 'Wizard'], subclasses: [], castingTime: A, targetType: 'area', requiresSight: true, components: M(true, true, true, 'a pinch of dust and a few drops of water'), ritual: false, scaling: { damagePerSlot: { count: 1, sides: 8 } } },
  'Blight':           { school: 'Necromancy', classes: ['Druid', 'Sorcerer', 'Warlock', 'Wizard'], subclasses: [], castingTime: A, targetType: 'creature', requiresSight: true, components: M(true, true, false), ritual: false, scaling: { damagePerSlot: { count: 1, sides: 8 } } },

  'Cone of Cold':     { school: 'Evocation', classes: ['Sorcerer', 'Wizard'], subclasses: [], castingTime: A, targetType: 'area', requiresSight: false, components: M(true, true, true, 'a small crystal or glass cone'), ritual: false, scaling: { damagePerSlot: { count: 1, sides: 8 } } },
  'Flame Strike':     { school: 'Evocation', classes: ['Cleric'], subclasses: [], castingTime: A, targetType: 'area', requiresSight: true, components: M(true, true, true, 'pinch of sulfur'), ritual: false, scaling: { damagePerSlot: { count: 1, sides: 6 } } },
  'Cloudkill':        { school: 'Conjuration', classes: ['Sorcerer', 'Wizard'], subclasses: [], castingTime: A, targetType: 'area', requiresSight: true, components: M(true, true, false), ritual: false, customResolution: 'cloudkill', scaling: { damagePerSlot: { count: 1, sides: 8 } } },
  'Mass Cure Wounds': { school: 'Evocation', classes: ['Bard', 'Cleric', 'Druid'], subclasses: [], castingTime: A, targetType: 'area', requiresSight: true, components: M(true, true, false), ritual: false, scaling: { healPerSlot: { count: 1, sides: 8 } } },

  'Chain Lightning':  { school: 'Evocation', classes: ['Sorcerer', 'Wizard'], subclasses: [], castingTime: A, targetType: 'creature', requiresSight: true, components: M(true, true, true, 'a bit of fur, a piece of amber, glass, or a crystal rod, and three silver pins'), ritual: false, customResolution: 'chain-lightning', scaling: { targetsPerSlot: 1 } },
  'Disintegrate':     { school: 'Transmutation', classes: ['Sorcerer', 'Wizard'], subclasses: [], castingTime: A, targetType: 'creature', requiresSight: true, components: M(true, true, true, 'a lodestone and a pinch of dust'), ritual: false, scaling: { damagePerSlot: { count: 3, sides: 6 } } },

  'Finger of Death':  { school: 'Necromancy', classes: ['Sorcerer', 'Warlock', 'Wizard'], subclasses: [], castingTime: A, targetType: 'creature', requiresSight: true, components: M(true, true, false), ritual: false },
  'Delayed Blast Fireball': { school: 'Evocation', classes: ['Sorcerer', 'Wizard'], subclasses: [], castingTime: A, targetType: 'area', requiresSight: true, components: M(true, true, true, 'a tiny ball of bat guano and sulfur'), ritual: false, customResolution: 'delayed-blast-fireball', scaling: { damagePerSlot: { count: 1, sides: 6 } } },
};

const src = fs.readFileSync(FILE, 'utf8');
const start = src.indexOf('var STANDARD_SPELLS = [');
if (start < 0) { console.error('STANDARD_SPELLS not found'); process.exit(1); }
const open = src.indexOf('[', start);
let depth = 0, end = -1;
for (let i = open; i < src.length; i++) {
  if (src[i] === '[') depth++;
  else if (src[i] === ']') { depth--; if (depth === 0) { end = i; break; } }
}
if (end < 0) { console.error('could not find end of STANDARD_SPELLS'); process.exit(1); }

const listSrc = src.slice(open, end + 1);
const list = eval(listSrc); // trusted local data file
let enriched = 0, missing = [];
const out = list.map((s) => {
  const meta = META[s.name];
  if (!meta) { missing.push(s.name); return s; }
  enriched++;
  return {
    ...s,
    schemaVersion: 2,
    rulesVersion: '2014',
    school: meta.school || s.school,
    classes: meta.classes,
    subclasses: meta.subclasses,
    castingTime: meta.castingTime,
    reactionTrigger: '',
    targetType: meta.targetType,
    targets: Number(s.targets) || 1,
    requiresSight: meta.requiresSight,
    requiresLineOfEffect: true,
    components: meta.components,
    ritual: meta.ritual,
    concentration: !!s.concentration,
    ...(meta.scaling ? { scaling: meta.scaling } : {}),
    ...(meta.customResolution ? { customResolution: meta.customResolution } : {}),
    ...(meta.effectSchedule ? { effectSchedule: meta.effectSchedule } : {}),
  };
});

const json = JSON.stringify(out, null, 2)
  .replace(/^/gm, '')
  .replace(/"([A-Za-z_][A-Za-z0-9_]*)":/g, '$1:');
const next = src.slice(0, open) + json + src.slice(end + 1);
fs.writeFileSync(FILE, next);
console.log(`enriched ${enriched} spells; missing metadata for: ${missing.length ? missing.join(', ') : 'none'}`);
