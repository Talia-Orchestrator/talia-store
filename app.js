'use strict';

const LEGACY_TEXT = {
  "build": "Build",
  "commit": "commit",
  "bits": "64 bit",
  "portableTarget": "Windows · senza installazione",
  "downloadFormat": "Scarica {format}",
  "unavailable": "Download non disponibile in questa release.",
  "portable": "Estrai lo ZIP e avvia Talia.exe",
  "automatic": "aggiornamenti automatici supportati",
  "manual": "aggiornamento manuale",
  "checksum": "Checksum SHA-256",
  "latest": "Anteprima · più recente",
  "preview": "Anteprima",
  "assets": "Note e asset",
  "date": "Data non disponibile",
  "technical": "Dettagli tecnici della release",
  "local": "Compilazione locale",
  "empty": "Nessuna release verificata disponibile. Riprova più tardi o consulta le release su GitHub.",
  "error": "Impossibile leggere l’indice delle release. Consulta gli asset su GitHub.",
  "count": "Release di anteprima disponibili: {count}.",
  "none": "Nessuna release pubblicata.",
  "indexError": "Indice release non raggiungibile.",
  "for": "per",
  "loading": "Caricamento delle release disponibili…"
};
const translate = (key, values = {}) => typeof TaliaI18n !== 'undefined' ? TaliaI18n.t(key, values)
  : (LEGACY_TEXT[key] || key).replace(/\{(\w+)\}/g, (match, name) => values[name] == null ? match : String(values[name]));
const numberLocale = () => typeof TaliaI18n !== 'undefined' ? TaliaI18n.locale : 'it-IT';
const releaseIndexUrl = typeof document.currentScript?.src === 'string' ? new URL('releases.json', document.currentScript.src).href : 'releases.json';

const TARGETS = [
  { id: 'darwin-arm64', title: 'macOS · Apple Silicon', extension: '.dmg' },
  { id: 'darwin-x64', title: 'macOS · Intel', extension: '.dmg' },
  { id: 'win32-x64', title: 'Windows · 64 bit', extension: '.exe' },
  { id: 'win32-x64', title: 'Windows · senza installazione', extension: '.zip', optional: true },
  { id: 'linux-x64', title: 'Linux · 64 bit', extension: '.appimage' },
  { id: 'linux-x64', title: 'Debian / Ubuntu · amd64', extension: '.deb', optional: true },
];

function safeDownloadUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'github.com'
      && url.pathname.startsWith('/Talia-Orchestrator/talia-store/releases/download/');
  } catch {
    return false;
  }
}

function safeReleaseUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'github.com'
      && url.pathname.startsWith('/Talia-Orchestrator/talia-store/releases/tag/');
  } catch {
    return false;
  }
}

function formatSize(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${new Intl.NumberFormat(numberLocale(), { maximumFractionDigits: unit === 0 ? 0 : 1 }).format(value)} ${units[unit]}`;
}

function findPrimaryFile(platform, extension) {
  if (!platform || !Array.isArray(platform.files)) return null;
  return platform.files.find(file => file.name.toLowerCase().endsWith(extension) && safeDownloadUrl(file.url)) || null;
}

function makePlatformCard(release, target) {
  const card = document.createElement('section');
  card.className = 'platform-card';
  const heading = document.createElement('h4');
  heading.className = 'platform-title';
  const targetTitle = target.extension === '.zip' ? translate('portableTarget') : target.title.replace('64 bit', translate('bits'));
  heading.textContent = targetTitle;
  card.append(heading);

  const platform = release.platforms && release.platforms[target.id];
  const file = findPrimaryFile(platform, target.extension);
  if (!file && target.optional) return null;
  if (!file) {
    const unavailable = document.createElement('p');
    unavailable.className = 'unavailable';
    unavailable.textContent = translate('unavailable');
    card.append(unavailable);
    return card;
  }

  const link = document.createElement('a');
  link.className = 'download-button';
  link.href = file.url;
  link.textContent = translate('downloadFormat', { format: target.extension.slice(1).toUpperCase() });
  link.setAttribute('aria-label', `${link.textContent} — Talia ${release.baseVersion} ${translate('for')} ${targetTitle}`);
  card.append(link);

  const metadata = document.createElement('p');
  metadata.className = 'file-meta';
  const usage = target.extension === '.zip' ? translate('portable')
    : target.extension !== '.deb' && platform.automaticUpdate ? translate('automatic') : translate('manual');
  metadata.textContent = `${file.name} · ${formatSize(file.size)} · ${usage}`;

  const checksum = document.createElement('details');
  checksum.className = 'checksum';
  const summary = document.createElement('summary');
  summary.textContent = translate('checksum');
  const digest = document.createElement('code');
  digest.textContent = file.sha256;
  checksum.append(summary, metadata, digest);
  card.append(checksum);
  return card;
}

function makeReleaseCard(release, index) {
  const card = document.createElement('article');
  card.className = 'release-card';
  const top = document.createElement('div');
  top.className = 'release-top';
  const title = document.createElement('h3');
  title.className = 'release-version';
  title.textContent = `Talia ${release.baseVersion}`;
  top.append(title);

  const badge = document.createElement('span');
  badge.className = 'badge';
  badge.textContent = index === 0 ? translate('latest') : translate('preview');
  top.append(badge);

  const notes = document.createElement('a');
  notes.href = release.releaseUrl;
  notes.textContent = translate('assets');
  notes.target = '_blank';
  notes.rel = 'noopener noreferrer';

  card.append(top);

  const metadata = document.createElement('p');
  metadata.className = 'release-meta';
  const date = new Date(release.publishedAt);
  const dateText = Number.isNaN(date.valueOf()) ? translate('date') : new Intl.DateTimeFormat(numberLocale(), { dateStyle: 'long', timeZone: 'UTC' }).format(date);
  metadata.textContent = dateText;

  const technical = document.createElement('details');
  technical.className = 'release-technical';
  const technicalSummary = document.createElement('summary');
  technicalSummary.textContent = translate('technical');
  const technicalText = document.createElement('p');
  technicalText.append(document.createTextNode(`${release.buildSource === 'local' ? translate('local') : `${translate('build')} ${release.runNumber}.${release.runAttempt}`} · ${translate('commit')} `));
  const commit = document.createElement('code');
  commit.textContent = String(release.commit).slice(0, 12);
  technicalText.append(commit);
  technical.append(technicalSummary, metadata, technicalText, notes);
  card.append(technical);

  const grid = document.createElement('div');
  grid.className = 'platform-grid';
  for (const target of TARGETS) {
    const platformCard = makePlatformCard(release, target);
    if (platformCard) grid.append(platformCard);
  }
  card.append(grid);
  return card;
}

let cachedIndex = null;
let renderSequence = 0;
async function renderDownloads() {
  const request = ++renderSequence;
  const list = document.querySelector('#release-list');
  const summary = document.querySelector('#release-summary');
  try {
    const data = cachedIndex || await (async () => {
      const response = await fetch(releaseIndexUrl, { cache: 'no-store' });
      if (!response.ok) throw new Error('release index request failed');
      return response.json();
    })();
    if (request !== renderSequence) return;
    if (!data || data.schemaVersion !== 1 || !Array.isArray(data.releases)) throw new Error('release index invalid');
    cachedIndex = data;
    const releases = data.releases.filter(release => release && release.channel === 'main'
      && typeof release.version === 'string' && /^\d+\.\d+\.\d+$/.test(release.baseVersion)
      && safeReleaseUrl(release.releaseUrl));
    list.replaceChildren();
    if (releases.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = translate('empty');
      list.append(empty);
      summary.textContent = translate('none');
      return;
    }
    releases.forEach((release, index) => list.append(makeReleaseCard(release, index)));
    summary.textContent = translate('count', { count: new Intl.NumberFormat(numberLocale()).format(releases.length) });
  } catch {
    if (request !== renderSequence) return;
    list.replaceChildren();
    const error = document.createElement('p');
    error.className = 'error-state';
    error.textContent = translate('error');
    list.append(error);
    summary.textContent = translate('indexError');
  }
}

// Avvio dopo la selezione della lingua; la home storica resta compatibile.
if (typeof TaliaI18n !== 'undefined') {
  TaliaI18n.ready.then(() => {
    renderDownloads();
    window.addEventListener('talia-language-change', renderDownloads);
  });
} else {
  renderDownloads();
}
