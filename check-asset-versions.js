#!/usr/bin/env node
'use strict';
// check-asset-versions.js - every local asset in index.html must carry a
// ?v= that matches APP_VERSION.
//
// Why this is a build gate and not a code review note: the failure it prevents
// is invisible to every other check. app.js can be correct, app.compiled.js can
// match it, the whole suite can pass, and a returning player still sees the
// previous build because their browser had styles.css cached and nothing in the
// URL changed. It then presents as "the fix didn't work" - the most expensive
// kind of bug report, because it sends you looking at correct code.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');

const m = app.match(/const APP_VERSION = "([0-9]+\.[0-9]+)"/);
if (!m) {
  console.error('FAIL: no APP_VERSION in app.js');
  process.exit(1);
}
const version = m[1];

// Local assets only - the CDN <script>s are already version-pinned in the URL.
// v17.1: the vendored libraries are cache-busted like every other local asset.
// They used to come from unpkg, so they had no ?v= and no integrity - and the
// copies in vendor/ were never referenced at all.
const REQUIRED = ['styles.css', 'game-data.js', 'app.compiled.js',
  'vendor/react-18.2.0.min.js', 'vendor/react-dom-18.2.0.min.js',
  'vendor/peerjs-1.5.4.min.js'];
const refs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)]
  .map((x) => x[1])
  .filter((u) => !/^(https?:)?\/\//.test(u) && !u.startsWith('data:') && !u.startsWith('#'));

const problems = [];
for (const name of REQUIRED) {
  const found = refs.filter((u) => u.split('?')[0] === name);
  if (found.length === 0) { problems.push(`${name} is not referenced by index.html`); continue; }
  for (const url of found) {
    const q = url.split('?')[1] || '';
    const v = new URLSearchParams(q).get('v');
    if (!v) problems.push(`${name} has no ?v= - a cached copy will survive the deploy`);
    else if (v !== version) problems.push(`${name} is tagged ?v=${v} but APP_VERSION is ${version}`);
  }
}

// v17.1: and NOTHING is loaded from a CDN. This is the check that matters - the
// vendored files were sitting unused for a reason no one had written down, and
// without a gate the next hand edit puts unpkg back.
const scriptTags = [...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)]
  .map((m) => m[1]);
const linkTags = [...html.matchAll(/<link\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi)]
  .map((m) => m[1]);
const CDN = /(unpkg\.com|cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com|esm\.sh|skypack\.dev)/i;
for (const url of scriptTags) {
  if (CDN.test(url)) problems.push(`<script> loads from a CDN: ${url}`);
}
// a stylesheet degrades to a fallback stack rather than failing to boot, so
// Google Fonts stays - see CONTRACT 11fh
for (const url of linkTags) {
  if (CDN.test(url)) problems.push(`<link> loads from a script CDN: ${url}`);
}
// every referenced vendor file must actually be on disk and non-empty
for (const url of scriptTags) {
  const file = url.split('?')[0];
  if (!file.startsWith('vendor/')) continue;
  const abs = path.join(ROOT, file);
  if (!fs.existsSync(abs)) problems.push(`${file} is referenced but missing from disk`);
  else if (fs.statSync(abs).size === 0) problems.push(`${file} is empty`);
}

// v17.5: a deploy that cannot serve vendor/ is not a hypothetical - GitHub
// Pages runs Jekyll by default and drops the folder, so index.html 404s on all
// three libraries and the app will not boot. `.nojekyll` turns Jekyll off, and
// it only works if it is committed next to index.html.
if (scriptTags.some((u) => u.split('?')[0].startsWith('vendor/'))
  && !fs.existsSync(path.join(ROOT, '.nojekyll'))) {
  problems.push('.nojekyll is missing - a Jekyll host (GitHub Pages) will not serve vendor/');
}

if (problems.length) {
  for (const p of problems) console.error(`FAIL: ${p}`);
  console.error(`\nBump the ?v= in index.html to ${version}, and serve libraries from vendor/.`);
  process.exit(1);
}
console.log(`OK: index.html assets are tagged ?v=${version}`);
