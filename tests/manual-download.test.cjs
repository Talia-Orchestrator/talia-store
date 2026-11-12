'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const site = path.resolve(__dirname, '../site');

test('manual download is a complete static document linked from the store', async () => {
  const html = fs.readFileSync(path.join(site, 'index.html'), 'utf8');
  assert.match(html, /href="docs\/Manuale-Talia\.md" download="Manuale-Talia\.md"/);
  const bytes = fs.readFileSync(path.join(site, 'docs/Manuale-Talia.md'));
  const text = bytes.toString('utf8');
  for (const section of ['Documenti, libreria e RAG', 'Chat e squadra di agenti', 'Progetti e cartelle di lavoro', 'Modelli, provider', 'Tema, lingua', 'Skill, agenti e connettori', 'Rimuovere e ripristinare']) assert.ok(text.includes(section), section);
  assert.ok(bytes.length > 20000);
  assert.ok(text.includes('non modificare nulla senza una mia richiesta'));
  const server = http.createServer((req, res) => {
    if (req.url !== '/docs/Manuale-Talia.md') { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': 'text/markdown; charset=utf-8' }); res.end(bytes);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/docs/Manuale-Talia.md`);
    assert.equal(response.status, 200);
    assert.equal(await response.text(), text);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
