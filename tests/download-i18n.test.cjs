'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const site = path.join(__dirname, '../site');
const read = name => fs.readFileSync(path.join(site, name), 'utf8');
const meta = JSON.parse(read('locale-meta.json'));
const english = JSON.parse(read('locales/en.json'));
const html = read('download-app/index.html');
const renderer = read('app.js').split('// Avvio dopo la selezione della lingua')[0];

function fakeDocument() {
  return {
    createElement(tag) {
      return { tag, children: [], attributes: {}, append(...children) { this.children.push(...children); },
        replaceChildren(...children) { this.children = children; },
        setAttribute(name, value) { this.attributes[name] = value; } };
    },
    createTextNode(text) { return { textContent: text }; },
  };
}

for (const locale of meta) {
  test(`${locale.code}: complete translation table and all installer names`, () => {
    const table = JSON.parse(read(`locales/${locale.code}.json`));
    assert.deepEqual(Object.keys(table).sort(), Object.keys(english).sort());
    for (const [key, value] of Object.entries(table)) {
      assert.equal(typeof value, 'string');
      assert.ok(value.trim(), key);
      assert.deepEqual(value.match(/\{\w+\}/g), english[key].match(/\{\w+\}/g), key);
    }
    for (const match of (html + read('index.html')).matchAll(/data-i18n(?:-content)?="([^"]+)"/g)) assert.ok(table[match[1]], match[1]);
    const document = fakeDocument();
    const context = vm.createContext({ document, Intl, URL, TaliaI18n: {
      locale: locale.intlLocale,
      t: (key, values = {}) => table[key].replace(/\{(\w+)\}/g, (match, name) => values[name] ?? match),
    } });
    vm.runInContext(renderer, context);
    const index = JSON.parse(read('releases.json'));
    let count = 0;
    for (const release of index.releases) {
      context.release = release;
      const cards = vm.runInContext('TARGETS.map(target => makePlatformCard(release, target))', context);
      for (const card of cards.filter(Boolean)) {
        const link = card.children.find(child => child.tag === 'a');
        if (!link) continue;
        assert.ok(link.attributes['aria-label'].includes(link.textContent));
        assert.ok(link.textContent.includes('DMG') || link.textContent.includes('ZIP') || link.textContent.includes('EXE') || link.textContent.includes('APPIMAGE'));
        assert.ok(Object.values(release.platforms).some(platform => platform.files.some(file => file.url === link.href)));
        count++;
      }
    }
    assert.equal(count, 27);
  });
}

test('static Download app entry preserves the home and works beneath a Pages prefix', () => {
  assert.match(read('index.html'), /href="download-app\/"/);
  assert.equal((read('index.html').match(/<figure class="screenshot-placeholder/g) || []).length, 3);
  assert.equal((read('index.html').match(/data-i18n="shotLabel"/g) || []).length, 3);
  for (const match of html.matchAll(/(?:href|src)="([^"#]+)"/g)) {
    const target = match[1];
    if (/^https:/.test(target)) continue;
    assert.ok(!target.startsWith('/'), target);
    const resolved = new URL(target, 'https://talia-orchestrator.github.io/talia-store/download-app/');
    assert.ok(resolved.pathname.startsWith('/talia-store/'), target);
    const local = path.join(site, decodeURIComponent(resolved.pathname.slice('/talia-store/'.length)));
    assert.ok(fs.existsSync(local), target);
  }
});

test('embedded English recovery table matches the canonical JSON', () => {
  const embedded = read('i18n.js').match(/let tables = \{ en: (.+) \};/);
  assert.ok(embedded);
  assert.deepEqual(JSON.parse(embedded[1]), english);
});
