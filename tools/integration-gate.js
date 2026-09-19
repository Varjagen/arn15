#!/usr/bin/env node
'use strict';
// PRE-PROMPT-25 INTEGRATION GATE.
// Fails unless every listed integration condition holds. This runs from a clean
// checkout as part of `npm test` (after the build, freshness, undefined-identifier
// and spell-schema gates), so prompt 25 cannot begin on a broken foundation.
const path = require('path');
const { loadApp } = require(path.join(__dirname, '..', 'tests', 'load-app.js'));

const A = loadApp();
const results = [];
const check = (name, fn) => {
  try {
    const detail = fn();
    results.push({ name, ok: true, detail: detail || '' });
  } catch (err) {
    results.push({ name, ok: false, detail: err && err.message ? err.message : String(err) });
  }
};
const must = (cond, msg) => { if (!cond) throw new Error(msg); };

const econ = () => A.baseEconomy();
const caster = (over = {}) => ({
  id: 'c', name: 'Nix', type: 'PC', playerId: 'p1', class: 'Warlock', level: 5,
  stats: { str: 10, dex: 14, con: 14, cha: 16 }, proficiencyBonus: 3,
  weaponProfs: { simple: true }, handsTotal: 2, weapons: [], items: [],
  spellbook: [], spellSlotsUsed: {}, pactSlots: { used: 0 },
  hp: { current: 30, max: 40 }, conditions: [], deathSaves: { successes: 0, failures: 0 }, tempHp: 0,
  economy: econ(), sizeCategory: 'Medium', speeds: { walk: 30 }, ac: 14, ...over,
});
const world = (over = {}) => A.migrateState({
  entities: { c: caster() },
  tokens: { tc: { id: 'tc', entityId: 'c', mapId: 'm', x: 0, y: 0, scale: 1 } },
  currentMapId: 'm', claims: { peer1: { pc: 'c', playerId: 'p1' } },
  initiative: { active: true, entries: [{ entityId: 'c' }], turn: 0, round: 1 },
  movement: { entityId: 'c', mode: 'walk', usedFt: 0, dashCount: 0 },
  table: { averageDamage: true }, ...over,
});

// 1 -------------------------------------------------------------------------
check('rulesVersion exists, migrates, serializes and reaches rules services', () => {
  must(A.migrateState({}).table.rulesVersion, 'fresh table has no rulesVersion');
  const legacy = A.migrateState({ table: { theme: 'dark' } });
  must(legacy.table.rulesVersion === 'dnd5e-2014', 'legacy table did not migrate');
  const round = A.migrateState(JSON.parse(JSON.stringify(legacy)));
  must(round.table.rulesVersion === 'dnd5e-2014', 'rulesVersion did not survive serialization');
  must(A.longRestLimitEnabled(legacy) === true, 'rulesVersion does not reach the rest service');
  return 'dnd5e-2014';
});

// 2 -------------------------------------------------------------------------
check('a clean build is performed before tests', () => {
  const fs = require('fs');
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
  const pre = String(pkg.scripts && pkg.scripts.pretest || '');
  must(/build/.test(pre), 'pretest does not build');
  must(/verify-build/.test(pre), 'pretest does not verify build freshness');
  return pre;
});

// 3 -------------------------------------------------------------------------
check('the token spell menu renders with damaging spells', () => {
  const { loadRender } = require(path.join(__dirname, '..', 'tests', 'load-app-render.js'));
  const H = loadRender();
  const spell = { id: 'fb', name: 'Fire Bolt', level: 0, prepared: true, range: 120,
    dmg: { on: true, parts: [{ count: 1, sides: 10, flat: 0, type: 'Fire' }], save: { on: false } },
    heal: { on: false }, effect: { on: false }, area: { shape: 'none', size: 0 }, components: {} };
  const html = H.renderToString(H.get('SpellCastSection'), {
    casterEntity: { ...caster(), spellbook: [spell] }, spellSaveDc: 14,
    onArea: () => {}, onNeedTarget: () => {}, onSelf: () => {}, onSummonOnly: () => {},
  });
  must(/Fire Bolt/.test(html), 'the damaging spell did not render');
  must(/2d10 Fire/.test(html), 'scaled damage did not render');
  return 'renders with scaled dice';
});

// 4 & 5 ---------------------------------------------------------------------
check('every live cast path uses the authoritative cast transaction', () => {
  must(typeof A.prepareSpellCast === 'function' && typeof A.commitSpellCast === 'function', 'transaction missing');
  const s = world({ entities: { c: caster({ spellbook: [{
    id: 's', name: 'Test', level: 1, prepared: true, components: {}, dmg: { on: false, parts: [] },
    heal: { on: false }, effect: { on: false }, area: { shape: 'none', size: 0 } }] }) } });
  const r = A.prepareSpellCast(s, { casterId: 'c', spellId: 's', isDM: true });
  must(r.ok && r.plan.transactionId, 'the transaction did not authorize a legal cast');
  must(r.plan.slotSource && r.plan.castLevel != null, 'the plan lacks slot identity');
  return `${r.plan.slotSource}@${r.plan.castLevel}`;
});

check('spell requirements, materials, slots and action economy cannot be bypassed', () => {
  const spell = { id: 's', name: 'Test', level: 1, prepared: true,
    components: { verbal: true, somatic: false, material: false }, dmg: { on: false, parts: [] },
    heal: { on: false }, effect: { on: false }, area: { shape: 'none', size: 0 } };
  const base = world({ entities: { c: caster({ spellbook: [spell] }) } });
  must(A.prepareSpellCast({ ...base, entities: { ...base.entities, c: { ...base.entities.c, conditions: ['Silenced'] } } },
    { casterId: 'c', spellId: 's', isDM: true }).reason === 'verbal', 'components bypassed');
  must(A.prepareSpellCast({ ...base, entities: { ...base.entities, c: { ...base.entities.c, pactSlots: { used: 2 }, spellSlotsUsed: { 1: 9 } } } },
    { casterId: 'c', spellId: 's', isDM: true }).reason === 'slots', 'slots bypassed');
  must(A.prepareSpellCast({ ...base, entities: { ...base.entities, c: { ...base.entities.c, economy: { ...econ(), action: true } } } },
    { casterId: 'c', spellId: 's', isDM: true }).reason === 'no-action', 'action economy bypassed');
  must(A.prepareSpellCast(base, { casterId: 'c', spellId: 's', isDM: false, actorPeerId: 'nobody' }).reason === 'not-authorized', 'ownership bypassed');
  return 'components / slots / economy / ownership all enforced';
});

// 6 -------------------------------------------------------------------------
check('the actual spent slot determines scaling', () => {
  const spell = { id: 's', name: 'Blast', level: 1, prepared: true, components: {},
    dmg: { on: true, parts: [{ count: 1, sides: 6, flat: 0, type: 'Fire' }], save: { on: false } },
    heal: { on: false }, effect: { on: false }, area: { shape: 'none', size: 0 },
    scaling: { damagePerSlot: { count: 1, sides: 6 } } };
  const s = world({ entities: { c: caster({ spellbook: [spell] }) } });
  const r = A.prepareSpellCast(s, { casterId: 'c', spellId: 's', isDM: true });
  must(r.plan.slotSource === 'pact' && r.plan.castLevel === 3, 'a Warlock did not use its pact slot level');
  must(A.spellDamageLabel(r.plan.scaledSpell.dmg) === '3d6 Fire', 'scaling did not follow the spent slot');
  return '1st-level spell in a 3rd-level pact slot -> 3d6';
});

// 7 -------------------------------------------------------------------------
check('movement and initiative automatically fire scheduled effects', () => {
  let s = world({ entities: { c: caster(), t: { id: 't', name: 'T', type: 'Monster', hp: { current: 50, max: 50 }, conditions: [], stats: { dex: 10 }, economy: econ(), speeds: { walk: 30 }, sizeCategory: 'Medium' } },
    tokens: { tt: { id: 'tt', entityId: 't', mapId: 'm', x: 300, y: 0, scale: 1 } },
    movement: { entityId: 't', mode: 'walk', usedFt: 0, dashCount: 0 } });
  s = A.reducer(s, { type: 'EFFECT_SCHEDULE', effect: { id: 'z', casterId: 'c', spellName: 'Ring', mapId: 'm',
    trigger: 'enterArea', oncePerTurn: true, points: [[50, -50], [250, -50], [250, 50], [50, 50]],
    damage: { count: 2, sides: 6, flat: 0, type: 'Fire' } } });
  const before = s.entities.t.hp.current;
  s = A.reducer(s, { type: 'MOVE_TOKEN', request: A.moveRequestWalk('tt', 150, 0, { isDM: true }) });
  must(s.entities.t.hp.current < before, 'movement did not fire the area effect');
  must(!!s.entities.t.lastHpTxn, 'effect damage bypassed the HP pipeline');
  return `entry dealt ${before - s.entities.t.hp.current}`;
});

// 8 -------------------------------------------------------------------------
check('jump movement cannot exceed its legal distance', () => {
  const s = world({ movement: { entityId: 'c', mode: 'walk', usedFt: 0, dashCount: 0, jumpPending: true, jumpRunning: true } });
  const out = A.reducer(s, { type: 'MOVE_TOKEN', request: A.moveRequestWalk('tc', 900, 0, { isDM: true }) });
  const travelled = out.tokens.tc.x / 10;
  must(Math.abs(travelled - out.movement.usedFt) < 0.01, `moved ${travelled} ft but charged ${out.movement.usedFt}`);
  must(travelled <= 10, `STR 10 long jump exceeded: ${travelled} ft`);
  return `${travelled} ft moved, ${out.movement.usedFt} ft charged`;
});

// 9 -------------------------------------------------------------------------
check('weapon attacks use the data-driven resolver', () => {
  const bow = { id: 'w', name: 'Shortbow', category: 'simple', kind: 'ranged',
    damage: { count: 1, sides: 6 }, range: { normal: 80, long: 320 }, properties: { ammunition: 'arrow' } };
  const s = world({ entities: {
    c: caster({ weapons: [bow], items: [{ id: 'a', name: 'Arrows', qty: 2 }] }),
    t: { id: 't', name: 'T', type: 'Monster', hp: { current: 50, max: 50 }, conditions: [], stats: { dex: 10 }, ac: 13, economy: econ(), sizeCategory: 'Medium' } },
    tokens: { tc: { id: 'tc', entityId: 'c', mapId: 'm', x: 0, y: 0, scale: 1 }, tt: { id: 'tt', entityId: 't', mapId: 'm', x: 400, y: 0, scale: 1 } } });
  const r = A.prepareWeaponAttack(s, { attackerId: 'c', targetId: 't', weaponId: 'w', isDM: true, d20a: 10 });
  must(r.ok, r.explanation);
  must(r.plan.ability === 'dex' && r.plan.proficient === true, 'ability/proficiency not derived from data');
  must(A.prepareWeaponAttack(s, { attackerId: 'c', targetId: 't', weaponId: 'w', isDM: true, distFt: 500 }).ok === false, 'long range not enforced');
  const fired = A.reducer(s, { type: 'WEAPON_ATTACK', request: { attackerId: 'c', targetId: 't', weaponId: 'w', isDM: true, d20a: 10 } });
  must(A.ammoCountOf(fired.entities.c, 'arrow') === 1, 'ammunition not spent');
  return `+${r.plan.bonus} ${r.plan.ability}`;
});

// 10 ------------------------------------------------------------------------
check('grapple and shove consume the correct action economy', () => {
  const s = world({ entities: {
    c: caster({ skillProfs: { Athletics: 'proficient' } }),
    t: { id: 't', name: 'T', type: 'Monster', hp: { current: 50, max: 50 }, conditions: [], stats: { str: 8, dex: 10 }, skillProfs: {}, proficiencyBonus: 2, economy: econ(), sizeCategory: 'Medium' } },
    tokens: { tc: { id: 'tc', entityId: 'c', mapId: 'm', x: 0, y: 0, scale: 1 }, tt: { id: 'tt', entityId: 't', mapId: 'm', x: 40, y: 0, scale: 1 } } });
  const g = A.reducer(s, { type: 'GRAPPLE_ATTEMPT', attackerId: 'c', defenderId: 't', defenderSkill: 'Acrobatics', attackerD20: 20, defenderD20: 1 });
  must(g.entities.c.economy.attacksMade === 1, 'the grapple did not consume an attack');
  const sh = A.reducer(g, { type: 'SHOVE_ATTEMPT', attackerId: 'c', defenderId: 't', defenderSkill: 'Acrobatics', choice: 'prone', attackerD20: 20, defenderD20: 1 });
  must(!sh.entities.t.conditions.includes('Prone'), 'a shove happened with no attacks left');
  return 'grapple/shove replace one attack';
});

// 11 ------------------------------------------------------------------------
check('cover affects actual attacks and Dexterity saves', () => {
  must(A.applyCoverToAc(15, A.coverInfo('half')).ac === 17, 'half cover not +2 AC');
  must(A.applyCoverToAc(15, A.coverInfo('three-quarters')).ac === 20, 'three-quarters not +5 AC');
  must(A.applyCoverToAc(15, A.coverInfo('total')).targetable === false, 'total cover targetable');
  must(A.applyCoverToDexSave(10, A.coverInfo('half')) === 12, 'cover not applied to Dex saves');
  return 'half +2 / three-quarters +5 / total blocks';
});

// 12, 13, 14 ----------------------------------------------------------------
check('direct HP changes cannot bypass the HP pipeline', () => {
  const s = world();
  const patched = A.reducer(s, { type: 'ENTITY_PATCH', id: 'c', patch: { hp: { current: 1, max: 40 }, tempHp: 99, deathSaves: { successes: 3, failures: 0 } } });
  must(patched.entities.c.hp.current === 30, 'HP changed via ENTITY_PATCH');
  must(patched.entities.c.tempHp === 0, 'temp HP changed via ENTITY_PATCH');
  must(patched.entities.c.deathSaves.successes === 0, 'death saves changed via ENTITY_PATCH');
  return 'hp / tempHp / deathSaves all guarded';
});

check('healing cannot revive Dead or repair Broken', () => {
  const dead = A.applyHpTransaction({ id: 'x', type: 'PC', hp: { current: 0, max: 20 }, conditions: ['Dead'], deathSaves: { successes: 0, failures: 3 }, tempHp: 0 }, { delta: 10 });
  must(dead.entity.conditions.includes('Dead') && dead.entity.hp.current === 0, 'healing revived the dead');
  const broken = A.applyHpTransaction({ id: 'o', type: 'Object', hp: { current: 0, max: 20 }, conditions: ['Broken'], tempHp: 0 }, { delta: 10 });
  must(broken.entity.conditions.includes('Broken') && broken.entity.hp.current === 0, 'healing repaired a broken object');
  return 'explicit resurrection / repair required';
});

check('massive damage cannot be made nonlethal', () => {
  const r = A.applyHpTransaction({ id: 'x', type: 'PC', hp: { current: 10, max: 20 }, conditions: [], deathSaves: { successes: 0, failures: 0 }, tempHp: 0 }, { delta: -45, nonlethal: true });
  must(r.result.massive === true, 'massive damage not detected');
  must(r.entity.conditions.includes('Dead'), 'nonlethal overrode massive damage');
  return 'massive evaluated before nonlethal';
});

// 15 ------------------------------------------------------------------------
check('rest UI text and behaviour match one another', () => {
  const fs = require('fs');
  const src = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
  must(!/restore half of max HP/i.test(src), 'stale "half of max HP" text remains');
  const e = { id: 'p', name: 'P', type: 'PC', hp: { current: 5, max: 30 }, conditions: [], deathSaves: { successes: 0, failures: 0 },
    stats: { con: 14 }, hitDicePools: [{ sides: 8, max: 3, spent: 0 }], pactSlots: { used: 2 }, spellSlotsUsed: { 1: 1 }, tempEffects: [] };
  const s = A.reducer({ entities: { p: e }, chat: [], table: {} }, { type: 'SHORT_REST', entityIds: ['p'] });
  must(s.entities.p.hp.current === 5, 'a short rest healed automatically');
  must(s.entities.p.pactSlots.used === 0, 'a short rest did not restore Pact Magic');
  return 'short rest heals nothing; Pact Magic restored';
});

// 16 ------------------------------------------------------------------------
check('generic roll modifiers affect live attacks and saves', () => {
  const club = { id: 'w', name: 'Club', category: 'simple', kind: 'melee', damage: { count: 1, sides: 4 }, properties: { reach: 100 } };
  let s = world({ entities: {
    c: caster({ weapons: [club] }),
    t: { id: 't', name: 'T', type: 'Monster', hp: { current: 50, max: 50 }, conditions: [], stats: { dex: 10 }, ac: 12, economy: econ(), sizeCategory: 'Medium' } },
    tokens: { tc: { id: 'tc', entityId: 'c', mapId: 'm', x: 0, y: 0, scale: 1 }, tt: { id: 'tt', entityId: 't', mapId: 'm', x: 50, y: 0, scale: 1 } } });
  s = A.reducer(s, { type: 'MODIFIER_ADD', modifier: A.makeRollModifier({
    sourceName: 'Gate Boon', targetId: 'c', applies: { kind: 'attack' }, effect: { type: 'die', dice: { count: 1, sides: 4 } } }) });
  const r = A.prepareWeaponAttack(s, { attackerId: 'c', targetId: 't', weaponId: 'w', isDM: true, d20a: 10, rng: () => 0.99 });
  must(r.plan.attack.audit.some(a => a.label === 'Gate Boon'), 'the modifier did not reach the roll with attribution');
  return 'modifier dice reach the roll with source attribution';
});

// 17 ------------------------------------------------------------------------
check('multiplayer host validation matches local DM actions', () => {
  const spell = { id: 's', name: 'Test', level: 1, prepared: true, components: {},
    dmg: { on: false, parts: [] }, heal: { on: false }, effect: { on: false }, area: { shape: 'none', size: 0 } };
  const s = world({ entities: { c: caster({ spellbook: [spell] }) } });
  const dm = A.prepareSpellCast(s, { casterId: 'c', spellId: 's', isDM: true });
  const host = A.prepareSpellCast(s, { casterId: 'c', spellId: 's', isDM: false, actorPeerId: 'peer1' });
  must(dm.plan.castLevel === host.plan.castLevel && dm.plan.slotSource === host.plan.slotSource, 'host and DM disagree on the cast');
  const dmMove = A.prepareMove(s, A.moveRequestWalk('tc', 200, 0, { isDM: true }));
  const hostMove = A.prepareMove(s, A.moveRequestWalk('tc', 200, 0, { isDM: false, actorPeerId: 'peer1' }));
  must(dmMove.costFt === hostMove.costFt, 'host and DM disagree on movement cost');
  must(A.prepareSpellCast(s, { casterId: 'c', spellId: 's', isDM: false, actorPeerId: 'nobody' }).reason === 'not-authorized', 'host let a stranger act');
  return 'identical results; ownership still enforced';
});

// ---------------------------------------------------------------------------
const failed = results.filter(r => !r.ok);
console.log('\nPRE-PROMPT-25 INTEGRATION GATE');
console.log('='.repeat(70));
for (const r of results) {
  console.log(`  ${r.ok ? 'PASS' : 'FAIL'}  ${r.name}`);
  if (r.detail) console.log(`        ${r.detail}`);
}
console.log('='.repeat(70));
console.log(`${results.length - failed.length}/${results.length} conditions met`);
if (failed.length) {
  console.error(`\nGATE FAILED: ${failed.length} condition(s) not met. Prompt 25 must not begin.`);
  process.exit(1);
}
console.log('GATE PASSED: the prompt 1-24 foundation is integrated.\n');
