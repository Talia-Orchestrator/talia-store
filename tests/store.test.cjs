'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const catalogPath = path.join(root, 'catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const sha256 = (bytes) => `sha256:${crypto.createHash('sha256').update(bytes).digest('hex')}`;

test('public store includes only the approved categories and canonical agent set', () => {
  assert.deepEqual([catalog.format, catalog.version], ['talia-extension-catalog', 3]);
  const counts = Object.fromEntries(['agent', 'skill', 'connector', 'app'].map((kind) => [kind, catalog.packages.filter((pkg) => pkg.kind === kind).length]));
  assert.deepEqual(counts, { agent: 15, skill: 25, connector: 16, app: 3 });
  const agents = new Set(catalog.packages.filter((pkg) => pkg.kind === 'agent').map((pkg) => pkg.id));
  assert.deepEqual([...agents].sort(), [
    'talia-agents/app-architetto',
    'talia-agents/app-frontend',
    'talia-agents/app-backend',
    'talia-agents/app-devops',
    'talia-agents/app-e2e-tester',
    'talia-agents/contentwriter', 'talia-agents/deepresearcher',
    'talia-agents/ecommerce-researcher', 'talia-agents/imagestudio',
    'talia-agents/officeworker', 'talia-agents/pptmaker', 'talia-agents/productdeveloper',
    'talia-agents/seogeoagent', 'talia-agents/uidesigner', 'talia-agents/videostudio',
  ].sort());
  assert.equal([...agents].some((id) => /stockanalyser|ecommerceoperator|ecommercereviewer|ecommercewriter|ecommerceanalyzer/.test(id)), false);
});

test('every artifact is relative, digest-verified and retains its license and notice', () => {
  const urls = new Set();
  for (const item of catalog.packages) {
    const ref = item.artifact;
    assert.ok(ref && !path.isAbsolute(ref.url) && !ref.url.split('/').includes('..'));
    assert.equal(urls.has(ref.url), false);
    urls.add(ref.url);
    const bytes = fs.readFileSync(path.join(root, ...ref.url.split('/')));
    assert.equal(bytes.length, ref.size);
    assert.equal(sha256(bytes), ref.sha256);
    const payload = JSON.parse(bytes.toString('utf8'));
    assert.equal(payload.version, 2);
    assert.equal(payload.packages.length, 1);
    const pkg = payload.packages[0];
    assert.equal(pkg.id, item.id);
    assert.equal(pkg.kind, item.kind);
    assert.equal(typeof pkg.files.LICENSE, 'string');
    assert.equal(typeof pkg.files.NOTICE, 'string');
  }
  assert.ok(fs.statSync(path.join(root, 'public-key.txt')).isFile());
});

test('published artifact text contains no personal paths or credential values', () => {
  const privatePath = /(?:\/Users\/(?!\.\.\.)[^\s/]+|\/home\/(?!\.\.\.)[^\s/]+|[A-Za-z]:\\\\Users\\\\(?!\.\.\.)[^\\\\\s]+)/;
  const credential = /(?:Bearer\s+[A-Za-z0-9._~-]{20,}|(?:api[_-]?key|access[_-]?token|client[_-]?secret)\s*[:=]\s*["']?[A-Za-z0-9._~-]{20,})/i;
  for (const item of catalog.packages) {
    const bytes = fs.readFileSync(path.join(root, ...item.artifact.url.split('/')));
    const pkg = JSON.parse(bytes.toString('utf8')).packages[0];
    for (const content of Object.values(pkg.files)) {
      if (typeof content !== 'string') continue;
      assert.doesNotMatch(content, privatePath, item.id);
      assert.doesNotMatch(content, credential, item.id);
    }
  }
});

test('committed detached signature verifies against the published public key', () => {
  const envelope = JSON.parse(fs.readFileSync(path.join(root, 'catalog.signature.json'), 'utf8'));
  const publicKey = crypto.createPublicKey(fs.readFileSync(path.join(root, 'public-key.txt')));
  const payload = Buffer.from(envelope.payload_base64, 'base64');
  const signature = Buffer.from(envelope.signature_base64, 'base64');
  assert.equal(envelope.format, 'talia-catalog-signature-v1');
  assert.deepEqual(payload, fs.readFileSync(catalogPath));
  assert.equal(crypto.verify(null, payload, publicKey, signature), true);
});
