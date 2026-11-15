'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');
const packer = require('../tools/talia-catalog-pack.cjs');
const { validateRetainedArtifacts } = require('../scripts/retained-artifacts.cjs');

test('new package version retains the old artifact and rejects same-version overwrite', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'talia-retention-'));
  const source = path.join(root, 'package');
  const index = path.join(root, 'catalog.json');
  const artifactRoot = path.join(root, 'artifacts');
  const manifest = path.join(source, 'talia-extension.json');
  const skill = path.join(source, 'SKILL.md');
  const metadata = version => ({ id: 'talia-skills/fixture', kind: 'skill', version,
    name: 'Fixture', description: 'Versioned artifact fixture', publisher: 'talia-skills', license: 'MIT' });
  const build = () => spawnSync(process.execPath,
    [path.resolve(__dirname, '../tools/talia-catalog-pack.cjs'), 'build', '--format', '3', '--package', source, '--out', index],
    { encoding: 'utf8' });
  try {
    fs.mkdirSync(source);
    for (const file of ['LICENSE', 'NOTICE', 'README.md']) fs.writeFileSync(path.join(source, file), 'Fixture');
    fs.writeFileSync(skill, '# Fixture v1\n');
    fs.writeFileSync(manifest, JSON.stringify(metadata('1.0.0')));
    assert.equal(build().status, 0);
    const oldPath = path.join(artifactRoot, 'talia-skills-fixture-1.0.0.json');
    const oldBytes = fs.readFileSync(oldPath);
    fs.writeFileSync(skill, '# Fixture v2\n');
    fs.writeFileSync(manifest, JSON.stringify(metadata('1.1.0')));
    assert.equal(build().status, 0);
    const currentName = 'talia-skills-fixture-1.1.0.json';
    assert.ok(fs.existsSync(path.join(artifactRoot, currentName)));
    assert.deepEqual(fs.readFileSync(oldPath), oldBytes);
    assert.equal(validateRetainedArtifacts(artifactRoot, new Set([currentName]), packer), 1);
    fs.writeFileSync(skill, '# Mutated same version\n');
    const rejected = build();
    assert.equal(rejected.status, 1);
    assert.match(rejected.stderr, /existing artifact differs/);
    assert.deepEqual(fs.readFileSync(oldPath), oldBytes);
    assert.equal(JSON.parse(fs.readFileSync(index)).packages[0].version, '1.1.0');
    fs.writeFileSync(oldPath, 'broken');
    assert.throws(() => validateRetainedArtifacts(artifactRoot, new Set([currentName]), packer), /invalid retained artifact/);
    const previousIndex = fs.readFileSync(index);
    const previousCurrent = fs.readFileSync(path.join(artifactRoot, currentName));
    fs.writeFileSync(manifest, JSON.stringify(metadata('1.2.0')));
    assert.equal(build().status, 1);
    assert.deepEqual(fs.readFileSync(index), previousIndex);
    assert.deepEqual(fs.readFileSync(path.join(artifactRoot, currentName)), previousCurrent);
    assert.equal(fs.existsSync(path.join(artifactRoot, 'talia-skills-fixture-1.2.0.json')), false);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
