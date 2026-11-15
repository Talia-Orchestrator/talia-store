'use strict';

const fs = require('node:fs');
const path = require('node:path');

function validateRetainedArtifacts(artifactRoot, currentNames, packer) {
  const rootStat = fs.lstatSync(artifactRoot);
  if (!rootStat.isDirectory() || rootStat.isSymbolicLink()) throw new Error('artifact root must be a regular directory');
  let retained = 0;
  for (const entry of fs.readdirSync(artifactRoot, { withFileTypes: true })) {
    if (!entry.isFile()) throw new Error(`unexpected artifact directory entry: ${entry.name}`);
    if (currentNames.has(entry.name)) continue;
    const bytes = fs.readFileSync(path.join(artifactRoot, entry.name));
    let payload;
    try { payload = JSON.parse(bytes.toString('utf8')); }
    catch (_) { throw new Error(`invalid retained artifact: ${entry.name}`); }
    if (payload?.version !== 2 || !Array.isArray(payload.packages) || payload.packages.length !== 1) {
      throw new Error(`invalid retained artifact shape: ${entry.name}`);
    }
    packer.validateCatalogBytes(bytes, { allowUnresolvedDependencies: true });
    const item = payload.packages[0];
    const expected = `${item.id.replace('/', '-')}-${item.version}.json`;
    if (entry.name !== expected) throw new Error(`retained artifact filename mismatch: ${entry.name}`);
    retained += 1;
  }
  return retained;
}

module.exports = { validateRetainedArtifacts };
