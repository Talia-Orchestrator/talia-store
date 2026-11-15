#!/usr/bin/env node
'use strict';

const fs = require('node:fs');

function versionParts(value) {
  if (typeof value !== 'string' || !/^\d+\.\d+\.\d+$/.test(value)) throw new Error(`invalid package version: ${value}`);
  return value.split('.').map(Number);
}

function compareVersion(left, right) {
  const a = versionParts(left);
  const b = versionParts(right);
  for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] > b[i] ? 1 : -1;
  return 0;
}

function checkUpgrade(previous, next) {
  const problems = [];
  if (previous?.format !== 'talia-extension-catalog' || previous.version !== 3 ||
      next?.format !== 'talia-extension-catalog' || next.version !== 3) {
    return ['both catalogs must use Talia extension format v3'];
  }
  if (!Array.isArray(previous.packages) || !Array.isArray(next.packages)) return ['both catalogs need packages arrays'];
  const current = new Map(next.packages.map(pkg => [pkg.id, pkg]));
  if (current.size !== next.packages.length) problems.push('new catalog contains duplicate package IDs');
  for (const old of previous.packages) {
    const item = current.get(old.id);
    if (!item) {
      problems.push(`${old.id}: package removed; preserve the stable ID or plan explicit deprecation`);
      continue;
    }
    let order;
    try { order = compareVersion(item.version, old.version); }
    catch (error) { problems.push(`${old.id}: ${error.message}`); continue; }
    if (order < 0) problems.push(`${old.id}: version decreased ${old.version} → ${item.version}`);
    if (item.kind !== old.kind) problems.push(`${old.id}: package kind changed`);
    if (order === 0 && (item.digest !== old.digest || item.artifact?.sha256 !== old.artifact?.sha256 || item.artifact?.url !== old.artifact?.url)) {
      problems.push(`${old.id}: content changed without a version increase`);
    }
    if (order > 0 && item.artifact?.url === old.artifact?.url) problems.push(`${old.id}: new version reuses the old artifact URL`);
  }
  return problems;
}

if (require.main === module) {
  const [previousPath, nextPath] = process.argv.slice(2);
  if (!previousPath || !nextPath || process.argv.length !== 4) {
    console.error('Usage: node scripts/check-catalog-upgrade.cjs <previous-catalog.json> <new-catalog.json>');
    process.exit(2);
  }
  try {
    const previous = JSON.parse(fs.readFileSync(previousPath, 'utf8'));
    const next = JSON.parse(fs.readFileSync(nextPath, 'utf8'));
    const problems = checkUpgrade(previous, next);
    if (problems.length) {
      for (const problem of problems) console.error(problem);
      process.exitCode = 1;
    } else console.log(`Upgrade contract passed for ${previous.packages.length} existing package IDs.`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { checkUpgrade, compareVersion };
