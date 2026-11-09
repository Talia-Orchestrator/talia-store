#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const MANIFEST_NAME = 'talia-extension.json';
const CATALOG_FORMAT = 'talia-extension-catalog';
const SIGNATURE_FORMAT = 'talia-catalog-signature-v1';
const MAX_PACKAGES = 128;
const MAX_CATALOG_BYTES = 2 * 1024 * 1024;
const MAX_V2_CATALOG_BYTES = 12 * 1024 * 1024;
const MAX_V2_FILE_BYTES = 2 * 1024 * 1024;
const MAX_V2_PACKAGE_BYTES = 4 * 1024 * 1024;
const MAX_V2_TOTAL_BYTES = 8 * 1024 * 1024;
const RESERVED_FILE = '_install.json';

function fail(message) {
  throw new Error(message);
}

function compareCodepoints(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

function safePackageId(value, field) {
  if (typeof value !== 'string' || value.length > 200 || !/^[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+$/.test(value)) {
    fail(`${field} must be a namespaced id in publisher/name form`);
  }
  return value;
}

function safeMetadataText(value, field, max = 256) {
  if (typeof value !== 'string' || !value.trim() || value.length > max || /[\u0000-\u001f\u007f]/.test(value)) {
    fail(`${field} is invalid`);
  }
  return value;
}

function isSemver(value) {
  if (typeof value !== 'string' || value.length > 80) return false;
  const match = /^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/.exec(value.trim());
  return !!match && !(match[4] || '').split('.').some(part => /^\d+$/.test(part) && part.length > 1 && part.startsWith('0'));
}

function validateRelativePath(value) {
  if (typeof value !== 'string' || value.length === 0 || value.length > 512 || value.startsWith('/')
    || /[\\\u0000-\u001f\u007f:<>"|?*]/.test(value)) fail('package contains an invalid relative path');
  const parts = value.split('/');
  const reserved = new Set(['node_modules', '_install.json', '_cache.json', '_marketplace.json', '_resource_manifest.json']);
  if (parts.some(part => !part || part.startsWith('.') || /[. ]$/.test(part)
    || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(part) || reserved.has(part.toLowerCase()))) {
    fail(`package contains a reserved or hidden path: ${value}`);
  }
  return value;
}

function decodeUtf8(bytes, label) {
  try {
    const text = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes);
    if (text.includes('\0')) fail(`${label} is not a supported text file`);
    return text;
  } catch (error) {
    if (error instanceof Error && error.message.endsWith('is not a supported text file')) throw error;
    fail(`${label} is not valid UTF-8`);
  }
}

function scanPackageFiles(packageDirectory, version = 1, binaryFiles = []) {
  const root = fs.realpathSync(packageDirectory);
  const rootStat = fs.lstatSync(packageDirectory);
  if (rootStat.isSymbolicLink() || !rootStat.isDirectory()) fail('each package path must be a real directory');
  const files = Object.create(null);
  const binary = new Set(binaryFiles);
  let totalBytes = 0;

  function walk(directory, relativeDirectory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const relative = relativeDirectory ? `${relativeDirectory}/${entry.name}` : entry.name;
      if (relative === MANIFEST_NAME) continue;
      validateRelativePath(relative);
      const absolute = path.join(directory, entry.name);
      const stat = fs.lstatSync(absolute);
      if (stat.isSymbolicLink()) fail(`package may not contain symlinks: ${relative}`);
      if (stat.isDirectory()) {
        walk(absolute, relative);
        continue;
      }
      if (!stat.isFile()) fail(`package contains a special file: ${relative}`);
      const maxFile = version >= 2 ? MAX_V2_FILE_BYTES : MAX_CATALOG_BYTES;
      const fd = fs.openSync(absolute, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW || 0));
      let data;
      try {
        const fresh=fs.fstatSync(fd);
        if (!fresh.isFile() || fresh.size>maxFile) fail('package file exceeds limit');
        const chunks=[]; let read=0;
        for (;;) {
          const part=Buffer.alloc(Math.min(65536,maxFile+1-read));
          const n=fs.readSync(fd,part,0,part.length,null);
          if (!n) break;
          read+=n; if(read>maxFile) fail('package file exceeds limit');
          chunks.push(part.subarray(0,n));
        }
        data=Buffer.concat(chunks,read);
      } finally { fs.closeSync(fd); }
      totalBytes+=data.length;
      if (version>=2 && totalBytes>MAX_V2_PACKAGE_BYTES) fail('package exceeds decoded byte limit');
      files[relative] = binary.has(relative) ? {encoding:'base64',data:data.toString('base64')} : decodeUtf8(data, relative);
    }
  }

  walk(root, '');
  for (const name of binary) if (!Object.hasOwn(files,name)) fail('declared binary file is missing');
  if (!Object.keys(files).length) fail('package has no UTF-8 content files');
  if (Object.keys(files).length > 500) fail('package may contain at most 500 files');
  const folded = new Set();
  for (const file of Object.keys(files)) {
    const key = file.normalize('NFC').toLowerCase();
    if (folded.has(key)) fail('package paths collide after case folding or Unicode normalization');
    folded.add(key);
  }
  for (const file of Object.keys(files)) {
    const parts = file.split('/');
    while (parts.length > 1) {
      parts.pop();
      if (folded.has(parts.join('/').normalize('NFC').toLowerCase())) fail('package file path conflicts with a directory path');
    }
  }
  return Object.fromEntries(Object.entries(files).sort(([a], [b]) => compareCodepoints(a, b)));
}

function digestFiles(files) {
  const sorted = Object.fromEntries(Object.entries(files).sort(([a], [b]) => compareCodepoints(a, b))
    .map(([name,value]) => [name, typeof value === 'string' ? value : {encoding:value.encoding,data:value.data}]));
  return `sha256:${crypto.createHash('sha256').update(Buffer.from(JSON.stringify(sorted), 'utf8')).digest('hex')}`;
}

function readAgentSkillList(item, label) {
  let agent;
  try { agent = JSON.parse(item.files['agent.json']); } catch (_) { fail(`${label}: agent.json must be valid JSON`); }
  if (!agent || typeof agent !== 'object' || Array.isArray(agent)) fail(`${label}: agent.json must be a JSON object`);
  if (agent.skill_list === undefined) return [];
  if (!Array.isArray(agent.skill_list) || agent.skill_list.some(skill => typeof skill !== 'string' || !skill.trim())
    || new Set(agent.skill_list).size !== agent.skill_list.length) fail(`${label}: skill_list must contain unique ids`);
  return agent.skill_list;
}

function validateAppManifest(manifest, label) {
  const allowed = ['sdkVersion', 'minimumClient', 'capabilities', 'data'];
  const capabilities = ['storage', 'appFiles', 'files', 'ai', 'library', 'connectors', 'data'];
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)
    || Object.keys(manifest).some(key => !allowed.includes(key))) {
    fail(`${label}: orkas-app.json contains unknown or invalid fields`);
  }
  if (manifest.sdkVersion !== 1
    || (manifest.minimumClient !== undefined && manifest.minimumClient !== '1.9.0')
    || !Array.isArray(manifest.capabilities) || manifest.capabilities.length > capabilities.length
    || manifest.capabilities.some(capability => !capabilities.includes(capability))) {
    fail(`${label}: orkas-app.json must use the supported SDK v1 manifest fields`);
  }
  if (Object.hasOwn(manifest, 'data') && (!manifest.data || typeof manifest.data !== 'object' || Array.isArray(manifest.data))) {
    fail(`${label}: orkas-app.json data must be an object`);
  }
  if (manifest.capabilities.includes('data') && !Object.hasOwn(manifest, 'data')) {
    fail(`${label}: orkas-app.json must declare a data object when using the data capability`);
  }
}

function validatePackageDependencies(packages) {
  const skillsById = new Map();
  for (const item of packages) {
    if (item.kind !== 'skill') continue;
    const matches = skillsById.get(item.id) || [];
    matches.push(item);
    skillsById.set(item.id, matches);
  }
  for (const item of packages) {
    const dependencies = item.dependencies || [];
    if (dependencies.length && item.kind !== 'agent') fail(`${item.id}: only agents may declare shared skill dependencies`);
    if (dependencies.length > 32) fail(`${item.id}: packages may declare at most 32 dependencies`);
    const declared = new Set();
    for (const dependency of dependencies) {
      if (!dependency || typeof dependency !== 'object' || Array.isArray(dependency)
        || Object.keys(dependency).some(key => key !== 'kind' && key !== 'id') || dependency.kind !== 'skill') {
        fail(`${item.id}: only skill dependencies with kind and id are supported`);
      }
      const dependencyId = safePackageId(dependency.id, `${item.id} dependency id`);
      if (declared.has(dependencyId)) fail(`${item.id}: dependencies must be unique`);
      declared.add(dependencyId);
    }
    if (item.kind !== 'agent') continue;
    const skillList = readAgentSkillList(item, item.id);
    const bundled = new Set(Object.keys(item.files)
      .map(file => /^skills\/([A-Za-z0-9_-]+)\/SKILL\.md$/.exec(file)?.[1])
      .filter(Boolean));
    const shared = new Set();
    for (const ref of skillList) {
      if (ref.includes('/')) {
        const id = safePackageId(ref, `${item.id} skill_list reference`);
        if (!declared.has(id)) fail(`${item.id}: shared skill reference is not declared in dependencies: ${id}`);
        const matches = skillsById.get(id) || [];
        if (matches.length === 0) fail(`${item.id}: shared skill dependency is missing from this catalog: ${id}`);
        if (matches.length > 1) fail(`${item.id}: shared skill dependency is ambiguous: ${id}`);
        shared.add(id);
      } else if (!/^[A-Za-z0-9_-]+$/.test(ref) || !bundled.has(ref)) {
        fail(`${item.id}: private skill reference must match a bundled skills/<id>/SKILL.md: ${ref}`);
      }
    }
    for (const id of declared) {
      if (!shared.has(id)) fail(`${item.id}: declared shared skill dependency is unused: ${id}`);
    }
  }
}

function readPackage(packageDirectory, formatVersion = 1) {
  const packageStat = fs.lstatSync(packageDirectory);
  if (packageStat.isSymbolicLink() || !packageStat.isDirectory()) fail('each package path must be a real directory');
  const manifestPath = path.join(packageDirectory, MANIFEST_NAME);
  const manifestStat = fs.lstatSync(manifestPath);
  if (manifestStat.isSymbolicLink() || !manifestStat.isFile()) fail('package manifest must be a regular local file');
  let manifest;
  try {
    manifest = JSON.parse(decodeUtf8(fs.readFileSync(manifestPath), manifestPath));
  } catch (_) {
    fail(`package manifest is missing or invalid: ${packageDirectory}`);
  }
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) fail('package manifest must be a JSON object');
  const id = safePackageId(manifest.id, 'id');
  const kind = manifest.kind;
  if (!['agent', 'skill', 'connector', 'app'].includes(kind) || (formatVersion === 1 && kind !== 'agent' && kind !== 'skill')) {
    fail(`${id}: kind must be agent, skill, connector, or app`);
  }
  const publisher = manifest.publisher;
  if (typeof publisher !== 'string' || !/^[A-Za-z0-9_-]+$/.test(publisher)) fail(`${id}: publisher is invalid`);
  if (id.split('/')[0] !== publisher) fail(`${id}: publisher must match the id namespace`);
  const name = safeMetadataText(manifest.name, `${id} name`);
  const description = safeMetadataText(manifest.description, `${id} description`, 4000);
  const version = manifest.version;
  if (!isSemver(version)) fail(`${id}: version must be semver`);
  const license = safeMetadataText(manifest.license, `${id} license`);
  const repository = manifest.repository;
  if (repository !== undefined) safeMetadataText(repository, `${id} repository`, 2048);
  const minHostVersion = manifest.minHostVersion;
  if (minHostVersion !== undefined && !isSemver(minHostVersion)) fail(`${id}: minHostVersion must be semver`);

  const declarations=manifest.binaryFiles === undefined ? [] : manifest.binaryFiles;
  if (!Array.isArray(declarations) || declarations.some(value => typeof value !== 'string') || new Set(declarations).size !== declarations.length) fail('binaryFiles must contain distinct file paths');
  if (formatVersion !== 2 && formatVersion !== 3 && declarations.length) fail('binaryFiles require format 2 or 3');
  for (const value of declarations) {
    validateRelativePath(value);
    if (/(?:^|\/)(?:AGENT\.md|SKILL\.md)$/i.test(value) || /\.json$/i.test(value)) fail('mandatory metadata and instruction files must be text');
  }
  const files = scanPackageFiles(packageDirectory, formatVersion, declarations);
  const entrypoint = kind === 'agent' ? 'agent.json' : kind === 'skill' ? 'SKILL.md' : kind === 'connector' ? 'connector.json' : 'orkas-app.json';
  if (!Object.hasOwn(files, entrypoint)) fail(`${id}: ${kind} packages require ${entrypoint}`);
  if (kind === 'connector') {
    let connector;
    try { connector = JSON.parse(files['connector.json']); } catch (_) { fail(`${id}: connector.json must be valid JSON`); }
    if (!connector || typeof connector !== 'object' || Array.isArray(connector) || connector.schemaVersion !== 1) {
      fail(`${id}: connector.json must use schemaVersion 1`);
    }
    if (connector.preset !== undefined && connector.template === undefined) {
      if (!connector.preset || typeof connector.preset !== 'object' || Array.isArray(connector.preset)) fail(`${id}: connector preset must be an object`);
    } else if (connector.template !== undefined && connector.preset === undefined) {
      const template = connector.template;
      const allowed = ['id', 'display_name', 'transport_kind', 'description_en', 'documentation_url', 'command_hint', 'args', 'url_hint'];
      if (!template || typeof template !== 'object' || Array.isArray(template)
        || Object.keys(template).some(key => !allowed.includes(key))
        || safePackageId(template.id, `${id} template id`) !== template.id
        || !safeMetadataText(template.display_name, `${id} template display_name`)
        || !['stdio', 'streamable-http'].includes(template.transport_kind)
        || !safeMetadataText(template.description_en, `${id} template description_en`, 4000)
        || !safeMetadataText(template.documentation_url, `${id} template documentation_url`, 2048)
        || !/^https:\/\//i.test(template.documentation_url)
        ) {
        fail(`${id}: connector template is invalid`);
      }
      if (template.transport_kind === 'stdio') {
        if (!safeMetadataText(template.command_hint, `${id} template command_hint`, 512)
          || !Array.isArray(template.args) || template.args.length > 64
          || template.args.some(arg => typeof arg !== 'string' || arg.length > 512 || /[\u0000-\u001f\u007f]/.test(arg))
          || template.url_hint !== undefined) fail(`${id}: stdio connector template is invalid`);
      } else {
        let endpoint;
        try { endpoint = new URL(template.url_hint); } catch (_) { endpoint = null; }
        if (!endpoint || endpoint.protocol !== 'https:' || endpoint.username || endpoint.password || endpoint.search || endpoint.hash
          || template.command_hint !== undefined || template.args !== undefined) fail(`${id}: streamable-http connector template is invalid`);
      }
    } else {
      fail(`${id}: connector.json must contain exactly one preset or template object`);
    }
  }
  if (kind === 'app') {
    let appManifest;
    try { appManifest = JSON.parse(files['orkas-app.json']); } catch (_) { fail(`${id}: orkas-app.json must be valid JSON`); }
    if (!Object.hasOwn(files, 'index.html')) {
      fail(`${id}: app packages require an SDK v1 manifest, capabilities, and index.html`);
    }
    validateAppManifest(appManifest, id);
  }
  let dependencies;
  if (manifest.dependencies !== undefined) {
    if (!Array.isArray(manifest.dependencies)) fail(`${id}: dependencies must be an array`);
    if (kind === 'skill' && manifest.dependencies.length) fail(`${id}: skill packages cannot declare dependencies`);
    if (kind !== 'agent' && kind !== 'skill' && manifest.dependencies.length) fail(`${id}: only agents may declare dependencies`);
    if (manifest.dependencies.length > 32) fail(`${id}: packages may declare at most 32 dependencies`);
    dependencies = manifest.dependencies.map(dependency => {
      if (!dependency || dependency.kind !== 'skill') fail(`${id}: only skill dependencies are supported`);
      return { kind: 'skill', id: safePackageId(dependency.id, `${id} dependency id`) };
    }).sort((a, b) => compareCodepoints(a.id, b.id));
    if (new Set(dependencies.map(dependency => dependency.id)).size !== dependencies.length) fail(`${id}: dependencies must be unique`);
  }
  if (kind === 'agent') {
    const item = { id, kind, version, name, description, publisher, license, files, digest: digestFiles(files), dependencies };
    readAgentSkillList(item, id);
  }
  return {
    id, kind, version, name: name.trim(), description: description.trim(), publisher,
    license: license.trim(), files, digest: digestFiles(files),
    ...(repository ? { repository } : {}),
    ...(minHostVersion ? { minHostVersion } : {}),
    ...(dependencies?.length ? { dependencies } : {}),
  };
}

function buildCatalog(packageDirectories, formatVersion = 1) {
  if (formatVersion === 3) return buildCatalogV3(packageDirectories).catalogBytes;
  if (formatVersion !== 1 && formatVersion !== 2) fail('unsupported catalog format');
  if (!Array.isArray(packageDirectories) || packageDirectories.length === 0) fail('provide at least one --package directory');
  if (packageDirectories.length > MAX_PACKAGES) fail(`catalog may contain at most ${MAX_PACKAGES} packages`);
  const packages = packageDirectories.map(directory => readPackage(directory, formatVersion)).sort((a, b) => compareCodepoints(a.id, b.id));
  if (new Set(packages.map(item => item.id)).size !== packages.length) fail('catalog package ids must be unique');
  validatePackageDependencies(packages);
  const payload = { format: CATALOG_FORMAT, version: formatVersion, packages };
  const bytes = Buffer.from(`${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  const max = formatVersion===2 ? MAX_V2_CATALOG_BYTES : MAX_CATALOG_BYTES;
  if (bytes.length > max) fail('catalog exceeds byte limit');
  validateCatalogBytes(bytes);
  return bytes;
}

function buildCatalogV3(packageDirectories) {
  if (!Array.isArray(packageDirectories) || packageDirectories.length === 0) fail('provide at least one --package directory');
  if (packageDirectories.length > MAX_PACKAGES) fail(`catalog may contain at most ${MAX_PACKAGES} packages`);
  const packages = packageDirectories.map(directory => readPackage(directory, 3)).sort((a, b) => compareCodepoints(a.id, b.id));
  if (new Set(packages.map(item => item.id)).size !== packages.length) fail('catalog package ids must be unique');
  validatePackageDependencies(packages);
  const artifacts = [];
  const indexPackages = packages.map(item => {
    const artifactPayload = { format: CATALOG_FORMAT, version: 2, packages: [item] };
    const artifactBytes = Buffer.from(`${JSON.stringify(artifactPayload, null, 2)}\n`, 'utf8');
    validateCatalogBytes(artifactBytes, { allowUnresolvedDependencies: true });
    const url = `artifacts/${item.id.replace('/', '-')}-${item.version}.json`;
    validateRelativePath(url);
    artifacts.push({ url, bytes: artifactBytes });
    const { files: _files, ...metadata } = item;
    return {
      ...metadata,
      artifact: {
        url,
        sha256: `sha256:${crypto.createHash('sha256').update(artifactBytes).digest('hex')}`,
        size: artifactBytes.length,
      },
    };
  });
  const catalogBytes = Buffer.from(`${JSON.stringify({ format: CATALOG_FORMAT, version: 3, packages: indexPackages }, null, 2)}\n`, 'utf8');
  if (catalogBytes.length > MAX_CATALOG_BYTES) fail('catalog exceeds byte limit');
  validateCatalogBytes(catalogBytes);
  return { catalogBytes, artifacts };
}

function validateCatalogV3Payload(payload) {
  if (!payload || payload.format !== CATALOG_FORMAT || payload.version !== 3 || !Array.isArray(payload.packages)
    || payload.packages.length === 0 || payload.packages.length > MAX_PACKAGES) fail('catalog payload schema is invalid');
  const ids = new Set();
  const urls = new Set();
  for (const item of payload.packages) {
    if (!item || !['agent', 'skill', 'connector', 'app'].includes(item.kind)
      || Object.hasOwn(item, 'files') || !item.artifact || typeof item.artifact !== 'object'
      || Array.isArray(item.artifact)) fail('catalog package digest or schema is invalid');
    const allowed = ['id', 'kind', 'version', 'name', 'description', 'publisher', 'license', 'repository', 'minHostVersion', 'dependencies', 'digest', 'artifact'];
    if (Object.keys(item).some(key => !allowed.includes(key))) fail('catalog package digest or schema is invalid');
    const id = safePackageId(item.id, 'catalog package id');
    if (ids.has(id)) fail('catalog package ids must be unique');
    ids.add(id);
    if (typeof item.publisher !== 'string' || !/^[A-Za-z0-9_-]+$/.test(item.publisher) || id.split('/')[0] !== item.publisher
      || typeof item.name !== 'string' || !item.name.trim() || item.name.length > 256
      || typeof item.description !== 'string' || !item.description.trim() || item.description.length > 4000
      || typeof item.license !== 'string' || !item.license.trim() || item.license.length > 256
      || /[\u0000-\u001f\u007f]/.test(item.name) || /[\u0000-\u001f\u007f]/.test(item.description)
      || /[\u0000-\u001f\u007f]/.test(item.license) || !isSemver(item.version)
      || (item.repository !== undefined && (typeof item.repository !== 'string' || !item.repository || item.repository.length > 2048))
      || (item.minHostVersion !== undefined && !isSemver(item.minHostVersion))
      || !/^sha256:[a-f0-9]{64}$/.test(item.digest)) fail('catalog package metadata is invalid');
    const artifact = item.artifact;
    if (Object.keys(artifact).sort().join(',') !== 'sha256,size,url'
      || typeof artifact.url !== 'string' || !artifact.url || artifact.url.length > 512
      || artifact.url.startsWith('/') || /[\\\u0000-\u001f\u007f:<>"|?*]/.test(artifact.url)
      || artifact.url.split('/').some(part => !part || part.startsWith('.') || /[. ]$/.test(part))
      || !/^sha256:[a-f0-9]{64}$/.test(artifact.sha256)
      || !Number.isSafeInteger(artifact.size) || artifact.size < 1 || artifact.size > MAX_V2_CATALOG_BYTES) {
      fail('catalog package artifact descriptor is invalid');
    }
    validateRelativePath(artifact.url);
    if (urls.has(artifact.url)) fail('catalog artifact URLs must be unique');
    urls.add(artifact.url);
    if (item.dependencies !== undefined) {
      if (!Array.isArray(item.dependencies) || item.dependencies.length > 32 || (item.kind !== 'agent' && item.dependencies.length)) {
        fail('catalog package dependencies are invalid');
      }
      const seen = new Set();
      for (const dependency of item.dependencies) {
        if (!dependency || typeof dependency !== 'object' || Array.isArray(dependency)
          || Object.keys(dependency).sort().join(',') !== 'id,kind' || dependency.kind !== 'skill') fail('catalog package dependencies are invalid');
        const dependencyId = safePackageId(dependency.id, 'dependency id');
        if (seen.has(dependencyId)) fail('catalog package dependencies are invalid');
        seen.add(dependencyId);
      }
    }
  }
}

function validateCatalogBytes(payloadBytes, options = {}) {
  if (!Buffer.isBuffer(payloadBytes)) payloadBytes = Buffer.from(payloadBytes);
  if (payloadBytes.length > MAX_V2_CATALOG_BYTES) fail('catalog exceeds byte limit');
  let payload;
  try { payload = JSON.parse(decodeUtf8(payloadBytes, 'catalog')); }
  catch (_) { fail('catalog payload is not valid UTF-8 JSON'); }
  if (!payload || payload.format !== CATALOG_FORMAT || (payload.version !== 1 && payload.version !== 2 && payload.version !== 3) || !Array.isArray(payload.packages)
    || payload.packages.length === 0 || payload.packages.length > MAX_PACKAGES) fail('catalog payload schema is invalid');
  if (payload.version === 3) {
    validateCatalogV3Payload(payload);
    return payloadBytes;
  }
  if (payload.version===1 && payloadBytes.length>MAX_CATALOG_BYTES) fail('catalog exceeds byte limit');
  const ids = new Set(); let totalBytes=0;
  for (const item of payload.packages) {
    if (!item || !['agent', 'skill', ...(payload.version === 1 ? [] : ['connector', 'app'])].includes(item.kind)
      || typeof item.files !== 'object' || Array.isArray(item.files)
      || item.files === null || typeof item.digest !== 'string') fail('catalog package digest or schema is invalid');
    const id = safePackageId(item.id, 'catalog package id');
    if (typeof item.publisher !== 'string' || !/^[A-Za-z0-9_-]+$/.test(item.publisher) || id.split('/')[0] !== item.publisher
      || typeof item.name !== 'string' || !item.name.trim()
      || item.name.length > 256 || typeof item.description !== 'string' || !item.description.trim() || item.description.length > 4000
      || typeof item.license !== 'string' || !item.license.trim() || item.license.length > 256
      || /[\u0000-\u001f\u007f]/.test(item.name) || /[\u0000-\u001f\u007f]/.test(item.description)
      || /[\u0000-\u001f\u007f]/.test(item.license)
      || !isSemver(item.version)) {
      fail('catalog package metadata is invalid');
    }
    if ((item.repository !== undefined && (typeof item.repository !== 'string' || !item.repository || item.repository.length > 2048
      || /[\u0000-\u001f\u007f]/.test(item.repository)))
      || (item.minHostVersion !== undefined && !isSemver(item.minHostVersion))) {
      fail('catalog package metadata is invalid');
    }
    const paths = Object.keys(item.files);
    if (paths.length === 0 || paths.length > 500) fail('catalog package file count is invalid');
    const foldedPaths = new Set();
    for (const file of paths) {
      validateRelativePath(file);
      const folded = file.normalize('NFC').toLowerCase();
      if (foldedPaths.has(folded)) fail('catalog package paths collide after normalization');
      foldedPaths.add(folded);
    }
    for (const file of paths) {
      const parts = file.split('/');
      while (parts.length > 1) {
        parts.pop();
        if (foldedPaths.has(parts.join('/').normalize('NFC').toLowerCase())) fail('catalog package file path conflicts with a directory path');
      }
    }
    let packageBytes=0;
    for (const [file, content] of Object.entries(item.files)) {
      if (typeof content === 'string') {
        if (content.includes('\0') || Buffer.from(content,'utf8').toString('utf8')!==content) fail('catalog package content must be UTF-8 text');
        const length=Buffer.byteLength(content,'utf8');
        if (payload.version===2 && length>MAX_V2_FILE_BYTES) fail('catalog package file exceeds byte limit');
        packageBytes+=length;
      } else {
        if (payload.version!==2 || /(?:^|\/)(?:AGENT\.md|SKILL\.md)$/i.test(file) || /\.json$/i.test(file)
          || !content || typeof content!=='object' || Array.isArray(content)
          || Object.keys(content).sort().join(',')!=='data,encoding' || content.encoding!=='base64'
          || typeof content.data!=='string' || content.data.length>Math.ceil(MAX_V2_FILE_BYTES/3)*4
          || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(content.data)) fail('catalog binary content is invalid');
        const bytes=Buffer.from(content.data,'base64');
        if (bytes.length>MAX_V2_FILE_BYTES || bytes.toString('base64')!==content.data) fail('catalog binary content is invalid');
        packageBytes+=bytes.length;
      }
    }
    if (item.digest!==digestFiles(item.files)) fail('catalog package digest or schema is invalid');
    totalBytes+=packageBytes;
    if (payload.version===2 && (packageBytes>MAX_V2_PACKAGE_BYTES || totalBytes>MAX_V2_TOTAL_BYTES)) fail('catalog exceeds decoded byte limit');
    const entrypoint = item.kind === 'agent' ? 'agent.json' : item.kind === 'skill' ? 'SKILL.md' : item.kind === 'connector' ? 'connector.json' : 'orkas-app.json';
    if (typeof item.files[entrypoint] !== 'string') fail('catalog package entrypoint is missing');
    if (item.kind === 'app' && typeof item.files['index.html'] !== 'string') fail('catalog app bundle entrypoint is missing');
    if (item.kind === 'app') {
      let appManifest;
      try { appManifest = JSON.parse(item.files['orkas-app.json']); } catch (_) { fail('catalog app manifest is invalid'); }
      validateAppManifest(appManifest, 'catalog app');
    }
    if (item.dependencies !== undefined && (!Array.isArray(item.dependencies) || item.dependencies.length > 32
      || (item.kind === 'skill' && item.dependencies.length > 0))) fail('catalog package dependencies are invalid');
    if (item.kind === 'agent') {
      readAgentSkillList(item, 'catalog package');
    }
    if (ids.has(item.id)) fail('catalog package ids must be unique');
    ids.add(item.id);
  }
  if (!options.allowUnresolvedDependencies) validatePackageDependencies(payload.packages);
  return payloadBytes;
}

function createSignatureEnvelope(payloadBytes, privateKeyPath) {
  const rawPayload = validateCatalogBytes(payloadBytes);
  let key;
  try { key = crypto.createPrivateKey(fs.readFileSync(privateKeyPath)); }
  catch (_) { fail('could not read an Ed25519 private key from the key file'); }
  if (key.asymmetricKeyType !== 'ed25519') fail('key file must contain an Ed25519 private key');
  const signature = crypto.sign(null, rawPayload, key);
  const envelope = {
    format: SIGNATURE_FORMAT,
    payload_base64: rawPayload.toString('base64'),
    signature_base64: signature.toString('base64'),
  };
  return Buffer.from(`${JSON.stringify(envelope, null, 2)}\n`, 'utf8');
}

function writeAtomic(outputPath, bytes) {
  const absolute = path.resolve(outputPath);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  const temporary = `${absolute}.${process.pid}.${crypto.randomBytes(6).toString('hex')}.tmp`;
  try {
    fs.writeFileSync(temporary, bytes, { mode: 0o600, flag: 'wx' });
    fs.renameSync(temporary, absolute);
  } finally {
    try { fs.unlinkSync(temporary); } catch (_) { /* già rinominato o non creato */ }
  }
}

function parseArgs(argv) {
  const [command, ...rest] = argv;
  const values = { command, packages: [] };
  for (let index = 0; index < rest.length; index += 1) {
    const flag = rest[index];
    if (flag === '--package') values.packages.push(rest[++index]);
    else if (flag === '--out') values.out = rest[++index];
    else if (flag === '--catalog') values.catalog = rest[++index];
    else if (flag === '--key') values.key = rest[++index];
    else if (flag === '--format') values.format = rest[++index];
    else if (flag === '--help' || flag === '-h') values.help = true;
    else fail(`unknown option: ${flag}`);
    if (flag !== '--help' && flag !== '-h' && flag !== '--package' && !values[flag.slice(2)]) fail(`missing value for ${flag}`);
    if (flag === '--package' && !values.packages.at(-1)) fail('missing value for --package');
  }
  return values;
}

function usage() {
  return [
    'Uso:',
    '  node scripts/talia-catalog-pack.cjs build --package DIR [--package DIR ...] [--format 2|3] --out catalog.json',
    '  node scripts/talia-catalog-pack.cjs sign --catalog catalog.json --key ed25519-private.pem --out catalog.signature.json',
    '',
    `Ogni pacchetto contiene ${MANIFEST_NAME}; la chiave privata resta nel file locale e non viene mostrata.`,
  ].join('\n');
}

function main(argv = process.argv.slice(2)) {
  if (argv[0] === '--help' || argv[0] === '-h') { process.stdout.write(`${usage()}\n`); return; }
  const args = parseArgs(argv);
  if (args.help || !args.command) { process.stdout.write(`${usage()}\n`); return; }
  if (args.command === 'build') {
    if (!args.out) fail('build requires --out');
    if (args.format!==undefined && args.format!=='1' && args.format!=='2' && args.format!=='3') fail('unsupported catalog format');
    const version=args.format===undefined ? 1 : Number(args.format);
    let bytes;
    if (version === 3) {
      const built = buildCatalogV3(args.packages.map(directory => path.resolve(directory)));
      const outputRoot = path.resolve(path.dirname(args.out));
      for (const artifact of built.artifacts) writeAtomic(path.join(outputRoot, artifact.url), artifact.bytes);
      bytes = built.catalogBytes;
    } else bytes = buildCatalog(args.packages.map(directory => path.resolve(directory)),version);
    writeAtomic(args.out, bytes);
    process.stdout.write(`Catalogo creato: ${path.resolve(args.out)} (${JSON.parse(bytes).packages.length} pacchetti, ${bytes.length} byte).\n`);
    return;
  }
  if (args.command === 'sign') {
    if (!args.catalog || !args.key || !args.out) fail('sign requires --catalog, --key and --out');
    const payload = fs.readFileSync(args.catalog);
    const envelope = createSignatureEnvelope(payload, args.key);
    writeAtomic(args.out, envelope);
    process.stdout.write(`Envelope Ed25519 creato: ${path.resolve(args.out)} (${envelope.length} byte).\n`);
    return;
  }
  fail(`unknown command: ${args.command}`);
}

if (require.main === module) {
  try { main(); }
  catch (error) {
    process.stderr.write(`Errore: ${error instanceof Error ? error.message : 'operazione non riuscita'}\n`);
    process.stderr.write(`${usage()}\n`);
    process.exitCode = 1;
  }
}

module.exports = {
  MANIFEST_NAME,
  buildCatalog,
  buildCatalogV3,
  createSignatureEnvelope,
  digestFiles,
  validateCatalogBytes,
};
