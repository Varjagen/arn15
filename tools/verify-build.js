#!/usr/bin/env node
'use strict';
// Guarantee the compiled bundle under test was produced from the CURRENT app.js.
// Compiles app.js to a temporary file and compares it byte-for-byte with
// app.compiled.js. Any difference (stale bundle, hand-edited bundle, failed
// build) is a hard failure, so tests can never pass against stale output.
const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'app.js');
const OUT = path.join(ROOT, 'app.compiled.js');

if (!fs.existsSync(SRC)) { console.error('ERROR: app.js not found'); process.exit(1); }
if (!fs.existsSync(OUT)) { console.error('ERROR: app.compiled.js not found - run `npm run build`'); process.exit(1); }

let fresh;
try {
  fresh = babel.transformFileSync(SRC, {
    // MUST match build.sh exactly, or a correct build would look "stale"
    presets: [[require.resolve('@babel/preset-react'), { runtime: 'classic' }]],
    babelrc: false, configFile: false, comments: true, compact: false,
  }).code;
} catch (err) {
  console.error('ERROR: compilation of app.js FAILED');
  console.error(String(err.message).split('\n').slice(0, 8).join('\n'));
  process.exit(1);
}

const onDisk = fs.readFileSync(OUT, 'utf8');
const norm = (s) => s.replace(/\r\n/g, '\n').trimEnd();
if (norm(fresh) !== norm(onDisk)) {
  console.error('ERROR: app.compiled.js is STALE (differs from a fresh build of app.js).');
  console.error(`  fresh build: ${norm(fresh).length} bytes`);
  console.error(`  on disk    : ${norm(onDisk).length} bytes`);
  console.error('  Run `npm run build` and re-run the tests.');
  process.exit(1);
}
console.log('OK: app.compiled.js matches a fresh build of app.js');
