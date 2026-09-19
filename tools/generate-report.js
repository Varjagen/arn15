#!/usr/bin/env node
'use strict';
// ============================================================================
// REPORT GENERATION (v9.39)
// ----------------------------------------------------------------------------
// The integration report carried MANUALLY MAINTAINED totals, and they drifted:
// one line claimed 2881 tests while another claimed 2336. A number a human
// retypes after every change is a number that will eventually be wrong.
//
// The totals block is now generated from actual `node --test` output. The prose
// around it stays hand-written - that is judgement, not arithmetic - but no
// count in the file is ever typed by hand again.
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const REPORT = path.join(ROOT, 'INTEGRATION-GATE-REPORT.md');
const BEGIN = '<!-- BEGIN GENERATED TOTALS -->';
const END = '<!-- END GENERATED TOTALS -->';

function run() {
  let out = '';
  try {
    // v13.0: maxBuffer. execSync defaults to 1MB, and the suite's own output
    // passed that at ~5,200 tests - so the trailing "# tests N" summary was
    // truncated away and the generator refused to write a total it could no
    // longer see. The tests were fine; the reader had outgrown its bucket.
    out = execSync('node --test tests/*.test.js',
      { cwd: ROOT, encoding: 'utf8', stdio: 'pipe', maxBuffer: 256 * 1024 * 1024 });
  } catch (e) {
    // a failing suite still prints its totals; report them rather than hiding
    out = (e.stdout || '') + (e.stderr || '');
    if (!/^# tests \d+$/m.test(out)) {
      console.error('WARNING: the runner produced no summary line; output may be truncated.');
    }
  }
  const num = (key) => {
    const m = out.match(new RegExp(`^# ${key} (\\d+)$`, 'm'));
    return m ? Number(m[1]) : null;
  };
  const files = fs.readdirSync(path.join(ROOT, 'tests')).filter(f => f.endsWith('.test.js')).length;
  return { tests: num('tests'), pass: num('pass'), fail: num('fail'), files, raw: out };
}

const r = run();
if (r.tests == null) {
  console.error('ERROR: could not parse test output; refusing to write a total.');
  process.exit(1);
}
const stamp = new Date().toISOString().slice(0, 10);
const block = [
  BEGIN,
  '',
  `**Generated from \`node --test\` on ${stamp}. Do not edit by hand.**`,
  '',
  `| | |`,
  `| --- | --- |`,
  `| Test files | ${r.files} |`,
  `| Tests | ${r.tests} |`,
  `| Passing | ${r.pass} |`,
  `| Failing | ${r.fail} |`,
  `| Node | \`${process.versions.node}\` |`,
  '',
  r.fail === 0
    ? '_All tests pass._'
    : `_**${r.fail} failing.** The totals above are reported as measured, not as intended._`,
  '',
  END,
].join('\n');

let md = fs.readFileSync(REPORT, 'utf8');
if (md.includes(BEGIN) && md.includes(END)) {
  md = md.slice(0, md.indexOf(BEGIN)) + block + md.slice(md.indexOf(END) + END.length);
} else {
  // first run: insert after the title
  const nl = md.indexOf('\n');
  md = md.slice(0, nl + 1) + '\n' + block + '\n' + md.slice(nl + 1);
}
fs.writeFileSync(REPORT, md);
console.log(`OK: report totals updated - ${r.tests} tests, ${r.pass} pass, ${r.fail} fail, ${r.files} files`);
if (r.fail > 0) process.exit(1);
