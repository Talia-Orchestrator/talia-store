'use strict';

// Verifica opzionale, senza dipendenze aggiunte al progetto.
// TALIA_PLAYWRIGHT_MODULE e TALIA_AXE_PATH indicano installazioni locali esistenti.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.TALIA_PLAYWRIGHT_MODULE || 'playwright');
const axePath = process.env.TALIA_AXE_PATH || require.resolve('axe-core/axe.min.js');
const site = path.resolve(__dirname, '../site');
const meta = JSON.parse(fs.readFileSync(path.join(site, 'locale-meta.json')));
const index = JSON.parse(fs.readFileSync(path.join(site, 'releases.json')));
const output = process.env.TALIA_BROWSER_OUTPUT || '/tmp/talia-download-i18n';
fs.mkdirSync(output, { recursive: true });
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml' };
const server = http.createServer((request, response) => {
  const url = new URL(request.url, 'http://localhost');
  if (!url.pathname.startsWith('/talia-store/')) { response.writeHead(404).end(); return; }
  let file = path.resolve(site, '.' + decodeURIComponent(url.pathname.slice('/talia-store'.length)));
  if (!file.startsWith(site + path.sep) && file !== site) { response.writeHead(403).end(); return; }
  try {
    if (fs.statSync(file).isDirectory()) {
      if (!url.pathname.endsWith('/')) { response.writeHead(301, { Location: url.pathname + '/' + url.search }).end(); return; }
      file = path.join(file, 'index.html');
    }
    response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    response.end(fs.readFileSync(file));
  } catch { response.writeHead(404).end(); }
});
const report = { languages: [], faults: [], fixtures: [], navigation: [], normalization: [] };
let browser;
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}/talia-store/`;
  browser = await chromium.launch();
  const context = await browser.newContext({ locale: 'it-IT', acceptDownloads: true });
  const page = await context.newPage();
  page.on('pageerror', error => report.faults.push(error.message));
  let mode = 'normal';
  await page.route('**/releases.json', route => mode === 'empty' ? route.fulfill({ json: { schemaVersion: 1, releases: [] } })
    : mode === 'error' ? route.fulfill({ status: 503, body: 'unavailable' }) : route.continue());
  await page.goto(base);
  await page.getByRole('link', { name: 'Download app', exact: true }).click();
  assert.equal(new URL(page.url()).pathname, '/talia-store/download-app/');
  await page.waitForFunction(() => document.querySelectorAll('.platform-card a').length === 27);
  assert.equal(await page.locator('html').getAttribute('lang'), 'it');
  report.navigation.push('home → Download app');
  const expectedUrls = index.releases.flatMap(release => Object.values(release.platforms).flatMap(platform => platform.files.map(file => file.url)))
    .filter(url => /\.(dmg|exe|zip|appimage)$/i.test(url));
  const baseline = await page.locator('.platform-card a').evaluateAll(links => links.map(link => link.href));
  assert.equal(baseline.length, 27);
  assert.ok(baseline.every(url => expectedUrls.includes(url)));
  for (const locale of meta) {
    const table = JSON.parse(fs.readFileSync(path.join(site, `locales/${locale.code}.json`)));
    await page.selectOption('#language-select', locale.code);
    await page.waitForFunction(code => TaliaI18n.language === code && document.querySelectorAll('.platform-card a').length === 27, locale.code);
    await page.reload();
    await page.waitForFunction(code => TaliaI18n.language === code && document.querySelectorAll('.platform-card a').length === 27, locale.code);
    assert.equal(await page.locator('html').getAttribute('lang'), locale.htmlLang);
    assert.equal(await page.locator('html').getAttribute('dir'), locale.code === 'ar' ? 'rtl' : 'ltr');
    assert.equal(await page.title(), table.title);
    assert.equal(await page.locator('meta[name="description"]').getAttribute('content'), table.description);
    const labels = await page.locator('[data-i18n]').evaluateAll(nodes => nodes.map(node => ({ key: node.dataset.i18n, text: node.textContent })));
    for (const label of labels) {
      if (label.key === 'loading' && label.text !== table.loading) continue; // Stato sostituito dal risultato reale.
      assert.equal(label.text, table[label.key], `${locale.code}: ${label.key}`);
    }
    const links = await page.locator('.platform-card a').evaluateAll(nodes => nodes.map(node => ({ href: node.href, text: node.textContent, name: node.getAttribute('aria-label') })));
    assert.deepEqual(links.map(link => link.href), baseline);
    assert.ok(links.every(link => link.name.includes(link.text)));
    await page.goto(base);
    await page.waitForFunction(code => TaliaI18n.language === code, locale.code);
    assert.equal(await page.locator('#release-list, .platform-card, .checksum').count(), 0);
    assert.equal(await page.locator('.screenshot-placeholder').count(), 3);
    assert.deepEqual(await page.locator('.download-button').evaluateAll(nodes => nodes.map(node => new URL(node.href).pathname)), ['/talia-store/download-app/', '/talia-store/download-app/']);
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${locale.code}: landing overflow ${width}`);
    }
    await page.addScriptTag({ path: axePath });
    assert.deepEqual(await page.evaluate(async () => (await axe.run()).violations.map(item => item.id)), [], `${locale.code}: landing axe`);
    await page.locator('.download-button').last().click();
    await page.waitForFunction(code => TaliaI18n.language === code && document.querySelectorAll('.platform-card a').length === 27, locale.code);
    const checksum = page.locator('.checksum').first();
    await checksum.locator('summary').click();
    assert.equal(await checksum.getAttribute('open'), '');
    assert.match(await checksum.locator('code').innerText(), /^[a-f0-9]{64}$/);
    const widths = [];
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.evaluate(() => window.scrollTo(0, 0));
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${locale.code}: overflow at ${width}`);
      widths.push(width);
      if (['it', 'en', 'ar', 'de', 'zh'].includes(locale.code)) await page.screenshot({ path: path.join(output, `${locale.code}-${width}.png`) });
    }
    await page.addScriptTag({ path: axePath });
    const violations = await page.evaluate(async () => (await axe.run()).violations.map(item => ({ id: item.id, nodes: item.nodes.map(node => node.target) })));
    assert.deepEqual(violations, [], `${locale.code}: axe`);
    for (const state of ['empty', 'error']) {
      mode = state;
      await page.reload();
      await page.waitForFunction(text => document.querySelector('#release-list').innerText === text, table[state]);
      assert.equal(await page.locator('#release-list').innerText(), table[state]);
      assert.equal(await page.locator('#release-summary').innerText(), table[state === 'empty' ? 'none' : 'indexError']);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    }
    mode = 'normal';
    await page.reload();
    await page.waitForFunction(() => document.querySelectorAll('.platform-card a').length === 27);
    report.languages.push({ code: locale.code, links: 27, widths, persistence: true, axeViolations: 0, empty: true, error: true });
  }
  await page.locator('.site-nav a[href="../"]').click();
  assert.equal(new URL(page.url()).pathname, '/talia-store/');
  await page.locator('.site-nav a[href="download-app/"]').click();
  await page.waitForFunction(() => TaliaI18n.language === 'ar' && document.querySelectorAll('.platform-card a').length === 27);
  report.navigation.push('Download app → preserved home → Download app, preference retained');
  await page.goto(base + 'download-app/index.html');
  await page.reload();
  await page.waitForFunction(() => document.querySelectorAll('.platform-card a').length === 27);
  report.navigation.push('direct index.html + reload');
  // Scaricamento reale simulato: non scarica installer esterni.
  await page.route('https://github.com/**/releases/download/**', route => route.fulfill({
    status: 200, headers: { 'Content-Type': 'application/octet-stream', 'Content-Disposition': 'attachment; filename="download-probe.dmg"' }, body: 'local download probe',
  }));
  const downloadEvent = page.waitForEvent('download');
  await page.locator('.platform-card a').first().click();
  const download = await downloadEvent;
  assert.equal(download.suggestedFilename(), 'download-probe.dmg');
  assert.equal(await download.failure(), null);
  report.fixtures.push('installer click → local attachment probe');
  // Accesso diretto senza slash: il server statico effettua solo il redirect di directory.
  await page.goto(base + 'download-app');
  await page.waitForFunction(() => document.querySelectorAll('.platform-card a').length === 27);
  assert.equal(new URL(page.url()).pathname, '/talia-store/download-app/');
  report.navigation.push('direct URL + directory redirect + reload');
  const cases = { 'zh-HK': 'zh-tw', 'zh-SG': 'zh', 'pt-AO': 'pt-pt', 'pt-BR': 'pt', 'es-MX': 'es-419', 'fr-CA': 'fr', 'zz-ZZ': null };
  for (const [input, expected] of Object.entries(cases)) {
    assert.equal(await page.evaluate(value => TaliaI18n.normalize(value), input), expected);
    report.normalization.push({ input, expected });
  }
  await page.evaluate(() => localStorage.setItem('talia-site-language', 'zz'));
  await page.reload();
  await page.waitForFunction(() => TaliaI18n.language === 'it');
  report.fixtures.push('unsupported saved language → browser it-IT');
  await page.selectOption('#language-select', 'en');
  await page.waitForFunction(() => TaliaI18n.language === 'en');
  await page.route('**/locales/fr.json', route => route.fulfill({ status: 503, body: '' }));
  await page.selectOption('#language-select', 'fr');
  await page.waitForFunction(() => document.querySelector('.language-status').textContent.length > 0);
  assert.equal(await page.locator('#language-select').inputValue(), 'en');
  assert.equal(await page.locator('html').getAttribute('lang'), 'en');
  report.fixtures.push('unavailable translation → retain current language and show retry message');
  await context.close();
  const unknown = await browser.newContext({ locale: 'pl-PL' });
  const fallback = await unknown.newPage();
  await fallback.goto(base + 'download-app/');
  await fallback.waitForFunction(() => document.querySelectorAll('.platform-card a').length === 27);
  assert.equal(await fallback.locator('html').getAttribute('lang'), 'en');
  report.fixtures.push('unsupported browser → English');
  await fallback.keyboard.press('Tab');
  assert.equal(await fallback.evaluate(() => document.activeElement.className), 'skip-link');
  await fallback.keyboard.press('Enter');
  assert.equal(new URL(fallback.url()).hash, '#main-content');
  await fallback.locator('.checksum summary').first().focus();
  await fallback.keyboard.press('Enter');
  assert.equal(await fallback.locator('.checksum').first().getAttribute('open'), '');
  report.fixtures.push('keyboard: skip link and checksum disclosure');
  await unknown.close();
  const recoveryContext = await browser.newContext({ locale: 'en-US' });
  const recovery = await recoveryContext.newPage();
  await recovery.route('**/locale-meta.json', route => route.fulfill({ status: 503, body: '' }));
  await recovery.goto(base + 'download-app/');
  await recovery.waitForFunction(() => document.querySelectorAll('.platform-card a').length === 27);
  assert.equal(await recovery.locator('html').getAttribute('lang'), 'en');
  assert.equal(await recovery.locator('#language-select').isDisabled(), true);
  assert.ok((await recovery.locator('.language-status').innerText()).includes('Reload'));
  report.fixtures.push('translation infrastructure unavailable → readable English and working index');
  await recoveryContext.close();
  const noStorage = await browser.newContext({ locale: 'it-IT' });
  await noStorage.addInitScript(() => {
    Storage.prototype.getItem = Storage.prototype.setItem = () => { throw new Error('storage denied'); };
  });
  const transient = await noStorage.newPage();
  await transient.goto(base + 'download-app/');
  await transient.waitForFunction(() => document.querySelectorAll('.platform-card a').length === 27);
  await transient.selectOption('#language-select', 'de');
  await transient.waitForFunction(() => TaliaI18n.language === 'de');
  report.fixtures.push('storage denied → language selection works for current session');
  await noStorage.close();
  assert.deepEqual(report.faults, []);
  fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => { await browser?.close(); server.close(); });
