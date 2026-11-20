'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const vm = require('node:vm');
const { buildDownloadIndex, fetchReleaseRecordsWithGh, parseManifest } = require('../scripts/build-download-site.cjs');

const REPOSITORY = 'Talia-Orchestrator/talia-store';
const COMMIT = '0123456789abcdef0123456789abcdef01234567';
const TAG = 'v0.7.0-main.6.1';
const ROOT_URL = `https://github.com/${REPOSITORY}/releases/download/${TAG}`;

test('download accessible names include the visible format for every published installer', () => {
  const document = {
    createElement(tag) {
      return { tag, children: [], attributes: {}, append(...children) { this.children.push(...children); },
        setAttribute(name, value) { this.attributes[name] = value; } };
    },
  };
  const context = vm.createContext({ document, URL, Intl });
  const script = fs.readFileSync(path.join(__dirname, '../site/app.js'), 'utf8');
  vm.runInContext(script.split('// Avvio dopo la selezione della lingua')[0], context);
  const index = JSON.parse(fs.readFileSync(path.join(__dirname, '../site/releases.json'), 'utf8'));
  let checked = 0;
  const formats = new Set();
  for (const release of index.releases) {
    context.release = release;
    const cards = vm.runInContext('TARGETS.map(target => makePlatformCard(release, target))', context);
    for (const card of cards.filter(Boolean)) {
      const link = card.children.find(child => child.tag === 'a');
      if (!link) continue;
      assert.ok(link.attributes['aria-label'].startsWith(`${link.textContent} — Talia ${release.baseVersion} per `));
      assert.ok(Object.values(release.platforms).some(platform => platform.files.some(file => file.url === link.href)));
      formats.add(link.textContent);
      checked += 1;
    }
  }
  assert.ok(checked > 0);
  for (const format of ['DMG', 'EXE', 'ZIP', 'APPIMAGE']) assert.ok(formats.has(`Scarica ${format}`));
});

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

function localRecord() {
  const source = record();
  source.release.tag_name = 'v0.8.1';
  const manifest = source.manifest;
  Object.assign(manifest, { version: '0.8.1', baseVersion: '0.8.1', buildSource: 'local',
    releaseUrl: `https://github.com/${REPOSITORY}/releases/tag/v0.8.1` });
  delete manifest.runNumber;
  delete manifest.runAttempt;
  manifest.platforms = { 'darwin-arm64': manifest.platforms['darwin-arm64'] };
  return source;
}

test('local manual release is indexed without invented CI metadata', () => {
  const release = buildDownloadIndex([localRecord()]).releases[0];
  assert.equal(release.version, '0.8.1');
  assert.equal(release.buildSource, 'local');
  assert.equal(release.runNumber, undefined);
  assert.deepEqual(Object.keys(release.platforms), ['darwin-arm64']);
});

test('local manual release can include both Windows downloads alongside the Mac download', () => {
  const source = localRecord();
  const name = 'Talia-0.8.1-win-x64.exe';
  const url = `https://github.com/${REPOSITORY}/releases/download/v0.8.1/${name}`;
  const file = { name, url, size: 1024, sha256: 'a'.repeat(64) };
  source.release.assets.push({ name, size: file.size, browser_download_url: url });
  const zip = { ...file, name: name.replace('.exe', '.zip'), url: url.replace('.exe', '.zip') };
  source.release.assets.push({ name: zip.name, size: zip.size, browser_download_url: zip.url });
  source.manifest.platforms['win32-x64'] = { automaticUpdate: false, files: [file, zip] };
  const release = buildDownloadIndex([source]).releases[0];
  assert.deepEqual(release.platforms['win32-x64'], { automaticUpdate: false, files: [file, zip] });
});

test('local exception rejects unsupported platforms, updater, wrong tag and fabricated CI runs', () => {
  for (const mutate of [
    s => { s.manifest.platforms['linux-x64'] = s.manifest.platforms['darwin-arm64']; },
    s => { s.manifest.platforms['win32-x64'] = s.manifest.platforms['darwin-arm64']; },
    s => { s.manifest.platforms['darwin-arm64'].automaticUpdate = true; },
    s => { s.release.tag_name = 'v0.8.2'; },
    s => { s.manifest.runNumber = 1; },
    s => { s.manifest.platforms['darwin-arm64'].files = []; },
  ]) {
    const source = localRecord();
    mutate(source);
    assert.throws(() => buildDownloadIndex([source]), /local release/);
  }
  const missing = localRecord();
  missing.release.assets = [];
  assert.throws(() => buildDownloadIndex([missing]), /missing or mismatched/);
});

test('editorial landing keeps the interactive scenes and the download entry point', () => {
  const html = fs.readFileSync(path.join(__dirname, '../site/index.html'), 'utf8');
  // Gli screenshot statici restano esclusi: la landing usa scene HTML animate con badge di simulazione onesto.
  assert.equal((html.match(/<figure class="screenshot-placeholder/g) || []).length, 0);
  // Le scene dimostrative sono inline e dichiarate, non una replica dell'app a schermo intero.
  assert.match(html, /class="[^"]*\bteam-scene\b/);
  assert.match(html, /class="[^"]*\bsources-scene\b/);
  assert.match(html, /class="[^"]*\bkanban-scene\b/);
  assert.match(html, /data-i18n="demoMicrocopy"/);
  assert.match(html, /href="download-app\/"/);
  assert.doesNotMatch(html, /id="release-list"|app\.js|releases\/download\//);
  assert.match(html, /no real execution/);
});

test('team landing preserves the agreed headline and the subscription promise', () => {
  const site = path.join(__dirname, '../site');
  const html = fs.readFileSync(path.join(site, 'index.html'), 'utf8');
  const it = JSON.parse(fs.readFileSync(path.join(site, 'locales/it.json'), 'utf8'));
  assert.equal(it.hero, 'La tua squadra. Non un altro chatbot.');
  // Il messaggio "non solo API" deve essere ben visibile, non nascosto in una nota tecnica.
  assert.match(it.accessHeadline, /Non solo API/);
  assert.match(it.accessHeadline, /abbonamenti supportati/);
  assert.match(html, /data-i18n="accessHeadline"/);
  assert.match(html, /data-i18n="accessOauth"/);
  assert.match(html, /data-i18n="accessApi"/);
  assert.match(html, /data-i18n="accessCli"/);
  // Nessuna promessa universale o di uso illimitato.
  assert.match(it.accessNote, /Non universale né illimitato/);
  // Nessuna promessa di pubblicazione delle app interne.
  assert.doesNotMatch(JSON.stringify(it), /pubblicabil/i);
  assert.match(it.dResultSaved, /ambiente Talia/);
});

test('landing is mobile-first with progressive animations and reduced-motion support', () => {
  const site = path.join(__dirname, '../site');
  const html = fs.readFileSync(path.join(site, 'index.html'), 'utf8');
  const css = fs.readFileSync(path.join(site, 'landing.css'), 'utf8');
  const js = fs.readFileSync(path.join(site, 'landing.js'), 'utf8');
  // Impaginazione mobile-first: le griglie partono a colonna singola.
  assert.match(css, /grid-template-columns:\s*1fr;/);
  assert.match(css, /@media \(min-width: 900px\)/);
  // Viewport mobile con supporto safe-area.
  assert.match(html, /width=device-width, initial-scale=1/);
  // Animazioni progressive: rivelazione allo scroll e transizioni su transform/opacity.
  assert.match(css, /\.reveal\s*\{/);
  assert.match(css, /\.reveal\.armed/);
  assert.match(css, /\.reveal\.armed\.in/);
  assert.match(js, /IntersectionObserver/);
  assert.match(js, /prefers-reduced-motion/);
  // Reduced-motion: le animazioni non devono impedire l'accesso al contenuto.
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /\.reveal \{ opacity: 1; transform: none; \}/);
  // Nessun contenuto nascosto senza JavaScript: il fallback 'not(.armed)'
  // deve tenere il testo visibile quando lo script non viene eseguito.
  assert.match(css, /\.reveal:not\(\.armed\) \{ opacity: 1; transform: none; \}/);
  assert.doesNotMatch(css, /\.reveal-ready/);
  // Scroll naturale: nessuna altezza rigida e nessuno scroll-snap obbligatorio.
  assert.doesNotMatch(css, /scroll-snap/);
  assert.doesNotMatch(css, /100svh|100vh/);
  // La scena persistente (sticky) vale solo da 900px in su: su mobile
  // il layout resta a stacking naturale.
  const stickyBlock = css.match(/@media \(min-width: 900px\) \{[\s\S]*?\.feature-scene \{ position: sticky;[^}]*\}/);
  assert.ok(stickyBlock, 'la scena sticky deve stare dentro il breakpoint desktop');
  // Target touch da 44px per i controlli interattivi principali.
  assert.match(css, /@media \(pointer: coarse\), \(max-width: 640px\)/);
  assert.match(css, /\.cite \{ min-width: 44px; min-height: 44px; \}/);
  // Lo scroll-driven CSS e' solo un miglioramento opzionale.
  assert.match(css, /@supports \(animation-timeline: view\(\)\)/);
  // Nessuna animazione basata su width/height/top/left (solo transform e opacity).
  const animated = css.match(/@keyframes[\s\S]*?\}/g) || [];
  assert.ok(animated.length >= 3, 'attese almeno tre animazioni chiave');
  for (const block of animated) {
    assert.doesNotMatch(block, /transition:.*\b(width|height|top|left)\b/, block);
  }
  // Nessuna dipendenza esterna: il sito resta statico e autonomo.
  assert.doesNotMatch(html, /<script[^>]+src="https?:/);
  assert.doesNotMatch(css, /url\(https?:/);
});
