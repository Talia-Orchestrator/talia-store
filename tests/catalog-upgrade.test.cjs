'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { checkUpgrade } = require('../scripts/check-catalog-upgrade.cjs');

const pkg = (version, digest, sha = digest) => ({
  id: 'talia-apps/notes', kind: 'app', version, digest,
  artifact: { url: `artifacts/talia-apps-notes-${version}.json`, sha256: sha },
});
const catalog = (...packages) => ({ format: 'talia-extension-catalog', version: 3, packages });

test('accepts a new version with a new artifact and stable package identity', () => {
  assert.deepEqual(checkUpgrade(catalog(pkg('1.0.0', 'old')), catalog(pkg('1.1.0', 'new'))), []);
});

test('rejects mutation at the same version', () => {
  assert.match(checkUpgrade(catalog(pkg('1.0.0', 'old')), catalog(pkg('1.0.0', 'new')))[0], /without a version increase/);
});

test('rejects removal, downgrade and reused artifact URL', () => {
  const old = catalog(pkg('1.0.0', 'old'));
  assert.match(checkUpgrade(old, catalog())[0], /removed/);
  assert.match(checkUpgrade(old, catalog(pkg('0.9.0', 'old')))[0], /decreased/);
  const reused = { ...pkg('1.1.0', 'new'), artifact: { url: pkg('1.0.0', 'old').artifact.url, sha256: 'new' } };
  assert.match(checkUpgrade(old, catalog(reused))[0], /reuses/);
});
