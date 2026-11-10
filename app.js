'use strict';

const TARGETS = [
  { id: 'darwin-arm64', title: 'macOS · Apple Silicon', extension: '.dmg' },
  { id: 'darwin-x64', title: 'macOS · Intel', extension: '.dmg' },
  { id: 'win32-x64', title: 'Windows · 64 bit', extension: '.exe' },
  { id: 'linux-x64', title: 'Linux · 64 bit', extension: '.appimage' },
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
  return `${new Intl.NumberFormat('it-IT', { maximumFractionDigits: unit === 0 ? 0 : 1 }).format(value)} ${units[unit]}`;
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
  heading.textContent = target.title;
  card.append(heading);

  const platform = release.platforms && release.platforms[target.id];
  const file = findPrimaryFile(platform, target.extension);
  if (!file) {
    const unavailable = document.createElement('p');
    unavailable.className = 'unavailable';
    unavailable.textContent = 'Download non disponibile in questa release.';
    card.append(unavailable);
    return card;
  }

  const link = document.createElement('a');
  link.className = 'download-button';
  link.href = file.url;
  link.textContent = `Scarica ${target.extension.slice(1).toUpperCase()}`;
  link.setAttribute('aria-label', `Scarica Talia ${release.version} per ${target.title}`);
  card.append(link);

  const metadata = document.createElement('p');
  metadata.className = 'file-meta';
  metadata.textContent = `${file.name} · ${formatSize(file.size)}${platform.automaticUpdate ? ' · aggiornamenti automatici supportati' : ' · aggiornamento manuale'}`;
  card.append(metadata);

  const checksum = document.createElement('details');
  checksum.className = 'checksum';
  const summary = document.createElement('summary');
  summary.textContent = 'Checksum SHA-256';
  const digest = document.createElement('code');
  digest.textContent = file.sha256;
  checksum.append(summary, digest);
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
  title.textContent = release.version;
  top.append(title);

  const badge = document.createElement('span');
  badge.className = 'badge';
  badge.textContent = index === 0 ? 'Anteprima · più recente' : 'Anteprima';
  top.append(badge);

  const notes = document.createElement('a');
  notes.href = release.releaseUrl;
  notes.textContent = 'Note e asset';
  notes.target = '_blank';
  notes.rel = 'noopener noreferrer';
  top.append(notes);
  card.append(top);

  const metadata = document.createElement('p');
  metadata.className = 'release-meta';
  const date = new Date(release.publishedAt);
  const dateText = Number.isNaN(date.valueOf()) ? 'Data non disponibile' : new Intl.DateTimeFormat('it-IT', { dateStyle: 'long', timeZone: 'UTC' }).format(date);
  metadata.append(document.createTextNode(`${dateText} · ${release.buildSource === 'local' ? 'compilazione locale · solo macOS Apple Silicon' : `build ${release.runNumber}.${release.runAttempt}`} · commit `));
  const commit = document.createElement('code');
  commit.textContent = String(release.commit).slice(0, 12);
  metadata.append(commit);
  card.append(metadata);

  const grid = document.createElement('div');
  grid.className = 'platform-grid';
  for (const target of TARGETS) grid.append(makePlatformCard(release, target));
  card.append(grid);
  return card;
}

async function renderDownloads() {
  const list = document.querySelector('#release-list');
  const summary = document.querySelector('#release-summary');
  try {
    const response = await fetch('releases.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('release index request failed');
    const data = await response.json();
    if (!data || data.schemaVersion !== 1 || !Array.isArray(data.releases)) throw new Error('release index invalid');
    const releases = data.releases.filter(release => release && release.channel === 'main'
      && typeof release.version === 'string' && safeReleaseUrl(release.releaseUrl));
    list.replaceChildren();
    if (releases.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = 'Non ci sono ancora release verificate disponibili per il download. Riprova più tardi oppure consulta la pagina Release su GitHub.';
      list.append(empty);
      summary.textContent = 'Nessuna release pubblicata.';
      return;
    }
    releases.forEach((release, index) => list.append(makeReleaseCard(release, index)));
    summary.textContent = `${releases.length} release di anteprima disponibile${releases.length === 1 ? '' : 'i'}.`;
  } catch {
    list.replaceChildren();
    const error = document.createElement('p');
    error.className = 'error-state';
    error.textContent = 'Non riesco a leggere l’indice delle release. Puoi consultare gli asset direttamente su GitHub.';
    list.append(error);
    summary.textContent = 'Indice release non raggiungibile.';
  }
}

renderDownloads();
