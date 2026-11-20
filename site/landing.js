/* Landing Talia — micro-interazioni per le scene dimostrative.
   Nessun backend, nessuna fetch, dati demo inline. Nessuna replica integrale dell'app. */
'use strict';

(function () {
  const i18n = typeof TaliaI18n !== 'undefined' ? TaliaI18n : null;
  const t = (k, v) => {
    const r = i18n ? i18n.t(k, v) : k;
    return (r == null || r === '') ? k : r;
  };
  const reduceMotion = typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : { matches: false };

  const ready = i18n ? i18n.ready : Promise.resolve();

  // ---------- Dati demo ----------
  const STORE = [
    { id: 'code-review', type: 'agentNative', typeKey: 'agentNative', name: 'sCodeReview', desc: 'sCodeReviewDesc', color: '#0a7350', cli: false },
    { id: 'data-analyst', type: 'agentNative', typeKey: 'agentNative', name: 'sDataAnalyst', desc: 'sDataAnalystDesc', color: '#8a4b06', cli: false },
    { id: 'pdf-reader', type: 'skillType', typeKey: 'skillType', name: 'sPdfReader', desc: 'sPdfReaderDesc', color: '#5b57d6', cli: false },
    { id: 'web-search', type: 'skillType', typeKey: 'skillType', name: 'sWebSearch', desc: 'sWebSearchDesc', color: '#5b57d6', cli: false },
    { id: 'github', type: 'connectorType', typeKey: 'connectorType', name: 'sGithub', desc: 'sGithubDesc', color: '#111827', cli: false },
    { id: 'notion', type: 'connectorType', typeKey: 'connectorType', name: 'sNotion', desc: 'sNotionDesc', color: '#111827', cli: false },
    { id: 'claude', type: 'cliType', typeKey: 'cliType', name: 'sClaude', desc: 'sClaudeDesc', color: '#8a4b06', cli: true },
    { id: 'codex', type: 'cliType', typeKey: 'cliType', name: 'sCodex', desc: 'sCodexDesc', color: '#111827', cli: true },
  ];

  const TRUST_LEVELS = {
    cautious: { fill: '20%', body: 'permCautiousBody', states: { on: 1, ask: 1, off: 2 } },
    standard: { fill: '55%', body: 'permStandardBody', states: { on: 2, ask: 1, off: 1 } },
    trusted:  { fill: '100%', body: 'permTrustedBody', states: { on: 3, ask: 0, off: 1 } },
  };

  // ---------- Helper escaping ----------
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));

  // ---------- Toast ----------
  let toastTimer;
  function toast(text) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = text;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2400);
  }

  // ---------- Reveal on scroll ----------
  function bindReveal() {
    if (!('IntersectionObserver' in window)) {
      // Fallback: mostra subito.
      document.querySelectorAll('.reveal').forEach((n) => n.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });
    // Gli elementi già in viewport entrano subito, senza attendere lo scroll.
    document.querySelectorAll('.reveal').forEach((n) => {
      const rect = n.getBoundingClientRect();
      if (rect.top < (window.innerHeight || 0) * 0.92 && rect.bottom > 0) {
        n.classList.add('in');
        return;
      }
      // Solo gli elementi ANCORA fuori dal viewport possono essere nascosti:
      // il contenuto già visibile non deve mai dipendere dal JS per apparire.
      n.classList.add('armed');
    });
    document.querySelectorAll('.reveal.armed').forEach((n) => io.observe(n));
  }

  // ---------- Store grid ----------
  function renderStore() {
    const grid = document.getElementById('store-grid');
    if (!grid) return;
    const added = readAdded();
    grid.innerHTML = STORE.map((item) => {
      const isAdded = added.includes(item.id);
      return (
        '<li class="store-card' + (item.cli ? ' is-cli' : '') + (isAdded ? ' is-added' : '') + '">' +
        '<span class="type">' + esc(t(item.typeKey)) + '</span>' +
        '<h3>' + esc(t(item.name)) + '</h3>' +
        '<p>' + esc(t(item.desc)) + '</p>' +
        (item.cli ? '<span class="cli-tag">' + esc(t('accessCliShort')) + '</span>' : '') +
        '<button type="button" class="store-add" data-add="' + esc(item.id) + '"' + (isAdded ? ' disabled aria-disabled="true"' : '') + '>' +
        esc(t(isAdded ? 'installed' : 'install')) + '</button>' +
        '</li>'
      );
    }).join('');
  }

  function readAdded() {
    try { return JSON.parse(sessionStorage.getItem('talia-store-added') || '[]'); }
    catch { return []; }
  }
  function writeAdded(ids) {
    try { sessionStorage.setItem('talia-store-added', JSON.stringify(ids)); } catch { /* noop */ }
  }

  function bindStore() {
    const grid = document.getElementById('store-grid');
    if (!grid) return;
    grid.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-add]');
      if (!btn || btn.disabled) return;
      const id = btn.dataset.add;
      const ids = readAdded();
      if (!ids.includes(id)) ids.push(id);
      writeAdded(ids);
      renderStore();
      const item = STORE.find((s) => s.id === id);
      toast(t('toastInstalled') + (item && item.cli ? ' · ' + t('accessCliShort') : ''));
    });
  }

  // ---------- Trust toggle ----------
  function bindTrust() {
    const buttons = document.querySelectorAll('.trust-toggle [role="tab"]');
    const detail = document.querySelector('.trust-detail');
    const meterBar = document.querySelector('.trust-bar');
    const trustList = document.querySelectorAll('.trust-list li');
    if (!buttons.length || !detail) return;
    function applyLevel(level) {
      const cfg = TRUST_LEVELS[level];
      if (!cfg) return;
      buttons.forEach((b) => b.setAttribute('aria-selected', b.dataset.level === level ? 'true' : 'false'));
      if (meterBar) meterBar.style.setProperty('--fill', cfg.fill);
      if (detail) detail.textContent = t(cfg.body);
      // Aggiorna i pallini per gli stati (on / ask / off) delle 4 azioni
      // trustRead (on), trustDraft (on), trustSend (ask), trustDelete (off).
      if (trustList.length >= 4) {
        const items = trustList;
        const states = [cfg.states.on >= 1 ? 'on' : 'off',
                        cfg.states.on >= 2 ? 'on' : (cfg.states.ask >= 1 ? 'ask' : 'off'),
                        cfg.states.ask >= 1 ? 'ask' : 'off',
                        cfg.states.off >= 2 ? 'off' : (cfg.states.ask >= 1 ? 'ask' : 'on')];
        items.forEach((li, i) => {
          const dot = li.querySelector('.trust-dot');
          if (!dot) return;
          dot.classList.remove('dot-on', 'dot-ask', 'dot-off');
          dot.classList.add('dot-' + states[i]);
          li.classList.toggle('is-disabled', states[i] === 'off');
        });
      }
    }
    buttons.forEach((b) => {
      b.addEventListener('click', () => applyLevel(b.dataset.level));
      b.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        e.preventDefault();
        const list = Array.from(buttons);
        const i = list.indexOf(b);
        const next = list[(i + (e.key === 'ArrowRight' ? 1 : -1) + list.length) % list.length];
        next.focus(); next.click();
      });
    });
    applyLevel('cautious');
  }

  // ---------- Citations ----------
  function bindCitations() {
    const root = document.querySelector('.sources-scene');
    if (!root) return;
    const cites = root.querySelectorAll('.cite');
    const rows = root.querySelectorAll('.src-row');
    function highlight(id) {
      rows.forEach((r) => r.classList.toggle('is-highlight', r.dataset.id === id));
    }
    cites.forEach((c) => {
      c.addEventListener('click', () => {
        const id = c.dataset.cite;
        cites.forEach((x) => x.classList.toggle('is-active', x === c));
        highlight(id);
        toast(t('dSourcesTitle') + ' [' + id + ']');
      });
    });
  }

  // ---------- Bind ----------
  function bind() {
    bindReveal();
    bindStore();
    bindTrust();
    bindCitations();
    // Smooth-scroll per i link interni rispettando reduced-motion.
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
    });
  }

  // ---------- Init ----------
  document.addEventListener('DOMContentLoaded', () => {
    bind();
    ready.then(() => {
      renderStore();
      window.addEventListener('talia-language-change', () => {
        renderStore();
        // Reapply trust level to refresh detail text.
        const active = document.querySelector('.trust-toggle [aria-selected="true"]');
        if (active) active.click();
        // Re-render citations toast on language change is unnecessary (static strings).
      });
    });
  });

  // Esposto per QA/debug.
  window.TaliaLanding = { toast, get added() { return readAdded(); } };
})();
