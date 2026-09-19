#!/usr/bin/env node
'use strict';
// ============================================================================
// ENGINE CHECK (v9.39)
// ----------------------------------------------------------------------------
// `package.json` declared `node >=18` while the committed lockfile pins Babel 8,
// whose entire tree requires ^22.18.0 || >=24.11.0. A Node 18 user got either a
// confusing `npm ci` failure or a build that broke at parse time.
//
// The declaration is now the truth, and this check enforces it BEFORE the build
// runs - so the failure names the cause instead of surfacing as a Babel syntax
// error twenty lines deep.
const fs = require('fs');
const path = require('path');

const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
const want = pkg.engines && pkg.engines.node;
const [maj, min] = process.versions.node.split('.').map(Number);

// ^22.18.0 || >=24.11.0
const ok = (maj === 22 && min >= 18) || (maj === 24 && min >= 11) || maj > 24;

if (!ok) {
  console.error(`\nERROR: Node ${process.versions.node} is not supported.`);
  console.error(`  This project requires: ${want}`);
  console.error('  The committed lockfile pins Babel 8, which does not run on older Node.');
  console.error('  Install a supported Node (nvm install 22.18) and run `npm ci` again.\n');
  process.exit(1);
}
console.log(`OK: Node ${process.versions.node} satisfies ${want}`);
