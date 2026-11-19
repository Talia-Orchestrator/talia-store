'use strict';

const crypto = require('node:crypto');
const os = require('node:os');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const catalogPath = path.join(root, 'catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const sha256 = (bytes) => `sha256:${crypto.createHash('sha256').update(bytes).digest('hex')}`;

test('app packer accepts current and legacy manifests, preferring current and failing closed', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'talia-app-manifest-'));
  try {
    const packer = require('../tools/talia-catalog-pack.cjs');
    const metadata = { id: 'talia-apps/fixture', kind: 'app', version: '1.0.0',
      name: 'Fixture', description: 'Manifest compatibility fixture', publisher: 'talia-apps', license: 'MIT' };
    fs.writeFileSync(path.join(directory, 'talia-extension.json'), JSON.stringify(metadata));
    for (const file of ['LICENSE', 'NOTICE', 'README.md']) fs.writeFileSync(path.join(directory, file), 'Fixture');
    fs.writeFileSync(path.join(directory, 'index.html'), '<!doctype html><title>Fixture</title>');
    const current = path.join(directory, 'talia-app.json');
    const legacy = path.join(directory, 'orkas-app.json');
    const valid = JSON.stringify({ sdkVersion: 1, capabilities: ['storage'] });
    const build = () => packer.buildCatalogV3([directory]);
    fs.writeFileSync(legacy, valid);
    assert.equal(JSON.parse(build().artifacts[0].bytes).packages[0].files['orkas-app.json'], valid);
    fs.rmSync(legacy);
    fs.writeFileSync(current, valid);
    assert.equal(JSON.parse(build().artifacts[0].bytes).packages[0].files['talia-app.json'], valid);
    fs.writeFileSync(legacy, '{ invalid legacy }');
    assert.doesNotThrow(build);
    fs.writeFileSync(current, '{ invalid current }');
    assert.throws(build, /talia-app\.json must be valid JSON/);
    fs.writeFileSync(current, JSON.stringify({ sdkVersion: 2, capabilities: [] }));
    assert.throws(build, /talia-app\.json must use the supported SDK v1/);
  } finally { fs.rmSync(directory, { recursive: true, force: true }); }
});

test('packer accepts only coordinated built-in CLI references', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'talia-cli-reference-'));
  try {
    const metadata = { id: 'talia-connectors/feishu', kind: 'connector', version: '1.0.0',
      name: 'Feishu CLI', description: 'Built-in CLI setup', publisher: 'talia-connectors', license: 'MIT', minHostVersion: '0.10.0' };
    const connector = { schemaVersion: 1, catalog_reference: { id: metadata.id, catalog_id: 'feishu' } };
    fs.writeFileSync(path.join(directory, 'talia-extension.json'), JSON.stringify(metadata));
    for (const file of ['LICENSE', 'NOTICE', 'README.md']) fs.writeFileSync(path.join(directory, file), 'Fixture');
    const file = path.join(directory, 'connector.json');
    fs.writeFileSync(file, JSON.stringify(connector));
    const packer = require('../tools/talia-catalog-pack.cjs');
    assert.equal(JSON.parse(packer.buildCatalogV3([directory]).catalogBytes).packages[0].id, metadata.id);
    for (const catalog_id of ['xero', 'lark']) {
      fs.writeFileSync(file, JSON.stringify({ schemaVersion: 1, catalog_reference: { id: metadata.id, catalog_id } }));
      assert.throws(() => packer.buildCatalogV3([directory]), /invalid catalog reference/);
    }
  } finally { fs.rmSync(directory, { recursive: true, force: true }); }
});

test('packer validates scoped independent connector manifests', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'talia-independent-connector-'));
  try {
    const metadata = { id: 'talia-connectors/fixture', kind: 'connector', version: '1.0.0',
      name: 'Fixture', description: 'HTTPS scoped connector', publisher: 'talia-connectors', license: 'MIT' };
    fs.writeFileSync(path.join(directory, 'talia-extension.json'), JSON.stringify(metadata));
    for (const file of ['LICENSE', 'NOTICE', 'README.md']) fs.writeFileSync(path.join(directory, file), 'Fixture');
    const manifest = { schemaVersion: 1, id: metadata.id, auth: 'bearer', scope: 'project',
      operations: [{ id: 'find', method: 'GET', route: '/api/projects/{scope}/items' }] };
    const file = path.join(directory, 'connector.json');
    const packer = require('../tools/talia-catalog-pack.cjs');
    const pack = definition => {
      fs.writeFileSync(file, JSON.stringify({ schemaVersion: 1, independent_connector: definition }));
      return packer.buildCatalogV3([directory]);
    };
    const result = pack(manifest);
    assert.equal(JSON.parse(result.catalogBytes).packages[0].id, metadata.id);
    assert.deepEqual(JSON.parse(JSON.parse(result.artifacts[0].bytes).packages[0].files['connector.json']).independent_connector, manifest);
    for (const candidate of [
      { ...manifest, id: 'talia-connectors/other' },
      { ...manifest, command: 'provider-runtime' },
      { ...manifest, operations: [{ ...manifest.operations[0], route: '/api/../{scope}' }] },
    ]) assert.throws(() => pack(candidate), /invalid independent connector manifest/);
  } finally { fs.rmSync(directory, { recursive: true, force: true }); }
});

test('public store includes only the approved categories and canonical agent set', () => {
  assert.deepEqual([catalog.format, catalog.version], ['talia-extension-catalog', 3]);
  const counts = Object.fromEntries(['agent', 'skill', 'connector', 'app', 'library'].map((kind) => [kind, catalog.packages.filter((pkg) => pkg.kind === kind).length]));
  assert.deepEqual(counts, { agent: 17, skill: 28, connector: 51, app: 3, library: 1 });
  const agents = new Set(catalog.packages.filter((pkg) => pkg.kind === 'agent').map((pkg) => pkg.id));
  assert.deepEqual([...agents].sort(), [
    'talia-agents/app-architetto',
    'talia-agents/app-frontend',
    'talia-agents/app-backend',
    'talia-agents/app-devops',
    'talia-agents/app-e2e-tester',
    'talia-agents/functional-analyst',
    'talia-agents/product-manager',
    'talia-agents/contentwriter', 'talia-agents/deepresearcher',
    'talia-agents/ecommerce-researcher', 'talia-agents/imagestudio',
    'talia-agents/officeworker', 'talia-agents/pptmaker', 'talia-agents/productdeveloper',
    'talia-agents/seogeoagent', 'talia-agents/uidesigner', 'talia-agents/videostudio',
  ].sort());
  assert.equal([...agents].some((id) => /stockanalyser|ecommerceoperator|ecommercereviewer|ecommercewriter|ecommerceanalyzer/.test(id)), false);
});

test('signed sidecar routing tags stay compact and match their artifacts', () => {
  const index = JSON.parse(fs.readFileSync(path.join(root,'routing-index.json')));
  assert.equal(index.catalog_sha256,sha256(fs.readFileSync(catalogPath)));
  const routing = new Map(index.agents.map(row => [row.id,row]));
  for (const item of catalog.packages.filter(pkg => pkg.kind === 'agent')) {
    const row = routing.get(item.id);
    assert.equal(row.version,item.version);
    assert.ok(Array.isArray(row.tags) && row.tags.length > 0 && row.tags.length <= 16, item.id);
    const artifact = JSON.parse(fs.readFileSync(path.join(root, item.artifact.url), 'utf8')).packages[0];
    const definition = JSON.parse(artifact.files['agent.json']);
    assert.deepEqual(definition.routing_tags, row.tags, item.id);
  }
  assert.equal(routing.size,catalog.packages.filter(pkg => pkg.kind === 'agent').length);
});

test('senior app team references installable Store agent packages', () => {
  const template = JSON.parse(fs.readFileSync(path.join(root, 'agents/app-architetto/team-preset.json'), 'utf8'));
  const teamPackage = catalog.packages.find(row => row.kind === 'skill' && row.id === 'talia-teams/app-development');
  assert.ok(teamPackage, 'team bundle must be visible in the signed catalog');
  const teamArtifact = JSON.parse(fs.readFileSync(path.join(root, teamPackage.artifact.url), 'utf8')).packages[0];
  const bundle = JSON.parse(teamArtifact.files['team.json']);
  assert.equal(bundle.presetAgentPackage, 'talia-agents/app-architetto');
  assert.deepEqual(bundle.agentPackages, template.agentPackages);
  assert.deepEqual(bundle.optionalAgentPackages, template.optionalAgentPackages);
  assert.equal(template.schemaVersion, 1);
  const refs = [...template.agentPackages, ...template.optionalAgentPackages];
  assert.equal(new Set(refs).size, 8);
  for (const id of refs) assert.ok(catalog.packages.some(row => row.kind === 'agent' && row.id === id), id);
  assert.ok(template.agentPackages.includes('talia-agents/app-architetto'));
});

test('selected service listings are inert and complete', () => {
  const selected = ['excel','gcal','gdocs','gdrive','github','gitlab','gmail','google-ads','google-analytics','google-bigquery','google-classroom','google-maps','google-meet','google-photos','google-slides','google-tasks','google-workspace','gsearch-console','gsheets','gtasks','hugging-face','m365-calendar','m365-mail','microsoft-teams','onedrive','outlook','youtube'];
  for (const slug of selected) {
    const id=`talia-connectors/${slug}`;
    const item=catalog.packages.find(pkg=>pkg.id===id);
    assert.ok(item,id);
    const packagePayload=JSON.parse(fs.readFileSync(path.join(root,item.artifact.url),'utf8')).packages[0];
    const connector=JSON.parse(packagePayload.files['connector.json']);
    assert.deepEqual(Object.keys(connector).sort(),['catalog_listing','schemaVersion']);
    assert.equal(connector.catalog_listing.id,slug);
    assert.equal(connector.catalog_listing.integration_state,'requires_direct_auth');
    assert.equal(item.minHostVersion,'0.11.0');
  }
  assert.equal(catalog.packages.filter(pkg=>pkg.kind==='connector' && pkg.id.startsWith('talia-connectors/')).length,selected.length+8);
});

test('CLI Store entries reference only the matching built-in setup', () => {
  for (const slug of ['wecom', 'feishu', 'dingtalk']) {
    const id = `talia-connectors/${slug}`;
    const item = catalog.packages.find(pkg => pkg.id === id);
    assert.ok(item);
    const pkg = JSON.parse(fs.readFileSync(path.join(root, item.artifact.url), 'utf8')).packages[0];
    const connector = JSON.parse(pkg.files['connector.json']);
    assert.deepEqual(connector, { schemaVersion: 1, catalog_reference: { id, catalog_id: slug } });
  }
  assert.equal(catalog.packages.some(pkg => pkg.id === 'talia-connectors/lark'), false);
  assert.equal(catalog.packages.some(pkg => pkg.id === 'talia-connectors/xero'), false);
});
test('Atlassian packages use independent scoped manifests', () => {
  assert.ok(!catalog.packages.some(pkg => ['talia-connectors/atlassian', 'talia-connectors/bitbucket'].includes(pkg.id)));
  for (const slug of ['atlassian-confluence', 'atlassian-jira', 'atlassian-bitbucket', 'atlassian-bitbucket-datacenter']) {
    const id = `talia-connectors/${slug}`;
    const item = catalog.packages.find(pkg => pkg.id === id);
    assert.equal(item?.minHostVersion, '0.15.0');
    const { packages: [pkg] } = JSON.parse(fs.readFileSync(path.join(root, item.artifact.url), 'utf8'));
    const manifest = JSON.parse(pkg.files['connector.json']).independent_connector;
    assert.equal(manifest.id, id);
    assert.ok(manifest.operations.some(operation => operation.method === 'GET'));
    assert.ok(manifest.operations.every(operation => operation.method === 'GET' || operation.bodyTextPath || operation.scopeWrite));
  }
});
test('the complete Library manual has one canonical source and a signed artifact', () => {
  const item = catalog.packages.find(pkg => pkg.id === 'talia-library/manuale-talia');
  assert.ok(item);
  assert.equal(item.kind, 'library');
  assert.equal(item.minHostVersion, '0.11.0');
  const pkg = JSON.parse(fs.readFileSync(path.join(root, item.artifact.url), 'utf8')).packages[0];
  assert.deepEqual(JSON.parse(pkg.files['library.json']), { schemaVersion: 1, file: 'Manuale-Talia.md', destination: 'Manuale-Talia.md' });
  assert.equal(pkg.files['Manuale-Talia.md'], fs.readFileSync(path.join(root, 'library/manuale-talia/Manuale-Talia.md'), 'utf8'));
  assert.equal(pkg.files['Manuale-Talia.md'], fs.readFileSync(path.join(root, 'site/docs/Manuale-Talia.md'), 'utf8'));
});

test('every artifact is relative, digest-verified and retains its license and notice', () => {
  const urls = new Set();
  for (const item of catalog.packages) {
    const ref = item.artifact;
    assert.ok(ref && !path.isAbsolute(ref.url) && !ref.url.split('/').includes('..'));
    assert.equal(urls.has(ref.url), false);
    urls.add(ref.url);
    const bytes = fs.readFileSync(path.join(root, ...ref.url.split('/')));
    assert.equal(bytes.length, ref.size);
    assert.equal(sha256(bytes), ref.sha256);
    const payload = JSON.parse(bytes.toString('utf8'));
    assert.equal(payload.version, 2);
    assert.equal(payload.packages.length, 1);
    const pkg = payload.packages[0];
    assert.equal(pkg.id, item.id);
    assert.equal(pkg.kind, item.kind);
    assert.equal(typeof pkg.files.LICENSE, 'string');
    assert.equal(typeof pkg.files.NOTICE, 'string');
  }
  assert.ok(fs.statSync(path.join(root, 'public-key.txt')).isFile());
});

test('published artifact text contains no personal paths or credential values', () => {
  const privatePath = /(?:\/Users\/(?!\.\.\.)[^\s/]+|\/home\/(?!\.\.\.)[^\s/]+|[A-Za-z]:\\\\Users\\\\(?!\.\.\.)[^\\\\\s]+)/;
  const credential = /(?:Bearer\s+[A-Za-z0-9._~-]{20,}|(?:api[_-]?key|access[_-]?token|client[_-]?secret)\s*[:=]\s*["']?[A-Za-z0-9._~-]{20,})/i;
  for (const item of catalog.packages) {
    const bytes = fs.readFileSync(path.join(root, ...item.artifact.url.split('/')));
    const pkg = JSON.parse(bytes.toString('utf8')).packages[0];
    for (const content of Object.values(pkg.files)) {
      if (typeof content !== 'string') continue;
      assert.doesNotMatch(content, privatePath, item.id);
      assert.doesNotMatch(content, credential, item.id);
    }
  }
});

test('committed detached signature verifies against the published public key', () => {
  const envelope = JSON.parse(fs.readFileSync(path.join(root, 'catalog.signature.json'), 'utf8'));
  const publicKey = crypto.createPublicKey(fs.readFileSync(path.join(root, 'public-key.txt')));
  const payload = Buffer.from(envelope.payload_base64, 'base64');
  const signature = Buffer.from(envelope.signature_base64, 'base64');
  assert.equal(envelope.format, 'talia-catalog-signature-v1');
  assert.deepEqual(payload, fs.readFileSync(catalogPath));
  assert.equal(crypto.verify(null, payload, publicKey, signature), true);
});


test('SolidCraft is distributed as a portable template, not a configured local instance', () => {
  const item = catalog.packages.find(pkg => pkg.id === 'talia-connectors/solidcraft');
  assert.ok(item);
  assert.equal(item.version, '1.0.0');
  const pkg = JSON.parse(fs.readFileSync(path.join(root, item.artifact.url), 'utf8')).packages[0];
  const connector = JSON.parse(pkg.files['connector.json']);
  assert.equal(connector.template.id, item.id);
  assert.equal(connector.template.command_hint, 'solidcraft-cli');
  assert.deepEqual(connector.template.args, ['mcp']);
  assert.equal(connector.template.transport_kind, 'stdio');
  assert.equal(connector.template.documentation_url, 'https://docs.solidcraft.io/guide/mcp.html');
  assert.deepEqual(Object.keys(connector).sort(), ['schemaVersion', 'template']);
});
