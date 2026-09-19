#!/usr/bin/env node
'use strict';
// check-orphans.js - find things that are defined and never used, and things
// that are used and never defined.
//
// WHY THIS EXISTS. Five bugs in one session were the same shape: a producer
// with no consumer. `build_change` requests were created and never applied
// (§ 11ca). `end_turn` appeared exactly once in the codebase - the line that
// created it (§ 11ce). `pendingOpportunityFor` was written, correct, and never
// called, while the movement preview advertised the rule it did not enforce
// (§ 11cf). The dock's spell panel shipped with no stylesheet at all (§ 11cd).
// Three copies of one status comparison were all wrong the same way (§ 11cg).
//
// Every one was found by a player hitting it. None was findable by a test,
// because a test asserts that code which RUNS does the right thing, and this
// class of defect is code that never runs.
//
// The checks are deliberately conservative: this reports, and the reviewer
// decides. An "unused" helper may be a deliberate API; a "missing" style may
// come from a library. It exits non-zero only for the category that is always
// a bug - an action dispatched with no reducer case to receive it.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const APP = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
const GAME = fs.readFileSync(path.join(ROOT, 'game-data.js'), 'utf8');
const CSS = fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf8');
const TEST_DIR = path.join(ROOT, 'tests');
const TESTS = fs.readdirSync(TEST_DIR).filter(f => f.endsWith('.js'))
  .map(f => fs.readFileSync(path.join(TEST_DIR, f), 'utf8')).join('\n');

// Comments hide real usage and fake it in equal measure: a name in a comment is
// not a call. Strip them before counting references.
// Deliberately LINE-BASED and conservative. A regex-based strip destroyed 32%
// of app.js on the first run: a `/*` inside a string or a regex literal opened
// a comment that ran until the next `*/` somewhere far below, and 151 reducer
// cases vanished. Only whole comment lines are removed, so a trailing comment
// can still hide an orphan - a false negative, which is the safe direction.
function stripComments(src) {
  const out = [];
  let inBlock = false;
  for (const line of src.split('\n')) {
    const t = line.trim();
    if (inBlock) { if (t.endsWith('*/')) inBlock = false; out.push(''); continue; }
    if (t.startsWith('/*')) { if (!t.includes('*/')) inBlock = true; out.push(''); continue; }
    if (t.startsWith('//') || t.startsWith('*')) { out.push(''); continue; }
    out.push(line);
  }
  return out.join('\n');
}
const CODE = stripComments(APP);
const CODE_GAME = stripComments(GAME);
const ALL_CODE = CODE + '\n' + CODE_GAME;

const count = (hay, name) => {
  const m = hay.match(new RegExp(`\\b${name.replace(/[$]/g, '\\$')}\\b`, 'g'));
  return m ? m.length : 0;
};

const report = { sections: [], hardFailures: 0 };
function section(title, items, { fatal = false, note = '' } = {}) {
  report.sections.push({ title, items, fatal, note });
  if (fatal) report.hardFailures += items.length;
}

// ---------------------------------------------------------------------------
// 1. Top-level functions that nothing calls.
const declared = [];
for (const m of CODE.matchAll(/^function ([A-Za-z_$][\w$]*)\s*\(/gm)) declared.push(m[1]);
for (const m of CODE.matchAll(/^const ([A-Za-z_$][\w$]*)\s*=\s*(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>/gm)) declared.push(m[1]);

const unusedFns = [];
for (const name of [...new Set(declared)]) {
  // one occurrence is the definition itself
  const inApp = count(CODE, name);
  if (inApp > 1) continue;
  if (count(CODE_GAME, name) > 0) continue;
  const inTests = count(TESTS, name) > 0;
  unusedFns.push({ name, testedOnly: inTests });
}

// ---------------------------------------------------------------------------
// 2. React components never mounted. A component is a capitalised function; a
//    mount is `<Name`. Being called as a plain function counts too.
const components = [...new Set(declared.filter(n => /^[A-Z]/.test(n)))];
const unmounted = components.filter(n =>
  !new RegExp(`<${n}[\\s/>]`).test(CODE) && count(CODE, n) <= 1);

// ---------------------------------------------------------------------------
// 3. Reducer cases with no dispatcher, and dispatchers with no case.
//    The second is ALWAYS a bug: the action goes nowhere.
const cases = new Set([...CODE.matchAll(/case '([A-Z][A-Z0-9_]*)':/g)].map(m => m[1]));
// An action name must contain an underscore. `type: 'PC'` and `type: 'NPC'` are
// ENTITY types, not actions, and matching them reported two phantom bugs on the
// first run. The cost is that a single-word action with no case would be missed;
// none exists today, and the reducer-case list below would still show it as
// unreachable from the other direction.
const isActionName = (n) => /^[A-Z][A-Z0-9]*(_[A-Z0-9]+)+$/.test(n);
const dispatched = new Set([...ALL_CODE.matchAll(/type:\s*'([A-Z][A-Z0-9_]*)'/g)]
  .map(m => m[1]).filter(isActionName));
const dispatchedInTests = new Set([...stripComments(TESTS).matchAll(/type:\s*'([A-Z][A-Z0-9_]*)'/g)].map(m => m[1]));

const neverDispatched = [...cases].filter(c => !dispatched.has(c)).sort();
const neverHandled = [...dispatched].filter(d => !cases.has(d)).sort();

// ---------------------------------------------------------------------------
// 4. Request kinds: created, displayed, applied. The § 11ca / § 11ce shape.
const kindsCreated = new Set([...CODE.matchAll(/kind:\s*'([a-z][a-z0-9_]*)'/g)].map(m => m[1]));
const summaryFn = (() => {
  const i = CODE.indexOf('function requestSummary');
  return i < 0 ? '' : CODE.slice(i, CODE.indexOf('\nfunction ', i + 10));
})();
const resolveFn = (() => {
  const i = CODE.indexOf('const resolve = (r, status)');
  return i < 0 ? '' : CODE.slice(i, i + 6000);
})();
const REQUEST_KINDS = ['new_character', 'join_request', 'hp_change', 'build_change',
  'place_token', 'stat_change', 'level_change', 'turn_correction', 'end_turn'];
const requestGaps = [];
for (const k of REQUEST_KINDS) {
  if (!kindsCreated.has(k)) continue;
  const shown = summaryFn.includes(`'${k}'`);
  const applied = resolveFn.includes(`'${k}'`) || CODE.includes(`r.kind === '${k}'`);
  if (!shown || !applied) requestGaps.push(`${k}: ${shown ? '' : 'no summary; '}${applied ? '' : 'no apply branch'}`);
}

// ---------------------------------------------------------------------------
// 5. CSS classes used in markup with no rule anywhere (the § 11cd shape).
const usedClasses = new Set();
for (const m of CODE.matchAll(/className=(?:"([^"]*)"|\{`([^`]*)`\})/g)) {
  const raw = (m[1] || m[2] || '').replace(/\$\{[^}]*\}/g, ' ');
  // A trailing `-` is the stub of an interpolated class (`exh-level-${n}`), not
  // a class anyone wrote a rule for. Reporting those buried the real findings.
  for (const c of raw.split(/\s+/)) {
    if (c && /^[a-z][\w-]*$/.test(c) && !c.endsWith('-')) usedClasses.add(c);
  }
}
const cssText = CSS.replace(/\/\*[\s\S]*?\*\//g, ' ');
const styledClasses = new Set([...cssText.matchAll(/\.([a-zA-Z][\w-]*)/g)].map(m => m[1]));
const unstyled = [...usedClasses].filter(c => !styledClasses.has(c)).sort();

// ---------------------------------------------------------------------------
// 6. Tool scripts nobody runs.
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const scriptText = Object.values(pkg.scripts || {}).join(' ');
const toolFiles = fs.readdirSync(path.join(ROOT, 'tools')).filter(f => f.endsWith('.js'));
const unrunTools = toolFiles.filter(f => !scriptText.includes(f) && !TESTS.includes(f));

// ---------------------------------------------------------------------------
section('Actions dispatched with NO reducer case (always a bug)', neverHandled, { fatal: true });
section('Reducer cases nothing dispatches', neverDispatched.filter(c => !dispatchedInTests.has(c)),
  { note: 'may be reachable only from a peer message; check before deleting' });
section('Request kinds missing a summary or an apply branch', requestGaps, { fatal: true });
// v10.9: a function the APP never calls but the TESTS do is the worst case, not
// a milder one. It looks covered - there is a green test next to it - while the
// feature it implements does nothing. `drainHealAmount`, `drainHealTarget` and
// `attackUnavailableReason` all sat in this category for a version, reported as
// a NOTE nobody read, while the drain they implement healed no one.
// NOT fatal, deliberately: there are ~80 of these today, most of them pure
// helpers that are genuinely exercised through another entry point, and a gate
// that red-lines on day one gets switched off. It is its own section with its
// own name so the category is visible, and reviewing it is a standing task
// rather than a build break.
section('Functions ONLY the tests call (a tested feature may never run)',
  unusedFns.filter(u => u.testedOnly).map(u => u.name),
  { note: 'a green test beside a function nobody calls proves only that the function works' });
section('Functions defined and never called at all',
  unusedFns.filter(u => !u.testedOnly).map(u => u.name));
section('Components never mounted', unmounted);
section('classNames with no CSS rule', unstyled,
  { note: 'a panel with no stylesheet renders as browser defaults (§ 11cd)' });
section('Tool scripts not wired into package.json', unrunTools);

// v17.3: REDUCER ACTIONS WITH NO DISPATCHER. This tool already finds functions
// nobody calls and components nobody mounts; it could not see a `case` nobody
// dispatches, which is how ITEM_ACTIVATE sat correct and unreachable for
// versions while its job was done badly by three worse paths. (CONTRACT 11fj)
//
// Each opt-out needs a REASON. A bare list is where dead code hides.
const ACTION_OPT_OUT = {
  ENTITY_TEMP_HP_SET: 'reducer-only: applied by rest and spell effects, not a control',
  ENTITY_TEMP_HP_GRANT: 'reducer-only: granted by spell effects',
  ENTITY_RESURRECT: 'planned control; tracked in CONTRACT 11en',
  ENTITY_REPAIR: 'planned control; tracked in CONTRACT 11en',
};
const reducerCases = [...new Set([...APP.matchAll(/case '([A-Z][A-Z_0-9]+)':/g)]
  .map(m => m[1]))];
// a dispatcher is any `type: 'X'` OUTSIDE the reducer's own case labels
const actionDispatched = new Set([...APP.matchAll(/type:\s*'([A-Z][A-Z_0-9]+)'/g)]
  .map(m => m[1]));
const deadActions = reducerCases
  .filter(c => !actionDispatched.has(c))
  .filter(c => !(c in ACTION_OPT_OUT));
section('Reducer actions nobody dispatches', deadActions,
  { note: 'correct code nobody can reach is worse than missing code (\u00a7 11fd)' });

let printed = 0;
for (const s of report.sections) {
  if (!s.items.length) continue;
  printed++;
  console.log(`\n${s.fatal ? 'FAIL' : 'NOTE'}: ${s.title} - ${s.items.length}`);
  if (s.note) console.log(`      (${s.note})`);
  for (const item of s.items) console.log(`      - ${item}`);
}
if (!printed) console.log('OK: no orphans found');
else console.log('');

if (report.hardFailures > 0) {
  console.error(`ORPHAN CHECK FAILED: ${report.hardFailures} item(s) in a category that is always a bug.`);
  process.exit(1);
}
console.log('OK: nothing in a always-a-bug category');
