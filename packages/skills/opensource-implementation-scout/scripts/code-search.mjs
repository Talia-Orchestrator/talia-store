/**
 * Ricerca di implementazioni reali in progetti open source.
 * Modalita anonima: nessun login, nessun token, nessuna chiave.
 * Modalita autenticata: usata solo se l'utente fornisce un token via argomento.
 */

const SOURCEGRAPH = "https://sourcegraph.com/.api/search/stream";
const GITHUB_API = "https://api.github.com";
const UA = "talia-opensource-scout";

const PERMISSIVE = ["MIT", "BSD-2-Clause", "BSD-3-Clause", "Apache-2.0", "ISC", "0BSD", "Unlicense", "Zlib", "MIT-0", "BSL-1.0"];
const WEAK_COPYLEFT = ["MPL-2.0", "LGPL-2.1", "LGPL-3.0", "EPL-2.0", "CDDL-1.0"];
const STRONG_COPYLEFT = ["GPL-2.0", "GPL-3.0", "AGPL-3.0", "SSPL-1.0", "GPL-2.0-only", "GPL-3.0-only", "AGPL-3.0-only"];

function classifyLicense(spdx) {
  if (!spdx || spdx === "NOASSERTION") {
    return { spdx: spdx || null, tier: "unknown", copy_allowed: false,
      note: "Licenza assente o non riconosciuta: nessun diritto di riuso. Non copiare codice; descrivere solo l'approccio." };
  }
  if (PERMISSIVE.includes(spdx)) {
    return { spdx, tier: "permissive", copy_allowed: true,
      note: "Permissiva: uso commerciale consentito. Obbligo di mantenere avviso di copyright e testo di licenza." };
  }
  if (WEAK_COPYLEFT.includes(spdx)) {
    return { spdx, tier: "weak-copyleft", copy_allowed: false,
      note: "Copyleft debole: usare come dipendenza separata, non incollare codice nei file del progetto. Le modifiche al componente restano sotto la stessa licenza." };
  }
  if (STRONG_COPYLEFT.includes(spdx)) {
    return { spdx, tier: "strong-copyleft", copy_allowed: false,
      note: "Copyleft forte: copiare o collegare puo imporre la stessa licenza a tutto il prodotto. Non copiare; reimplementare in autonomia." };
  }
  return { spdx, tier: "review", copy_allowed: false, note: "Licenza da verificare manualmente prima di qualunque riuso." };
}

async function httpJson(url, token) {
  const headers = { "User-Agent": UA, Accept: "application/vnd.github+json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, { headers });
  if (!res.ok) return { ok: false, status: res.status };
  return { ok: true, status: res.status, body: await res.json() };
}

function parseStream(text) {
  const out = [];
  let event = null;
  for (const raw of text.split("\n")) {
    if (raw.startsWith("event: ")) { event = raw.slice(7).trim(); continue; }
    if (!raw.startsWith("data: ") || event !== "matches") continue;
    let payload;
    try { payload = JSON.parse(raw.slice(6)); } catch { continue; }
    if (!Array.isArray(payload)) continue;
    for (const m of payload) {
      if (m.type !== "content") continue;
      const repo = String(m.repository || "").replace(/^github\.com\//, "");
      const fromLine = (m.lineMatches || []).map((l) => ({
        line: l.lineNumber != null ? l.lineNumber + 1 : null,
        text: String(l.line || "").trim().slice(0, 300),
      }));
      const fromChunk = (m.chunkMatches || []).map((c) => ({
        line: c.contentStart && c.contentStart.line != null ? c.contentStart.line + 1 : null,
        text: String(c.content || "").split("\n")[0].trim().slice(0, 300),
      }));
      const matches = (fromLine.length ? fromLine : fromChunk).slice(0, 4);
      const ref = m.commit || "HEAD";
      const anchor = matches.length && matches[0].line ? `#L${matches[0].line}` : "";
      out.push({
        repo,
        path: m.path,
        language: m.language || null,
        stars: m.repoStars != null ? m.repoStars : null,
        url: `https://github.com/${repo}/blob/${ref}/${m.path}${anchor}`,
        matches,
      });
    }
  }
  return out;
}

async function searchCodeAnonymous(query, { lang, limit }) {
  const parts = [query];
  if (lang) parts.push(`lang:${lang}`);
  parts.push(`count:${limit}`, "type:file");
  const url = `${SOURCEGRAPH}?q=${encodeURIComponent(parts.join(" "))}&v=V3&display=${limit}`;
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "text/event-stream" } });
  if (!res.ok) return { ok: false, status: res.status, results: [] };
  return { ok: true, status: res.status, results: parseStream(await res.text()).slice(0, limit) };
}

async function searchCodeAuthenticated(query, { lang, limit }, token) {
  const q = lang ? `${query} language:${lang}` : query;
  const r = await httpJson(`${GITHUB_API}/search/code?q=${encodeURIComponent(q)}&per_page=${limit}`, token);
  if (!r.ok) return { ok: false, status: r.status, results: [] };
  return { ok: true, status: r.status, results: (r.body.items || []).map((i) => ({
    repo: i.repository.full_name, path: i.path, url: i.html_url, matches: [] })) };
}

async function searchLibraries(query, { lang, limit }, token) {
  const q = lang ? `${query} language:${lang}` : query;
  const r = await httpJson(`${GITHUB_API}/search/repositories?q=${encodeURIComponent(q)}&sort=stars&per_page=${limit}`, token);
  if (!r.ok) return { ok: false, status: r.status, libraries: [] };
  return { ok: true, status: r.status, libraries: (r.body.items || []).map((i) => ({
    repo: i.full_name, url: i.html_url, stars: i.stargazers_count,
    description: i.description || null, archived: !!i.archived,
    pushed_at: i.pushed_at, license: classifyLicense(i.license && i.license.spdx_id) })) };
}

async function licenseOf(repo, token) {
  const r = await httpJson(`${GITHUB_API}/repos/${repo}`, token);
  if (!r.ok) return { repo, license: classifyLicense(null), lookup_status: r.status };
  return { repo, url: r.body.html_url, stars: r.body.stargazers_count,
    archived: !!r.body.archived, pushed_at: r.body.pushed_at,
    license: classifyLicense(r.body.license && r.body.license.spdx_id), lookup_status: 200 };
}

function parseArgs(argv) {
  const opts = { limit: 8 };
  const rest = [];
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--lang") { opts.lang = argv[++i]; }
    else if (a === "--limit") { opts.limit = Math.max(1, Math.min(25, Number(argv[++i]) || 8)); }
    else if (a === "--repo") { opts.repo = argv[++i]; }
    else if (a === "--token") { opts.token = argv[++i]; }
    else if (a === "--mode") { opts.mode = argv[++i]; }
    else rest.push(a);
  }
  opts.query = rest.join(" ").trim();
  return opts;
}

export default async function run(argv = []) {
  const opts = parseArgs(argv);
  if (opts.repo && !opts.query) {
    const info = await licenseOf(opts.repo, opts.token);
    return { ok: true, mode: opts.token ? "authenticated" : "anonymous", license_check: info };
  }
  if (!opts.query) {
    return { ok: false, error: "query_missing", hint: "Indicare cosa cercare, per esempio: \"virtual list scroll\" --lang TypeScript" };
  }
  const wantAuth = !!opts.token && opts.mode !== "anonymous";
  const code = wantAuth
    ? await searchCodeAuthenticated(opts.query, opts, opts.token)
    : await searchCodeAnonymous(opts.query, opts);
  const libs = await searchLibraries(opts.query, opts, opts.token);
  const notes = [];
  if (!code.ok) notes.push(`Ricerca codice non disponibile (HTTP ${code.status}). Riformulare la query o riprovare piu tardi.`);
  if (!libs.ok) notes.push(`Ricerca librerie non disponibile (HTTP ${libs.status}); senza token il limite anonimo e di circa 10 richieste al minuto.`);
  const uniq = [...new Set(code.results.map((r) => r.repo))].slice(0, 10);
  const licenses = await Promise.all(uniq.map((r) => licenseOf(r, opts.token)));
  return {
    ok: code.ok || libs.ok,
    mode: wantAuth ? "authenticated" : "anonymous",
    query: opts.query, language: opts.lang || null,
    code_examples: code.results,
    repo_licenses: licenses,
    libraries: libs.libraries,
    notes,
  };
}

if (process.argv[1] && process.argv[1].endsWith("code-search.mjs")) {
  run(process.argv.slice(2)).then((r) => {
    process.stdout.write(`${JSON.stringify(r, null, 2)}\n`);
    process.exit(r.ok ? 0 : 1);
  }).catch((e) => { process.stderr.write(`${e && e.stack ? e.stack : String(e)}\n`); process.exit(1); });
}
