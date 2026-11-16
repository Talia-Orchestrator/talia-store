const fs = require('node:fs/promises');
const path = require('node:path');

const SOURCE = 'https://models.dev/api.json';
const OUTPUT = path.join(__dirname, '..', 'model-capabilities', 'openrouter-thinking.json');
const LEVELS = ['minimal', 'low', 'medium', 'high', 'xhigh', 'max'];

function normalize(source) {
  const rows = source?.openrouter?.models;
  if (!rows || typeof rows !== 'object' || Array.isArray(rows)) throw new Error('Catalogo OpenRouter assente');
  const models = {};
  for (const id of Object.keys(rows).sort()) {
    const row = rows[id];
    if (row?.id !== id || row.reasoning !== true || !Array.isArray(row.reasoning_options)) continue;
    const effort = row.reasoning_options.find(option => option?.type === 'effort');
    const values = effort?.values;
    if (!Array.isArray(values) || !values.length || values.length > LEVELS.length + 1
      || !values.every(value => typeof value === 'string' && (value === 'none' || LEVELS.includes(value)))
      || new Set(values).size !== values.length) continue;
    // `none` è Off, non uno step del cursore. Non deve eliminare gli effort
    // validi dichiarati nello stesso record; Off resta fuori dalla policy UI.
    const effortLevels = values.filter(value => value !== 'none');
    if (!effortLevels.length) continue;
    models[id] = effortLevels.sort((a, b) => LEVELS.indexOf(a) - LEVELS.indexOf(b));
  }
  if (!Object.keys(models).length) throw new Error('Nessun effort esatto nel catalogo');
  return { schemaVersion: 1, provider: 'openrouter', source: SOURCE,
    upstream: 'https://github.com/anomalyco/models.dev/tree/dev/providers/openrouter/models',
    license: 'MIT; Copyright (c) 2025 models.dev', models };
}

async function main() {
  const input = process.argv[2];
  let raw;
  if (input) raw = JSON.parse(await fs.readFile(input, 'utf8'));
  else {
    try {
      const response = await fetch(SOURCE, { redirect: 'error', signal: AbortSignal.timeout(20_000) });
      if (!response.ok) throw new Error(`Models.dev HTTP ${response.status}`);
      raw = await response.json();
    } catch (error) {
      // Una build offline usa soltanto lo snapshot già validato e dichiara
      // esplicitamente che l'aggiornamento non è avvenuto.
      const existing = JSON.parse(await fs.readFile(OUTPUT, 'utf8'));
      if (existing?.schemaVersion !== 1 || existing?.provider !== 'openrouter'
        || !existing.models || !Object.keys(existing.models).length) throw error;
      process.stderr.write(`Models.dev non disponibile: snapshot esistente conservato (${error.message})\n`);
      return;
    }
  }
  const catalog = normalize(raw);
  await fs.mkdir(path.dirname(OUTPUT), { recursive: true });
  await fs.writeFile(OUTPUT, JSON.stringify(catalog, null, 2) + '\n');
  process.stdout.write(`OpenRouter: ${Object.keys(catalog.models).length} modelli con effort esatti\n`);
}

if (require.main === module) main().catch(error => { console.error(error); process.exitCode = 1; });
module.exports = { normalize };
