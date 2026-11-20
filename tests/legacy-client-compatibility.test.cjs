'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { checkLegacyClientCompatibility, OFFICIAL_CATALOG_URL } = require('../scripts/check-legacy-client-compatibility.cjs');

const root = path.resolve(__dirname, '..');
const currentCatalog = JSON.parse(fs.readFileSync(path.join(root, 'catalog.json'), 'utf8'));

test('current signed catalog preserves the released Talia client contract', () => {
  const result = checkLegacyClientCompatibility({ root, previousCatalog: currentCatalog });
  assert.deepEqual(result, { packages: currentCatalog.packages.length, source: OFFICIAL_CATALOG_URL, removed: [] });
});

test('rejects a tampered catalog before publication', () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'talia-store-legacy-client-'));
  try {
    for (const name of ['catalog.json', 'catalog.signature.json', 'public-key.txt', 'artifacts']) {
      fs.cpSync(path.join(root, name), path.join(fixture, name), { recursive: true });
    }
    const candidate = JSON.parse(fs.readFileSync(path.join(fixture, 'catalog.json'), 'utf8'));
    candidate.packages[0].artifact.url = 'packages/connectors/cadcraft/connector.json';
    fs.writeFileSync(path.join(fixture, 'catalog.json'), JSON.stringify(candidate));
    assert.throws(
      () => checkLegacyClientCompatibility({ root: fixture, previousCatalog: currentCatalog }),
      /signature envelope payload/
    );
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
});
