#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const storeRoot = path.resolve(__dirname, '..');
const ecosystemRoot = process.env.TALIA_SOURCE_ROOT
  ? path.resolve(process.env.TALIA_SOURCE_ROOT)
  : path.resolve(storeRoot, '..');
const packer = path.join(storeRoot, 'tools', 'talia-catalog-pack.cjs');
const featuredAgents = [
  'app-architetto', 'app-frontend', 'app-backend', 'app-devops', 'app-e2e-tester', 'deepresearcher', 'contentwriter', 'officeworker',
  'productdeveloper', 'uidesigner', 'pptmaker', 'imagestudio', 'videostudio', 'seogeoagent',
  'ecommerce-researcher',
];
function packageDirs(repo, names) {
  const root = path.join(ecosystemRoot, repo, 'packages');
  const selected = names || fs.readdirSync(root).filter((name) => fs.statSync(path.join(root, name)).isDirectory());
  return selected.map((name) => {
    const dir = path.join(root, name);
    if (!fs.statSync(dir).isDirectory()) throw new Error(`missing package directory: ${dir}`);
    return dir;
  });
}
const packages = [
  ...packageDirs('talia-agents', featuredAgents),
  ...packageDirs('talia-skills'),
  ...packageDirs('talia-connectors'),
  ...packageDirs('talia-apps'),
];
const result = spawnSync(process.execPath, [packer, 'build', '--format', '3', ...packages.flatMap((dir) => ['--package', dir]), '--out', path.join(storeRoot, 'catalog.json')], { stdio: 'inherit' });
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status || 1);
const catalog = JSON.parse(fs.readFileSync(path.join(storeRoot, 'catalog.json'), 'utf8'));
const retained = new Set(catalog.packages.map((pkg) => pkg.artifact.url));
const artifactsRoot = path.join(storeRoot, 'artifacts');
for (const entry of fs.readdirSync(artifactsRoot, { withFileTypes: true })) {
  if (!entry.isFile()) throw new Error('unexpected artifact directory entry: ' + entry.name);
  if (!retained.has('artifacts/' + entry.name)) fs.rmSync(path.join(artifactsRoot, entry.name));
}
console.log(`Store index built from ${packages.length} packages. Sign catalog.json separately; the private key must stay outside source repositories.`);
