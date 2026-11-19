#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const storeRoot = path.resolve(__dirname, '..');
const packer = require(path.join(storeRoot, 'tools', 'talia-catalog-pack.cjs'));
const { validateRetainedArtifacts } = require('./retained-artifacts.cjs');
const featuredAgents = ['app-architetto', 'app-frontend', 'app-backend', 'app-devops', 'app-e2e-tester', 'functional-analyst', 'product-manager', 'deepresearcher', 'contentwriter', 'officeworker', 'productdeveloper', 'uidesigner', 'pptmaker', 'imagestudio', 'videostudio', 'seogeoagent', 'ecommerce-researcher'];
function packageDirs(category, names) {
  const root = path.join(storeRoot, 'packages', category);
  return (names || fs.readdirSync(root).filter(name => fs.statSync(path.join(root, name)).isDirectory()))
    .map(name => path.join(root, name));
}
const packages = [
  ...packageDirs('agents', featuredAgents),
  ...packageDirs('skills'),
  ...packageDirs('connectors'),
  ...packageDirs('apps'),
  ...packageDirs('library'),
  ...packageDirs('teams'),
];
const built = packer.buildCatalogV3(packages);
const committed = fs.readFileSync(path.join(storeRoot, 'catalog.json'));
if (!committed.equals(built.catalogBytes)) throw new Error('catalog.json is stale; rebuild, review artifacts, then sign the exact catalog bytes.');
const expected = new Set();
for (const artifact of built.artifacts) {
  expected.add(path.basename(artifact.url));
  const current = fs.readFileSync(path.join(storeRoot, ...artifact.url.split('/')));
  if (!current.equals(artifact.bytes)) throw new Error(`artifact is stale: ${artifact.url}`);
}
const artifactRoot = path.join(storeRoot, 'artifacts');
const retained = validateRetainedArtifacts(artifactRoot, expected, packer);
console.log(`Committed source matches ${packages.length} selected packages and ${expected.size} current artifacts; ${retained} valid historical artifacts retained.`);
