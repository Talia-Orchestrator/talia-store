const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { normalize } = require('../scripts/build-model-thinking.cjs');

test('lo snapshot contiene solo effort esatti e Carbon ha tre livelli', () => {
  const file = path.join(__dirname, '..', 'model-capabilities', 'openrouter-thinking.json');
  const snapshot = JSON.parse(fs.readFileSync(file, 'utf8'));
  assert.equal(snapshot.schemaVersion, 1);
  assert.equal(snapshot.provider, 'openrouter');
  assert.deepEqual(snapshot.models['google/gemini-4-carbon'], ['low', 'medium', 'high']);
  assert.ok(Object.keys(snapshot.models).length >= 50);
  for (const [id, values] of Object.entries(snapshot.models)) {
    assert.match(id, /^[^\s]+\/[^\s]+$/);
    assert.ok(values.length > 0);
    assert.ok(values.every(value => ['minimal', 'low', 'medium', 'high', 'xhigh', 'max'].includes(value)));
  }
});

test('reasoning generico, livelli ambigui e valori duplicati restano fuori', () => {
  const output = normalize({ openrouter: { models: {
    'vendor/exact': { id: 'vendor/exact', reasoning: true, reasoning_options: [{ type: 'effort', values: ['high', 'low'] }] },
    'vendor/boolean': { id: 'vendor/boolean', reasoning: true },
    'vendor/unknown': { id: 'vendor/unknown', reasoning: true, reasoning_options: [{ type: 'effort', values: ['turbo'] }] },
    'vendor/duplicate': { id: 'vendor/duplicate', reasoning: true, reasoning_options: [{ type: 'effort', values: ['low', 'low'] }] },
  } } });
  assert.deepEqual(output.models, { 'vendor/exact': ['low', 'high'] });
});
