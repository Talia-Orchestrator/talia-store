'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { deployPagesBranch, requestAndWaitForPagesBuild } = require('../scripts/deploy-pages-branch.cjs');

const REPOSITORY = 'Talia-orchestator/talia-store';

function git(cwd, args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function makeSandbox() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'talia-pages-deploy-test-'));
  const remote = path.join(root, 'remote.git');
  const repo = path.join(root, 'repo');
  const site = path.join(root, 'site');
  fs.mkdirSync(repo);
  fs.mkdirSync(site);
  git(root, ['init', '--bare', remote]);
  git(repo, ['init', '-b', 'main']);
  git(repo, ['config', 'user.name', 'Talia tests']);
  git(repo, ['config', 'user.email', 'tests@example.invalid']);
  fs.writeFileSync(path.join(repo, 'README.md'), 'source branch\n');
  git(repo, ['add', 'README.md']);
  git(repo, ['commit', '-m', 'source']);
  git(repo, ['remote', 'add', 'origin', remote]);
  git(repo, ['push', '-u', 'origin', 'main']);

  git(repo, ['switch', '--orphan', 'gh-pages']);
  git(repo, ['rm', '-rf', '--ignore-unmatch', '.']);
  fs.writeFileSync(path.join(repo, 'index.html'), 'old page\n');
  fs.writeFileSync(path.join(repo, '.nojekyll'), '');
  fs.writeFileSync(path.join(repo, '.talia-pages-source.json'), JSON.stringify({ mode: 'static-github-pages-branch', sourceCommit: 'a'.repeat(40) }));
  git(repo, ['add', '--all']);
  git(repo, ['commit', '-m', 'seed Pages branch']);
  git(repo, ['push', '-u', 'origin', 'gh-pages']);
  git(repo, ['switch', 'main']);
  git(repo, ['fetch', 'origin', 'main', 'gh-pages']);

  fs.writeFileSync(path.join(site, 'index.html'), '<h1>New public page</h1>\n');
  fs.writeFileSync(path.join(site, 'releases.json'), '{"schemaVersion":1,"releases":[]}\n');
  return { root, remote, repo, site };
}

function fakeGh(calls, getPublishedCommit) {
  return args => {
    calls.push(args);
    if (args[1] === '--method') {
      return JSON.stringify({ status: 'queued', url: 'https://api.github.com/repositories/1451454634/pages/builds/latest' });
    }
    const buildNumber = calls.filter(call => call[1] !== '--method').length;
    return JSON.stringify({
      status: 'built',
      commit: buildNumber === 1 ? 'b'.repeat(40) : getPublishedCommit(),
    });
  };
}

test('publishes a linear gh-pages commit, preserves its marker, and explicitly requests the legacy Pages build', async () => {
  const sandbox = makeSandbox();
  try {
    const calls = [];
    const expectedMainSha = git(sandbox.repo, ['rev-parse', 'HEAD']);
    const originalPagesCommit = git(sandbox.repo, ['rev-parse', 'refs/remotes/origin/gh-pages']);
    const result = await deployPagesBranch({
      repoRoot: sandbox.repo,
      siteDirectory: sandbox.site,
      repository: REPOSITORY,
      expectedMainSha,
      runGh: fakeGh(calls, () => git(sandbox.root, ['--git-dir', sandbox.remote, 'rev-parse', 'refs/heads/gh-pages'])),
      pollIntervalMs: 1,
      sleep: async () => {},
    });
    assert.equal(result.status, 'published');
    assert.equal(result.pushed, true);
    assert.equal(result.pagesBuild.status, 'built');
    assert.deepEqual(calls, [
      ['api', '--method', 'POST', `repos/${REPOSITORY}/pages/builds`],
      ['api', `repos/${REPOSITORY}/pages/builds/latest`],
      ['api', `repos/${REPOSITORY}/pages/builds/latest`],
    ]);

    const checkout = path.join(sandbox.root, 'checkout');
    git(sandbox.root, ['clone', '--branch', 'gh-pages', sandbox.remote, checkout]);
    assert.equal(fs.readFileSync(path.join(checkout, 'index.html'), 'utf8'), '<h1>New public page</h1>\n');
    assert.equal(fs.readFileSync(path.join(checkout, 'releases.json'), 'utf8'), '{"schemaVersion":1,"releases":[]}\n');
    assert.equal(fs.readFileSync(path.join(checkout, '.nojekyll'), 'utf8'), '');
    assert.equal(JSON.parse(fs.readFileSync(path.join(checkout, '.talia-pages-source.json'), 'utf8')).sourceCommit, expectedMainSha);
    assert.equal(fs.existsSync(path.join(checkout, 'README.md')), false);
    const pagesCommit = git(checkout, ['rev-parse', 'HEAD']);
    assert.equal(git(checkout, ['rev-parse', 'HEAD^']), originalPagesCommit);
    assert.notEqual(pagesCommit, git(sandbox.repo, ['rev-parse', 'main']));
  } finally {
    fs.rmSync(sandbox.root, { recursive: true, force: true });
  }
});

test('skips a stale main run before changing gh-pages or requesting a Pages build', async () => {
  const sandbox = makeSandbox();
  try {
    const staleMainSha = git(sandbox.repo, ['rev-parse', 'HEAD']);
    fs.writeFileSync(path.join(sandbox.repo, 'README.md'), 'newer source\n');
    git(sandbox.repo, ['add', 'README.md']);
    git(sandbox.repo, ['commit', '-m', 'newer source']);
    git(sandbox.repo, ['push', 'origin', 'main']);
    const ghCalls = [];
    const before = git(sandbox.repo, ['rev-parse', 'refs/remotes/origin/gh-pages']);
    const result = await deployPagesBranch({
      repoRoot: sandbox.repo,
      siteDirectory: sandbox.site,
      repository: REPOSITORY,
      expectedMainSha: staleMainSha,
      runGh: args => { ghCalls.push(args); return ''; },
    });
    assert.equal(result.status, 'stale');
    assert.equal(result.currentMainSha, git(sandbox.repo, ['rev-parse', 'refs/remotes/origin/main']));
    assert.deepEqual(ghCalls, []);
    assert.equal(git(sandbox.repo, ['rev-parse', 'refs/remotes/origin/gh-pages']), before);
  } finally {
    fs.rmSync(sandbox.root, { recursive: true, force: true });
  }
});

test('reports a failed legacy Pages build instead of masking its error', async () => {
  const calls = [];
  await assert.rejects(requestAndWaitForPagesBuild(REPOSITORY, {
    runGh: args => {
      calls.push(args);
      return args[1] === '--method'
        ? JSON.stringify({ status: 'queued', url: 'https://api.github.com/repositories/1451454634/pages/builds/latest' })
        : JSON.stringify({ status: 'errored', commit: 'c'.repeat(40), error: { message: 'Jekyll could not publish the branch' } });
    },
    expectedCommit: 'c'.repeat(40),
    pollIntervalMs: 1,
    sleep: async () => {},
  }), /Jekyll could not publish the branch/);
  assert.equal(calls.length, 2);
});
