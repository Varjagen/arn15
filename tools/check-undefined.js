#!/usr/bin/env node
'use strict';
// Static check: find identifiers that are referenced but never bound in any
// enclosing scope (and are not known globals). This catches render-time
// ReferenceErrors in JSX paths - e.g. using `caster` inside a component whose
// prop is `casterEntity` - which only throw when that branch actually renders.
const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const FILE = process.argv[2] || path.join(__dirname, '..', 'app.js');
const src = fs.readFileSync(FILE, 'utf8');

const ast = parser.parse(src, {
  sourceType: 'script',
  plugins: ['jsx', 'optionalChaining', 'nullishCoalescingOperator', 'classProperties', 'objectRestSpread'],
  errorRecovery: false,
});

// Globals available in the browser + the app's own runtime environment.
const KNOWN_GLOBALS = new Set([
  'window', 'document', 'navigator', 'location', 'history', 'localStorage', 'sessionStorage',
  'console', 'Math', 'JSON', 'Object', 'Array', 'String', 'Number', 'Boolean', 'Date', 'RegExp',
  'Error', 'TypeError', 'RangeError', 'Promise', 'Set', 'Map', 'WeakMap', 'WeakSet', 'Symbol',
  'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'encodeURIComponent', 'decodeURIComponent',
  'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'requestAnimationFrame',
  'cancelAnimationFrame', 'fetch', 'Blob', 'File', 'FileReader', 'URL', 'Image', 'Audio',
  'FormData', 'Headers', 'Request', 'Response', 'AbortController', 'TextEncoder', 'TextDecoder',
  'Intl', 'BigInt', 'Proxy', 'Reflect', 'globalThis', 'structuredClone', 'crypto', 'performance',
  'alert', 'confirm', 'prompt', 'atob', 'btoa', 'undefined', 'NaN', 'Infinity', 'arguments',
  'module', 'exports', 'require', 'process', 'Buffer', '__dirname', '__filename',
  // libraries loaded as globals by index.html
  'React', 'ReactDOM', 'Peer', 'indexedDB', 'IDBKeyRange',
  // globals declared by game-data.js (loaded before app.compiled.js)
  'BNB_TOKEN_PRESETS', 'BUILTIN_TOKEN_PRESETS', 'SRD_FAMILIAR_PRESETS', 'STANDARD_SPELLS',
  'Uint8Array', 'Uint16Array', 'Uint32Array', 'Int8Array', 'Int16Array', 'Int32Array',
  'Float32Array', 'Float64Array', 'ArrayBuffer', 'DataView', 'MutationObserver',
  'ResizeObserver', 'IntersectionObserver', 'CustomEvent', 'Event', 'DOMParser', 'XMLSerializer',
  'HTMLElement', 'Node', 'NodeList', 'getComputedStyle', 'matchMedia', 'devicePixelRatio',
  'screen', 'innerWidth', 'innerHeight', 'scrollX', 'scrollY',
]);

const problems = [];

traverse(ast, {
  ReferencedIdentifier(p) {
    const name = p.node.name;
    if (KNOWN_GLOBALS.has(name)) return;
    // `typeof x` never throws, so a typeof-guarded reference is safe
    if (p.parentPath && p.parentPath.isUnaryExpression({ operator: 'typeof' })) return;
    // JSX member expressions / component names resolve like normal identifiers
    if (p.scope.hasBinding(name, /* noGlobals */ true)) return;
    if (p.scope.hasGlobal && p.scope.hasGlobal(name)) {
      // `hasGlobal` is true for anything declared at program scope
      if (p.scope.getProgramParent().hasBinding(name, true)) return;
    }
    const line = p.node.loc ? p.node.loc.start.line : '?';
    // `typeof X === 'function' ? X : fallback` provably cannot throw: the
    // consequent is only evaluated when the binding exists. Report it as a
    // warning (the value is always the fallback) rather than a hard failure.
    let guarded = false;
    let anc = p.parentPath;
    while (anc && !guarded) {
      if (anc.isConditionalExpression()) {
        const test = anc.get('test');
        const txt = src.slice(test.node.start, test.node.end);
        if (new RegExp(`typeof\\s+${name}\\b`).test(txt)) guarded = true;
      }
      if (anc.isLogicalExpression()) {
        const left = anc.get('left');
        const txt = src.slice(left.node.start, left.node.end);
        if (new RegExp(`typeof\\s+${name}\\b`).test(txt)) guarded = true;
      }
      anc = anc.parentPath;
    }
    problems.push({ name, line, guarded });
  },
});

// Deduplicate by name+line
const seen = new Set();
const unique = problems.filter(p => {
  const k = `${p.name}:${p.line}`;
  if (seen.has(k)) return false;
  seen.add(k);
  return true;
});

const errors = unique.filter(p => !p.guarded);
const warnings = unique.filter(p => p.guarded);
const lines = src.split('\n');
if (warnings.length) {
  console.warn(`\nWARN: ${warnings.length} typeof-guarded reference(s) in ${path.basename(FILE)} (safe, but always the fallback):`);
  for (const p of warnings) console.warn(`  line ${p.line}: '${p.name}'  ->  ${(lines[p.line - 1] || '').trim().slice(0, 110)}`);
}
if (errors.length) {
  console.error(`\nERROR: ${errors.length} undefined identifier(s) in ${path.basename(FILE)}:`);
  for (const p of errors.slice(0, 50)) {
    console.error(`  line ${p.line}: '${p.name}'  ->  ${(lines[p.line - 1] || '').trim().slice(0, 110)}`);
  }
  if (errors.length > 50) console.error(`  ... and ${errors.length - 50} more`);
  process.exit(1);
}
console.log(`OK: no undefined identifiers in ${path.basename(FILE)}${warnings.length ? ` (${warnings.length} guarded warning(s))` : ''}`);
