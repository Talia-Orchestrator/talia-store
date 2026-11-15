#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { validateRetainedArtifacts } = require('./retained-artifacts.cjs');
const storeRoot = path.resolve(__dirname, '..');
const packer = path.join(storeRoot, 'tools', 'talia-catalog-pack.cjs');
const featuredAgents = [
  'app-architetto', 'app-frontend', 'app-backend', 'app-devops', 'app-e2e-tester', 'deepresearcher', 'contentwriter', 'officeworker',
  'productdeveloper', 'uidesigner', 'pptmaker', 'imagestudio', 'videostudio', 'seogeoagent',
  'ecommerce-researcher',
];
function packageDirs(category, names) {
  const root = path.join(storeRoot, category);
  const selected = names || fs.readdirSync(root).filter((name) => fs.statSync(path.join(root, name)).isDirectory());
  return selected.map((name) => {
    const dir = path.join(root, name);
    if (!fs.statSync(dir).isDirectory()) throw new Error(`missing package directory: ${dir}`);
    return dir;
  });
}
const packages = [
  ...packageDirs('agents', featuredAgents),
  ...packageDirs('skills'),
  ...packageDirs('connectors'),
  ...packageDirs('apps'),
  ...packageDirs('library'),
];
const artifactsRoot = path.join(storeRoot, 'artifacts');
if (fs.existsSync(artifactsRoot)) validateRetainedArtifacts(artifactsRoot, new Set(), require(packer));
const result = spawnSync(process.execPath, [packer, 'build', '--format', '3', ...packages.flatMap((dir) => ['--package', dir]), '--out', path.join(storeRoot, 'catalog.json')], { stdio: 'inherit' });
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status || 1);
const catalog = JSON.parse(fs.readFileSync(path.join(storeRoot, 'catalog.json'), 'utf8'));
const currentNames = new Set(catalog.packages.map(item => path.basename(item.artifact.url)));
const retained = validateRetainedArtifacts(artifactsRoot, currentNames, require(packer));
console.log(`Store index built from ${packages.length} packages; ${retained} valid historical artifacts retained. Sign catalog.json separately.`);
