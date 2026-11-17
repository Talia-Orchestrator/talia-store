'use strict';

// Percorsi relativi al file, indipendenti dal prefisso GitHub Pages.
window.TaliaI18n = (() => {
  const assetRoot = new URL('./', document.currentScript.src);
  const storageKey = 'talia-site-language';
  let locales = [];
  let tables = { en: {"title": "Download Talia", "description": "Coordinate AI agents, use your documents and turn recurring tasks into organized work.", "skip": "Skip to content", "home": "Home", "nav": "Download app", "language": "Language", "releases": "GitHub releases", "desktop": "Talia for desktop", "hero": "Your team. Not another chatbot.", "intro": "Coordinate AI agents, use your documents and turn recurring tasks into organized work.", "download": "Download Talia", "learn": "Explore the workflow", "availability": "macOS, Windows and Linux · availability varies by release. Preview software.", "shotLabel": "Screenshot to add · 16:10", "shotCaption": "Add real screenshots, not simulated interfaces. Use demo content without personal data.", "shot1": "Your next project, here.", "shot1body": "Show a project with Commander, your team and documents.", "workflow": "From documents to work delivered.", "benefit1": "Your documents become context.", "b1body": "Keep sources in your project. Once the index is ready, retrieve relevant passages and ask for answers with document references.", "benefit2": "Work does not get lost in chat.", "b2body": "Track tasks, assignments and progress on the Kanban board. See what needs doing, what is in progress and what needs checking.", "benefit3": "Your team. Your choice of models.", "b3body": "Bring in specialists for research, writing and development. Choose models, skills and connectors compatible with the work and granted permissions.", "capabilities": "Capabilities depend on models, installed resources, configured services and permissions. External services may require separate accounts and fees.", "story2": "Your sources. Not a blank start.", "shot2body": "Show project documents and a response with source references.", "story3": "Plan it once. Follow the work every day.", "shot3body": "Show a demo project Kanban: daily tasks, assignments and a briefing you can open.", "choose": "Choose your system", "all": "All releases", "notes": "Before you install", "warning": "Current macOS packages are ad hoc signed and not notarized; installation is manual. Windows and Linux packages lack Authenticode or AppImage signatures. Security warnings may appear. Automatic updates apply only to packages marked below.", "integrity": "SHA-256 checks file integrity, not author identity or software safety.", "source": "Public code and resources", "loading": "Loading available releases…", "unavailable": "Download unavailable in this release.", "portable": "Extract the ZIP and run Talia.exe", "automatic": "automatic updates supported", "manual": "manual update", "checksum": "SHA-256 checksum", "latest": "Preview · latest", "preview": "Preview", "assets": "Notes and assets", "date": "Date unavailable", "technical": "Release technical details", "local": "Local build", "empty": "No verified releases available. Try later or visit GitHub releases.", "error": "Unable to read the release index. View the assets on GitHub.", "count": "Preview releases available: {count}.", "none": "No published releases.", "indexError": "Release index unavailable.", "for": "for", "languageError": "Language unavailable. Try again.", "portableTarget": "Windows · portable", "downloadFormat": "Download {format}", "bits": "64 bit", "build": "Build", "commit": "commit", "sessionOnly": "Language selected for this session only: browser storage is unavailable.", "manualLink": "Talia manual", "cycle1": "Schedule — An automation requests tasks for the project briefing every morning.", "cycle2": "Organize — The request creates daily Kanban tasks, with expected outputs and sources to consult.", "cycle3": "Advance — With backlog execution enabled, available agents work on authorized tasks.", "cycle4": "Review — Open the briefing, check references and handle any approval requests.", "cycleNote": "Example of a configurable workflow, not a live demo. Scheduling and backlog execution are separate: creating a task does not start it. The app must be available, documents indexed, and resources and permissions ready; blockers and approvals need your input."} };
  let current = 'en';
  let sequence = 0;
  const selector = document.querySelector('#language-select');
  const status = document.createElement('p');
  status.className = 'language-status';
  status.setAttribute('role', 'status');
  selector.closest('header').after(status);

  function normalize(value) {
    if (typeof value !== 'string') return null;
    const tag = value.trim().replace(/_/g, '-');
    const exact = tag.toLowerCase();
    if (locales.some(locale => locale.code === exact)) return exact;
    try {
      const locale = new Intl.Locale(tag);
      const base = locale.language;
      if (base === 'zh') return locale.maximize().script === 'Hant' ? 'zh-tw' : 'zh';
      if (base === 'pt' && locale.region && locale.region !== 'BR') return 'pt-pt';
      if (base === 'es' && ['419', 'AR', 'BO', 'BR', 'BZ', 'CL', 'CO', 'CR', 'CU', 'DO', 'EC', 'GT', 'HN', 'MX', 'NI', 'PA', 'PE', 'PR', 'PY', 'SV', 'US', 'UY', 'VE'].includes(locale.region || '')) return 'es-419';
      return locales.some(item => item.code === base) ? base : null;
    } catch { return null; }
  }

  function t(key, values = {}) {
    const text = tables[current]?.[key] ?? tables.en?.[key] ?? key;
    return text.replace(/\{(\w+)\}/g, (match, name) => values[name] == null ? match : String(values[name]));
  }

  async function load(code) {
    if (tables[code]) return;
    const response = await fetch(new URL(`locales/${code}.json`, assetRoot));
    if (!response.ok) throw new Error('locale unavailable');
    const table = await response.json();
    if (!table || !Object.values(table).every(value => typeof value === 'string')) throw new Error('locale invalid');
    tables[code] = table;
  }

  function apply() {
    const meta = locales.find(locale => locale.code === current);
    document.documentElement.lang = meta.htmlLang;
    document.documentElement.dir = current === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-i18n]').forEach(node => { node.textContent = t(node.dataset.i18n); });
    document.querySelectorAll('[data-i18n-content]').forEach(node => { node.content = t(node.dataset.i18nContent); });
    selector.value = current;
    status.textContent = '';
    window.dispatchEvent(new CustomEvent('talia-language-change'));
  }

  async function setLanguage(value, persist = true) {
    const code = normalize(value) || 'en';
    const request = ++sequence;
    try {
      await load(code);
      if (request !== sequence) return;
      current = code;
      apply();
      if (persist) {
        try { localStorage.setItem(storageKey, code); } catch { status.textContent = t('sessionOnly'); }
      }
    } catch {
      if (request !== sequence) return;
      selector.value = current;
      status.textContent = t('languageError');
    }
  }

  const ready = (async () => {
    try {
      const response = await fetch(new URL('locale-meta.json', assetRoot));
      if (!response.ok) throw new Error('locale metadata unavailable');
      locales = await response.json();
      await load('en');
      selector.replaceChildren(...locales.map(locale => {
        const option = document.createElement('option');
        option.value = locale.code;
        option.lang = locale.htmlLang;
        option.textContent = locale.label;
        return option;
      }));
      let saved;
      try { saved = localStorage.getItem(storageKey); } catch { /* Storage non disponibile: usa le lingue del browser. */ }
      const initial = normalize(saved) || (navigator.languages || [navigator.language]).map(normalize).find(Boolean) || 'en';
      await setLanguage(initial, false);
      selector.disabled = false;
      selector.addEventListener('change', () => setLanguage(selector.value));
    } catch {
      // Il contenuto inglese e i link GitHub rimangono utilizzabili senza traduzioni.
      status.lang = 'en';
      status.textContent = 'Language files unavailable. Reload to retry.';
    }
  })();

  return { ready, t, setLanguage, normalize, get language() { return current; }, get locale() { return locales.find(item => item.code === current)?.intlLocale || 'en-US'; } };
})();
