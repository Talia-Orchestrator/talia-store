#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const DEFAULT_REPOSITORY = 'Talia-Orchestrator/talia-store';
const FORMER_REPOSITORY = 'Talia-orchestator/talia-store';
const TARGETS = ['darwin-arm64', 'darwin-x64', 'win32-x64', 'linux-x64'];
const MAX_MANIFEST_BYTES = 512 * 1024;

function fail(message) {
  throw new Error(message);
}

function isPlainObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function safeRepository(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(value)) {
    fail('repository must use owner/name form');
  }
  return value;
}

function canonicalReleaseUrl(value, repository) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.hostname !== 'github.com' || url.username || url.password
      || url.search || url.hash || url.port) return null;
    const oldPrefix = `/${FORMER_REPOSITORY}/releases/`;
    const currentPrefix = `/${repository}/releases/`;
    if (repository === DEFAULT_REPOSITORY && url.pathname.startsWith(oldPrefix)) {
      url.pathname = currentPrefix + url.pathname.slice(oldPrefix.length);
    }
    return url.pathname.startsWith(currentPrefix) ? url.href : null;
  } catch {
    return null;
  }
}

function parseManifest(manifest, tagName, repository = DEFAULT_REPOSITORY) {
  if (!isPlainObject(manifest) || manifest.schemaVersion !== 1 || manifest.channel !== 'main') {
    fail('release manifest must use schemaVersion 1 and the main channel');
  }
  const allowed = ['schemaVersion', 'version', 'baseVersion', 'channel', 'commit', 'runNumber', 'runAttempt', 'publishedAt', 'releaseUrl', 'platforms', 'buildSource'];
  if (Object.keys(manifest).some(key => !allowed.includes(key))) fail('release manifest contains unknown fields');
  if (typeof manifest.baseVersion !== 'string' || !/^\d+\.\d+\.\d+$/.test(manifest.baseVersion)
    || (manifest.buildSource !== 'local' && (!Number.isSafeInteger(manifest.runNumber) || manifest.runNumber < 1
      || !Number.isSafeInteger(manifest.runAttempt) || manifest.runAttempt < 1))
    || typeof manifest.commit !== 'string' || !/^[a-f0-9]{40}$/.test(manifest.commit)
    || typeof manifest.publishedAt !== 'string' || !Number.isFinite(Date.parse(manifest.publishedAt))) {
    fail('release manifest metadata is invalid');
  }
  // Le anteprime compilate localmente sono disponibili per il download manuale.
  if (manifest.buildSource === 'local') {
    if (manifest.version !== manifest.baseVersion || tagName !== `v${manifest.version}`
      || canonicalReleaseUrl(manifest.releaseUrl, repository) !== `https://github.com/${repository}/releases/tag/${tagName}`
      || Object.hasOwn(manifest, 'runNumber') || Object.hasOwn(manifest, 'runAttempt')
      || !isPlainObject(manifest.platforms) || Object.keys(manifest.platforms).length === 0) {
      fail('local release metadata is invalid');
    }
    for (const [target, platform] of Object.entries(manifest.platforms)) {
      if (!['darwin-arm64', 'win32-x64'].includes(target) || !isPlainObject(platform)
        || platform.automaticUpdate !== false || !Array.isArray(platform.files) || platform.files.length === 0
        || (target === 'win32-x64' && platform.files.some(file =>
          ![`Talia-${manifest.version}-win-x64.exe`, `Talia-${manifest.version}-win-x64.zip`].includes(file?.name)))) {
        fail(`local release must contain valid manual downloads: ${target}`);
      }
    }
    return manifest;
  }
  if (Object.hasOwn(manifest, 'buildSource')) fail('unknown build source');
  const escapedBase = manifest.baseVersion.replaceAll('.', '\\.');
  const legacyVersion = new RegExp(`^${escapedBase}\\+main\\.${manifest.runNumber}\\.${manifest.runAttempt}\\.${manifest.commit.slice(0, 12)}$`);
  const orderedVersion = new RegExp(`^${escapedBase}-main\\.${manifest.runNumber}\\.${manifest.runAttempt}\\+${manifest.commit.slice(0, 12)}$`);
  const expectedTag = `v${manifest.baseVersion}-main.${manifest.runNumber}.${manifest.runAttempt}`;
  const expectedReleaseUrl = `https://github.com/${repository}/releases/tag/${encodeURIComponent(expectedTag)}`;
  if (typeof manifest.version !== 'string' || (!legacyVersion.test(manifest.version) && !orderedVersion.test(manifest.version))
    || tagName !== expectedTag || canonicalReleaseUrl(manifest.releaseUrl, repository) !== expectedReleaseUrl) {
    fail('release tag and version do not match manifest metadata');
  }
  if (!isPlainObject(manifest.platforms) || Object.keys(manifest.platforms).some(target => !TARGETS.includes(target))) {
    fail('release manifest platforms are invalid');
  }
  return manifest;
}

function githubAssetUrl(url, repository) {
  return canonicalReleaseUrl(url, repository)?.startsWith(`https://github.com/${repository}/releases/download/`) || false;
}

function normalizeRelease(record, repository) {
  const release = record && record.release;
  const manifest = record && record.manifest;
  if (!release || release.draft || release.prerelease !== true || !manifest) return null;
  if (typeof release.tag_name !== 'string' || typeof release.published_at !== 'string'
    || !Number.isFinite(Date.parse(release.published_at)) || !Array.isArray(release.assets)) {
    fail('GitHub release metadata is invalid');
  }
  parseManifest(manifest, release.tag_name, repository);
  const assets = new Map();
  for (const asset of release.assets) {
    if (!asset || typeof asset.name !== 'string' || !Number.isSafeInteger(asset.size) || asset.size < 0
      || typeof asset.browser_download_url !== 'string' || !githubAssetUrl(asset.browser_download_url, repository)) {
      fail('GitHub release asset metadata is invalid');
    }
    if (assets.has(asset.name)) fail('GitHub release has duplicate asset names');
    assets.set(asset.name, asset);
  }

  const platforms = {};
  for (const [target, platform] of Object.entries(manifest.platforms)) {
    if (!isPlainObject(platform) || typeof platform.automaticUpdate !== 'boolean' || !Array.isArray(platform.files)) {
      fail(`release platform metadata is invalid: ${target}`);
    }
    const files = [];
    for (const file of platform.files) {
      if (!isPlainObject(file) || typeof file.name !== 'string' || file.name.includes('/') || file.name.includes('\\')
        || !Number.isSafeInteger(file.size) || file.size < 0
        || typeof file.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(file.sha256)
        || !githubAssetUrl(file.url, repository)) {
        fail(`release file metadata is invalid: ${target}`);
      }
      const publishedAsset = assets.get(file.name);
      if (!publishedAsset || publishedAsset.size !== file.size
        || canonicalReleaseUrl(publishedAsset.browser_download_url, repository) !== canonicalReleaseUrl(file.url, repository)) {
        fail(`release manifest references a missing or mismatched asset: ${file.name}`);
      }
      files.push({ name: file.name, url: canonicalReleaseUrl(publishedAsset.browser_download_url, repository), size: file.size, sha256: file.sha256 });
    }
    platforms[target] = { automaticUpdate: platform.automaticUpdate, files };
  }

  return {
    version: manifest.version,
    baseVersion: manifest.baseVersion,
    channel: manifest.channel,
    publishedAt: release.published_at,
    tag: release.tag_name,
    releaseUrl: canonicalReleaseUrl(manifest.releaseUrl, repository),
    commit: manifest.commit,
    ...(manifest.buildSource === 'local' ? { buildSource: 'local' } : {}),
    runNumber: manifest.runNumber,
    runAttempt: manifest.runAttempt,
    platforms,
  };
}

function buildDownloadIndex(records, options = {}) {
  if (!Array.isArray(records)) fail('input must contain a releases array');
  const repository = safeRepository(options.repository || DEFAULT_REPOSITORY);
  const releases = records.map(record => normalizeRelease(record, repository)).filter(Boolean)
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  return {
    schemaVersion: 1,
    generatedAt: options.generatedAt || new Date().toISOString(),
    releases,
  };
}

function runGh(args) {
  return execFileSync('gh', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

async function fetchReleaseRecordsWithGh(repository, options = {}) {
  const gh = options.runGh || runGh;
  let releases;
  try { releases = JSON.parse(gh(['api', `repos/${repository}/releases?per_page=100`])); }
  catch { fail('Unable to read public GitHub release metadata with gh api'); }
  if (!Array.isArray(releases)) fail('GitHub releases response must be an array');
  const records = [];
  for (const release of releases) {
    if (!release || release.draft || release.prerelease !== true || !Array.isArray(release.assets)) continue;
    const manifestAsset = release.assets.find(asset => asset && asset.name === 'release-manifest.json');
    if (!manifestAsset) continue;
    if (typeof release.tag_name !== 'string' || typeof manifestAsset.browser_download_url !== 'string'
      || !githubAssetUrl(manifestAsset.browser_download_url, repository)) {
      fail('release manifest asset URL is invalid');
    }
    const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'talia-release-manifest-'));
    try {
      gh(['release', 'download', release.tag_name, '--repo', repository, '--pattern', 'release-manifest.json', '--dir', temporaryDirectory]);
      const manifestBytes = fs.readFileSync(path.join(temporaryDirectory, 'release-manifest.json'));
      if (manifestBytes.length > MAX_MANIFEST_BYTES) fail('release manifest is too large');
      let manifest;
      try { manifest = JSON.parse(manifestBytes.toString('utf8')); } catch { fail('release manifest is not valid JSON'); }
      records.push({ release, manifest });
    } catch (error) {
      if (error instanceof Error && error.message === 'release manifest is too large') throw error;
      if (error instanceof Error && error.message === 'release manifest is not valid JSON') throw error;
      fail(`Unable to download release-manifest.json for ${release.tag_name}`);
    } finally {
      fs.rmSync(temporaryDirectory, { recursive: true, force: true });
    }
  }
  return records;
}

function parseArgs(argv) {
  const args = { input: '', output: path.resolve(__dirname, '..', 'site', 'releases.json'), repository: process.env.TALIA_RELEASE_REPOSITORY || process.env.GITHUB_REPOSITORY || DEFAULT_REPOSITORY };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--input') args.input = argv[++i] || '';
    else if (argv[i] === '--output') args.output = path.resolve(argv[++i] || '');
    else if (argv[i] === '--repository') args.repository = argv[++i] || '';
    else fail(`unknown option: ${argv[i]}`);
  }
  if (args.input && !fs.existsSync(args.input)) fail(`input file does not exist: ${args.input}`);
  return args;
}

function writeAtomic(filePath, contents) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.${process.pid}.tmp`;
  fs.writeFileSync(temporaryPath, contents, { mode: 0o644 });
  fs.renameSync(temporaryPath, filePath);
}

async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const repository = safeRepository(args.repository);
  let records;
  if (args.input) {
    const input = JSON.parse(fs.readFileSync(args.input, 'utf8'));
    records = Array.isArray(input) ? input : input && input.releases;
  } else records = await fetchReleaseRecordsWithGh(repository);
  const index = buildDownloadIndex(records, { repository });
  writeAtomic(args.output, `${JSON.stringify(index, null, 2)}\n`);
  process.stdout.write(`Download site index: ${index.releases.length} verified release(s) -> ${args.output}\n`);
}

if (require.main === module) {
  main().catch(error => {
    process.stderr.write(`Download site build failed: ${error.message}\n`);
    process.exitCode = 1;
  });
}

module.exports = { buildDownloadIndex, fetchReleaseRecordsWithGh, normalizeRelease, parseManifest };
