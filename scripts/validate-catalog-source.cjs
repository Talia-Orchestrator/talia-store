#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const storeRoot = path.resolve(__dirname, '..');
const sourceRoot = process.env.TALIA_SOURCE_ROOT ? path.resolve(process.env.TALIA_SOURCE_ROOT) : path.resolve(storeRoot, '..');
const packer = require(path.join(storeRoot, 'tools', 'talia-catalog-pack.cjs'));
const featuredAgents = ['app-architetto', 'app-frontend', 'app-backend', 'app-devops', 'app-e2e-tester', 'deepresearcher', 'contentwriter', 'officeworker', 'productdeveloper', 'uidesigner', 'pptmaker', 'imagestudio', 'videostudio', 'seogeoagent', 'ecommerce-researcher'];
function packageDirs(repo, names) {
  const root = path.join(sourceRoot, repo, 'packages');
  return (names || fs.readdirSync(root).filter(name => fs.statSync(path.join(root, name)).isDirectory()))
    .map(name => path.join(root, name));
}
const packages = [
  ...packageDirs('talia-agents', featuredAgents),
  ...packageDirs('talia-skills'),
  ...packageDirs('talia-connectors'),
  ...packageDirs('talia-apps'),
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
const actual = fs.readdirSync(artifactRoot).filter(name => fs.statSync(path.join(artifactRoot, name)).isFile());
if (actual.length !== expected.size || actual.some(name => !expected.has(name))) throw new Error('artifacts/ contains stale or missing files.');
console.log(`Committed source matches ${packages.length} selected packages and ${expected.size} artifacts.`);
