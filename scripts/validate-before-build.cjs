#!/usr/bin/env node
'use strict';

const { execFileSync, spawnSync } = require('node:child_process');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
function git(args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
}
function assertClean(phase) {
  if (git(['status', '--porcelain=v1', '--untracked-files=all'])) {
    throw new Error(`Store checkout non pulito ${phase}; non promuovere la build`);
  }
}

try {
  assertClean('prima della validazione');
  const commit = git(['rev-parse', 'HEAD']);
  const command = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const result = spawnSync(command, ['test'], { cwd: root, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
  assertClean('dopo la validazione');
  if (git(['rev-parse', 'HEAD']) !== commit) throw new Error('Commit Store cambiato durante la validazione');
  process.stdout.write(`Store verificato per build: ${commit}\n`);
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
}
