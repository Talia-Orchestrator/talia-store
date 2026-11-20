#!/usr/bin/env node
'use strict';

const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { checkUpgrade } = require('./check-catalog-upgrade.cjs');

const OFFICIAL_CATALOG_URL = 'https://raw.githubusercontent.com/Talia-Orchestrator/talia-store/main/catalog.signature.json';
const OFFICIAL_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEAPNvkLS3PFjPXCwKur5+eZIZFOhZ9J2hdRhOM6TzTifM=
-----END PUBLIC KEY-----`;

function sha256(bytes) {
  return `sha256:${crypto.createHash('sha256').update(bytes).digest('hex')}`;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function officialArtifactUrl(relative) {
  const base = new URL(OFFICIAL_CATALOG_URL);
  const target = new URL(relative, base);
  const prefix = base.pathname.slice(0, base.pathname.lastIndexOf('/') + 1);
  if (target.origin !== base.origin || !target.pathname.startsWith(prefix)) {
    throw new Error(`artifact URL escapes the public Store origin: ${relative}`);
  }
  return target;
}

function checkLegacyClientCompatibility({ root, previousCatalog }) {
  const catalogPath = path.join(root, 'catalog.json');
  const signaturePath = path.join(root, 'catalog.signature.json');
  const keyPath = path.join(root, 'public-key.txt');
  const catalogBytes = fs.readFileSync(catalogPath);
  const catalog = JSON.parse(catalogBytes);
  const signature = readJson(signaturePath);
  const publicKey = fs.readFileSync(keyPath, 'utf8').trim();

  if (catalog.format !== 'talia-extension-catalog' || catalog.version !== 3 || !Array.isArray(catalog.packages)) {
    throw new Error('candidate catalog must use the v3 client format');
  }
  if (publicKey !== OFFICIAL_PUBLIC_KEY) throw new Error('public key differs from the key embedded in released Talia clients');
  if (signature.format !== 'talia-catalog-signature-v1') throw new Error('candidate must use the v1 signature envelope');
  const payload = Buffer.from(signature.payload_base64 || '', 'base64');
  const signed = Buffer.from(signature.signature_base64 || '', 'base64');
  if (!payload.equals(catalogBytes)) throw new Error('signature envelope payload differs from catalog.json');
  const key = crypto.createPublicKey(publicKey);
  if (key.asymmetricKeyType !== 'ed25519' || signed.length !== 64 || !crypto.verify(null, payload, key, signed)) {
    throw new Error('candidate catalog signature is not valid Ed25519 for the released client key');
  }

  const ids = new Set();
  for (const item of catalog.packages) {
    if (ids.has(item.id)) throw new Error(`duplicate package ID: ${item.id}`);
    ids.add(item.id);
    const artifact = item.artifact;
    if (!artifact || typeof artifact.url !== 'string' || !artifact.url.startsWith('artifacts/') || artifact.url.includes('..')) {
      throw new Error(`artifact must remain a relative public artifacts/ URL: ${item.id}`);
    }
    officialArtifactUrl(artifact.url);
    const artifactPath = path.join(root, ...artifact.url.split('/'));
    const bytes = fs.readFileSync(artifactPath);
    if (bytes.length !== artifact.size || sha256(bytes) !== artifact.sha256) throw new Error(`artifact digest or size mismatch: ${item.id}`);
    const artifactPayload = JSON.parse(bytes);
    if (artifactPayload.format !== 'talia-extension-catalog' || artifactPayload.version !== 2 || !Array.isArray(artifactPayload.packages) || artifactPayload.packages.length !== 1) {
      throw new Error(`artifact is not the v2 payload expected by released clients: ${item.id}`);
    }
    const packaged = artifactPayload.packages[0];
    for (const field of ['id', 'kind', 'version', 'digest']) {
      if (packaged[field] !== item[field]) throw new Error(`artifact metadata mismatch (${field}): ${item.id}`);
    }
  }

  const upgradeProblems = checkUpgrade(previousCatalog, catalog).filter(problem => !problem.includes(': package removed;'));
  if (upgradeProblems.length) throw new Error(`previous public catalog is not safely upgradeable:\n${upgradeProblems.join('\n')}`);
  const currentIds = new Set(catalog.packages.map(item => item.id));
  const removed = previousCatalog.packages.filter(item => !currentIds.has(item.id)).map(item => item.id);
  return { packages: catalog.packages.length, source: OFFICIAL_CATALOG_URL, removed };
}

function previousFromOrigin(root) {
  return JSON.parse(execFileSync('git', ['show', 'origin/main:catalog.json'], { cwd: root, encoding: 'utf8' }));
}

if (require.main === module) {
  try {
    const root = path.resolve(__dirname, '..');
    const [previousPath] = process.argv.slice(2);
    const previousCatalog = previousPath ? readJson(path.resolve(previousPath)) : previousFromOrigin(root);
    const result = checkLegacyClientCompatibility({ root, previousCatalog });
    process.stdout.write(`Legacy client compatibility passed for ${result.packages} packages via ${result.source}${result.removed.length ? `; ${result.removed.length} catalog delistings reported` : ''}\n`);
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}

module.exports = { checkLegacyClientCompatibility, OFFICIAL_CATALOG_URL, OFFICIAL_PUBLIC_KEY };
