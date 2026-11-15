#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const payloadPath = path.join(root, 'routing-index.json');
const signedPath = path.join(root, 'routing-index.signature.json');
const format = 'talia-agent-routing-v1';
const envelopeFormat = 'talia-agent-routing-signature-v1';

function build() {
  const catalogBytes = fs.readFileSync(path.join(root, 'catalog.json'));
  const catalog = JSON.parse(catalogBytes);
  const agents = catalog.packages.filter(item => item.kind === 'agent').map(item => {
    const slug = item.id.split('/')[1];
    const manifest = JSON.parse(fs.readFileSync(path.join(root, 'agents', slug, 'talia-extension.json')));
    const tags = manifest.routing_tags;
    if (manifest.id !== item.id || manifest.version !== item.version || !Array.isArray(tags)
      || tags.length < 1 || tags.length > 16 || new Set(tags).size !== tags.length
      || tags.some(tag => typeof tag !== 'string' || tag.length > 48
        || !/^[a-z][a-z0-9]*(?:[._][a-z][a-z0-9]*)*$/.test(tag))) {
      throw new Error(`${item.id}: invalid routing tags or version`);
    }
    return { id: item.id, version: item.version, tags };
  }).sort((a,b) => a.id.localeCompare(b.id));
  return Buffer.from(`${JSON.stringify({format,catalog_sha256:'sha256:'+crypto.createHash('sha256').update(catalogBytes).digest('hex'),agents},null,2)}\n`);
}

function verify(payload) {
  if (!fs.readFileSync(payloadPath).equals(payload)) throw new Error('routing-index.json is stale');
  const envelope = JSON.parse(fs.readFileSync(signedPath));
  if (envelope.format !== envelopeFormat || !Buffer.from(envelope.payload_base64,'base64').equals(payload)) throw new Error('routing signature payload mismatch');
  if (!crypto.verify(null,payload,fs.readFileSync(path.join(root,'public-key.txt')),Buffer.from(envelope.signature_base64,'base64'))) throw new Error('routing signature invalid');
}

const payload = build();
if (process.argv[2] === 'build') {
  const keyPath = process.env.TALIA_STORE_SIGNING_KEY_FILE;
  if (!keyPath) throw new Error('TALIA_STORE_SIGNING_KEY_FILE is required');
  fs.writeFileSync(payloadPath,payload);
  const signature = crypto.sign(null,payload,fs.readFileSync(keyPath));
  fs.writeFileSync(signedPath,`${JSON.stringify({format:envelopeFormat,payload_base64:payload.toString('base64'),signature_base64:signature.toString('base64')},null,2)}\n`);
  verify(payload);
  console.log(`Signed routing index for ${JSON.parse(payload).agents.length} agents`);
} else if (process.argv[2] === 'check') {
  verify(payload);
  console.log('Routing index matches catalog and signature');
} else {
  throw new Error('Usage: node scripts/routing-index.cjs build|check');
}
