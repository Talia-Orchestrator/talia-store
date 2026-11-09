#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const PUBLISH_BRANCH = 'gh-pages';
const SOURCE_MARKER = '.talia-pages-source.json';
const PAGES_BUILD_TIMEOUT_MS = 10 * 60 * 1000;
const PAGES_BUILD_POLL_MS = 10 * 1000;

function fail(message) {
  throw new Error(message);
}

function validateRepository(repository) {
  if (typeof repository !== 'string' || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)) {
    fail('GITHUB_REPOSITORY must use owner/name form');
  }
  return repository;
}

function runGit(cwd, args) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
  }).trim();
}

function runGh(args) {
  return execFileSync('gh', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function checkedTree(sourceRoot) {
  const rootStat = fs.lstatSync(sourceRoot);
  if (rootStat.isSymbolicLink() || !rootStat.isDirectory()) fail('site build output must be a regular directory');
  const files = [];
  function walk(directory, relative) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const childRelative = relative ? `${relative}/${entry.name}` : entry.name;
      if (entry.name === '.git' || entry.name === SOURCE_MARKER) fail(`site build contains reserved path: ${childRelative}`);
      const absolute = path.join(directory, entry.name);
      const stat = fs.lstatSync(absolute);
      if (stat.isSymbolicLink() || (!stat.isDirectory() && !stat.isFile())) fail(`site build contains unsupported file: ${childRelative}`);
      if (stat.isDirectory()) walk(absolute, childRelative);
      else files.push({ absolute, relative: childRelative });
    }
  }
  walk(sourceRoot, '');
  if (!files.some(file => file.relative === 'index.html')) fail('site build output must contain index.html at its root');
  return files;
}

function copyStaticFiles(files, destinationRoot) {
  for (const file of files) {
    const destination = path.join(destinationRoot, file.relative);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(file.absolute, destination);
  }
}

function readSourceMarker(worktreePath, expectedMainSha) {
  const markerPath = path.join(worktreePath, SOURCE_MARKER);
  let marker;
  try { marker = JSON.parse(fs.readFileSync(markerPath, 'utf8')); } catch { fail('gh-pages source marker is missing or invalid'); }
  if (!marker || marker.mode !== 'static-github-pages-branch') fail('gh-pages source marker has an unexpected mode');
  return `${JSON.stringify({ ...marker, sourceCommit: expectedMainSha }, null, 2)}\n`;
}

function fetchPublishingRefs(repoRoot, run) {
  run(repoRoot, [
    'fetch', '--no-tags', 'origin',
    '+refs/heads/main:refs/remotes/origin/main',
    `+refs/heads/${PUBLISH_BRANCH}:refs/remotes/origin/${PUBLISH_BRANCH}`,
  ]);
  return run(repoRoot, ['rev-parse', 'refs/remotes/origin/main']);
}

function isPushRace(error) {
  const details = `${error && error.message || ''}\n${error && error.stderr || ''}`;
  return /non-fast-forward|failed to push some refs|fetch first|stale info|rejected/i.test(details);
}

async function requestAndWaitForPagesBuild(repository, options = {}) {
  const gh = options.runGh || runGh;
  let created;
  try {
    created = JSON.parse(gh(['api', '--method', 'POST', `repos/${repository}/pages/builds`]));
  } catch {
    fail('GitHub Pages build request failed');
  }
  if (!created || !['queued', 'building', 'built'].includes(created.status)) {
    fail('GitHub Pages build request returned an invalid response');
  }
  const expectedCommit = options.expectedCommit;
  const matchesExpectedCommit = value => !expectedCommit || value && value.commit === expectedCommit;
  if (created.status === 'built' && matchesExpectedCommit(created)) return created;

  const buildPath = `repos/${repository}/pages/builds/latest`;
  const deadline = Date.now() + (options.timeoutMs || PAGES_BUILD_TIMEOUT_MS);
  const sleep = options.sleep || (milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds)));
  while (Date.now() < deadline) {
    await sleep(options.pollIntervalMs || PAGES_BUILD_POLL_MS);
    let current;
    try { current = JSON.parse(gh(['api', buildPath])); } catch { fail('Unable to read GitHub Pages build status'); }
    if (!current || !['queued', 'building', 'built', 'errored'].includes(current.status)) {
      fail('GitHub Pages build status is invalid');
    }
    if (!matchesExpectedCommit(current)) continue;
    if (current.status === 'built') return current;
    if (current.status === 'errored') fail(`GitHub Pages build failed: ${current.error && current.error.message || 'unknown error'}`);
  }
  fail(`Timed out waiting for GitHub Pages build${expectedCommit ? ` of ${expectedCommit}` : ''}`);
}

async function deployPagesBranch(options = {}) {
  const repoRoot = fs.realpathSync(options.repoRoot || process.env.GITHUB_WORKSPACE || process.cwd());
  const sourceRoot = fs.realpathSync(options.siteDirectory || path.join(repoRoot, 'site'));
  const repository = validateRepository(options.repository || process.env.GITHUB_REPOSITORY || '');
  const git = options.runGit || ((cwd, args) => runGit(cwd, args));
  const gh = options.runGh || runGh;
  const sourceFiles = checkedTree(sourceRoot);
  const gitDirectory = path.join(repoRoot, '.git');
  const gitStat = fs.lstatSync(gitDirectory);
  if (gitStat.isSymbolicLink() || (!gitStat.isDirectory() && !gitStat.isFile())) fail('repository checkout is invalid');

  const expectedMainSha = options.expectedMainSha || git(repoRoot, ['rev-parse', 'HEAD']);
  if (!/^[a-f0-9]{40}$/.test(expectedMainSha)) fail('expected main commit SHA is invalid');
  const maxAttempts = options.maxPushAttempts || 3;
  let pushed = false;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const currentMainSha = fetchPublishingRefs(repoRoot, git);
    if (currentMainSha !== expectedMainSha) {
      return { status: 'stale', expectedMainSha, currentMainSha, pagesBuild: null };
    }

    const worktreePath = fs.mkdtempSync(path.join(os.tmpdir(), 'talia-pages-branch-'));
    fs.rmSync(worktreePath, { recursive: true, force: true });
    let worktreeAdded = false;
    try {
      git(repoRoot, ['worktree', 'add', '--detach', worktreePath, `refs/remotes/origin/${PUBLISH_BRANCH}`]);
      worktreeAdded = true;
      const markerContents = readSourceMarker(worktreePath, expectedMainSha);
      for (const entry of fs.readdirSync(worktreePath)) {
        if (entry !== '.git') fs.rmSync(path.join(worktreePath, entry), { recursive: true, force: true });
      }
      copyStaticFiles(sourceFiles, worktreePath);
      fs.writeFileSync(path.join(worktreePath, SOURCE_MARKER), markerContents);
      fs.writeFileSync(path.join(worktreePath, '.nojekyll'), '');

      git(worktreePath, ['add', '--all']);
      const dirty = git(worktreePath, ['status', '--porcelain']);
      if (dirty) {
        git(worktreePath, [
          '-c', 'user.name=github-actions[bot]',
          '-c', 'user.email=41898282+github-actions[bot]@users.noreply.github.com',
          'commit', '-m', `Publish download site for ${expectedMainSha.slice(0, 12)}`,
        ]);
      }

      const publishedCommit = git(worktreePath, ['rev-parse', 'HEAD']);

      const latestMainSha = fetchPublishingRefs(repoRoot, git);
      if (latestMainSha !== expectedMainSha) {
        return { status: 'stale', expectedMainSha, currentMainSha: latestMainSha, pagesBuild: null };
      }

      if (dirty) {
        try {
          git(worktreePath, ['push', 'origin', `HEAD:refs/heads/${PUBLISH_BRANCH}`]);
          pushed = true;
        } catch (error) {
          if (attempt === maxAttempts || !isPushRace(error)) throw error;
          continue;
        }
      }

      const pagesBuild = await requestAndWaitForPagesBuild(repository, {
        runGh: gh,
        expectedCommit: publishedCommit,
        timeoutMs: options.timeoutMs,
        pollIntervalMs: options.pollIntervalMs,
        sleep: options.sleep,
      });
      return { status: 'published', expectedMainSha, pushed, pagesBuild };
    } finally {
      if (worktreeAdded) {
        try { git(repoRoot, ['worktree', 'remove', '--force', worktreePath]); } catch { /* usa la pulizia filesystem come fallback */ }
      }
      fs.rmSync(worktreePath, { recursive: true, force: true });
      try { git(repoRoot, ['worktree', 'prune']); } catch { /* i metadati residui non modificano il branch */ }
    }
  }
  fail('Unable to publish gh-pages after concurrent updates');
}

async function main() {
  const result = await deployPagesBranch();
  if (result.status === 'stale') {
    process.stdout.write(`Skipped stale site run: ${result.expectedMainSha} is behind ${result.currentMainSha}.\n`);
    return;
  }
  process.stdout.write(`Published Pages branch from ${result.expectedMainSha}; build status ${result.pagesBuild.status}.\n`);
}

if (require.main === module) {
  main().catch(error => {
    process.stderr.write(`Pages branch deployment failed: ${error.message}\n`);
    process.exitCode = 1;
  });
}

module.exports = { deployPagesBranch, requestAndWaitForPagesBuild };
