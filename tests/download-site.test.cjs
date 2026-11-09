'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { buildDownloadIndex, fetchReleaseRecordsWithGh, parseManifest } = require('../scripts/build-download-site.cjs');

const REPOSITORY = 'Talia-Orchestrator/talia-store';
const COMMIT = '0123456789abcdef0123456789abcdef01234567';
const TAG = 'v0.7.0-main.6.1';
const ROOT_URL = `https://github.com/${REPOSITORY}/releases/download/${TAG}`;

function file(name, size = 1024) {
  return { name, url: `${ROOT_URL}/${name}`, size, sha256: 'a'.repeat(64) };
}

function record(overrides = {}) {
  const assets = [
    file('Talia-arm64.dmg'), file('Talia-intel.dmg'), file('Talia-win.exe'), file('Talia-linux.AppImage'),
    file('release-manifest.json', 2048),
  ];
  const manifest = {
    schemaVersion: 1,
    version: `0.7.0+main.6.1.${COMMIT.slice(0, 12)}`,
    baseVersion: '0.7.0',
    channel: 'main',
    commit: COMMIT,
    runNumber: 6,
    runAttempt: 1,
    publishedAt: '2026-11-09T15:00:00.000Z',
    releaseUrl: `https://github.com/${REPOSITORY}/releases/tag/${TAG}`,
    platforms: {
      'darwin-arm64': { files: [assets[0]], automaticUpdate: false },
      'darwin-x64': { files: [assets[1]], automaticUpdate: false },
      'win32-x64': { files: [assets[2]], automaticUpdate: false },
      'linux-x64': { files: [assets[3]], automaticUpdate: false },
    },
  };
  return {
    release: {
      tag_name: TAG,
      name: 'Talia 0.7.0 main 6.1',
      html_url: `https://github.com/${REPOSITORY}/releases/tag/${TAG}`,
      draft: false,
      prerelease: true,
      published_at: '2026-11-09T15:00:00.000Z',
      assets: assets.map(asset => ({ name: asset.name, size: asset.size, browser_download_url: asset.url })),
    },
    manifest: { ...manifest, ...overrides.manifest },
  };
}

test('empty input produces an honest empty release index', () => {
  assert.deepEqual(buildDownloadIndex([], { generatedAt: '2026-11-09T00:00:00.000Z' }), {
    schemaVersion: 1,
    generatedAt: '2026-11-09T00:00:00.000Z',
    releases: [],
  });
});

test('builds direct verified links for manifest targets and preserves partial availability', () => {
  const source = record();
  delete source.manifest.platforms['win32-x64'];
  const index = buildDownloadIndex([source], { generatedAt: '2026-11-09T00:00:00.000Z' });
  assert.equal(index.releases.length, 1);
  assert.equal(index.releases[0].version, `0.7.0+main.6.1.${COMMIT.slice(0, 12)}`);
  assert.equal(index.releases[0].platforms['darwin-arm64'].files[0].url, `${ROOT_URL}/Talia-arm64.dmg`);
  assert.equal(index.releases[0].platforms['darwin-arm64'].files[0].sha256, 'a'.repeat(64));
  assert.equal(Object.hasOwn(index.releases[0].platforms, 'win32-x64'), false);
});

test('rejects mismatched release assets and malformed manifest contracts', () => {
  const source = record();
  source.manifest.platforms['linux-x64'].files[0].size += 1;
  assert.throws(() => buildDownloadIndex([source]), /missing or mismatched asset/);

  const badUnknownField = record();
  badUnknownField.manifest.description = 'unexpected';
  assert.throws(() => parseManifest(badUnknownField.manifest, TAG), /unknown fields/);

  const badVersion = record();
  badVersion.manifest.version = '0.7.0';
  assert.throws(() => buildDownloadIndex([badVersion]), /tag and version/);

  const badReleaseUrl = record();
  badReleaseUrl.manifest.releaseUrl = 'https://example.com/forged-release';
  assert.throws(() => buildDownloadIndex([badReleaseUrl]), /tag and version/);
});

test('reads manifests signed before the organization rename and publishes canonical URLs', () => {
  const source = record();
  source.manifest.releaseUrl = source.manifest.releaseUrl.replace('Talia-Orchestrator', 'Talia-orchestator');
  for (const platform of Object.values(source.manifest.platforms)) {
    for (const entry of platform.files) entry.url = entry.url.replace('Talia-Orchestrator', 'Talia-orchestator');
  }
  const index = buildDownloadIndex([source]);
  assert.equal(index.releases[0].releaseUrl, `https://github.com/${REPOSITORY}/releases/tag/${TAG}`);
  assert.equal(index.releases[0].platforms['darwin-arm64'].files[0].url, `${ROOT_URL}/Talia-arm64.dmg`);

  source.manifest.releaseUrl = source.manifest.releaseUrl.replace('Talia-orchestator', 'Unrelated-owner');
  assert.throws(() => buildDownloadIndex([source]), /tag and version/);
});

test('accepts legacy 0.7 build metadata and ordered prerelease SemVer for future versions', () => {
  const source = record();
  assert.equal(parseManifest(source.manifest, TAG).version, source.manifest.version);

  const futureTag = 'v0.8.0-main.7.1';
  const futureManifest = {
    ...source.manifest,
    baseVersion: '0.8.0',
    version: `0.8.0-main.7.1+${COMMIT.slice(0, 12)}`,
    runNumber: 7,
    runAttempt: 1,
    releaseUrl: `https://github.com/${REPOSITORY}/releases/tag/${futureTag}`,
  };
  assert.equal(parseManifest(futureManifest, futureTag).version, futureManifest.version);
});

test('uses gh api and gh release download with a temporary manifest path', async () => {
  const source = record();
  const calls = [];
  const runGh = args => {
    calls.push(args);
    if (args[0] === 'api') return JSON.stringify([source.release]);
    const directory = args[args.indexOf('--dir') + 1];
    fs.writeFileSync(path.join(directory, 'release-manifest.json'), JSON.stringify(source.manifest));
    return '';
  };
  const records = await fetchReleaseRecordsWithGh(REPOSITORY, { runGh });
  const index = buildDownloadIndex(records, { generatedAt: '2026-11-09T00:00:00.000Z' });
  assert.deepEqual(calls[0], ['api', `repos/${REPOSITORY}/releases?per_page=100`]);
  assert.ok(calls[1].includes('--pattern') && calls[1].includes('release-manifest.json'));
  assert.equal(JSON.stringify(index).includes('ci-token'), false);
  assert.equal(index.releases.length, 1);
});

test('CLI builds the static release index from an input JSON file', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'talia-download-site-'));
  try {
    const input = path.join(directory, 'releases-input.json');
    const output = path.join(directory, 'site', 'releases.json');
    fs.writeFileSync(input, JSON.stringify({ releases: [record()] }));
    execFileSync(process.execPath, [
      path.resolve(__dirname, '../scripts/build-download-site.cjs'),
      '--input', input,
      '--output', output,
    ]);
    const index = JSON.parse(fs.readFileSync(output, 'utf8'));
    assert.equal(index.schemaVersion, 1);
    assert.equal(index.releases.length, 1);
    assert.equal(index.releases[0].platforms['win32-x64'].files[0].name, 'Talia-win.exe');
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
