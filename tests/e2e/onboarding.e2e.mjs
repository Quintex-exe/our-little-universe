// Run: PLAYWRIGHT_BROWSERS_PATH=... node tests/e2e/onboarding.e2e.mjs  (after build)
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const require = createRequire(process.env.PW_RESOLVE_FROM ?? import.meta.url);
const { chromium } = require('playwright');

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.map': 'application/json' };
const server = createServer(async (req, res) => {
  const path = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  try {
    const body = await readFile(join('dist', path));
    res.writeHead(200, { 'content-type': MIME[extname(path)] ?? 'application/octet-stream' }).end(body);
  } catch {
    res.writeHead(404).end('nf');
  }
});
await new Promise((r) => server.listen(0, r));
const url = `http://127.0.0.1:${server.address().port}/`;
const shots = process.env.SHOTS_DIR ?? '/tmp';

const browser = await chromium.launch();
const results = [];
const check = async (name, fn) => {
  try {
    await fn();
    results.push(`PASS ${name}`);
  } catch (e) {
    results.push(`FAIL ${name}: ${e.message.split('\n')[0]}`);
  }
};

const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

await check('welcome renders title, intro, button', async () => {
  await page.goto(url);
  await page.getByRole('heading', { level: 1, name: 'Our Little Universe' }).waitFor();
  await page.getByRole('button', { name: 'Enter Our Universe' }).waitFor();
  assert.ok((await page.locator('.welcome__intro').innerText()).length > 20);
  assert.equal(await page.locator('svg.art').count(), 1);
  assert.equal(await page.locator('canvas.starfield').count(), 1);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${shots}/welcome-desktop.png` });
});

await check('entrance animation active by default', async () => {
  const name = await page.locator('.welcome__title').evaluate((el) => getComputedStyle(el).animationName);
  assert.equal(name, 'rise');
});

await check('keyboard: Tab reaches Enter button, Enter opens onboarding', async () => {
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement?.textContent), 'Enter Our Universe');
  await page.keyboard.press('Enter');
  await page.getByRole('heading', { name: 'Who lives in this universe?' }).waitFor();
});

await check('step heading receives focus', async () => {
  assert.equal(await page.evaluate(() => document.activeElement?.tagName), 'H1');
});

await check('step 1 blocks empty submit with errors + focus', async () => {
  await page.getByRole('button', { name: 'Next' }).click();
  assert.equal(await page.getByRole('alert').count(), 2);
  await page.waitForFunction(() => document.activeElement?.id === 'partnerOneName');
  assert.equal(await page.locator('#partnerOneName').getAttribute('aria-invalid'), 'true');
  await page.screenshot({ path: `${shots}/onboarding-errors.png` });
});

await check('typing clears error; Enter key advances', async () => {
  await page.locator('#partnerOneName').fill('Maya');
  assert.equal(await page.locator('#partnerOneName-error').count(), 0);
  await page.locator('#partnerTwoName').fill('Arjun');
  await page.locator('#partnerTwoName').press('Enter');
  await page.getByRole('heading', { name: 'What do you call each other?' }).waitFor();
  assert.ok(await page.getByText('Step 2 of 4').isVisible());
});

await check('nickname step: labels use names, too-long rejected, skip available', async () => {
  await page.getByLabel(/Nickname for Maya/).waitFor();
  await page.getByLabel(/Nickname for Arjun/).fill('x'.repeat(35));
  await page.getByRole('button', { name: 'Next' }).click();
  assert.equal(await page.getByRole('alert').count(), 1);
  await page.getByLabel(/Nickname for Arjun/).fill('Bear');
  await page.getByLabel(/Nickname for Maya/).fill('Mimi');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('heading', { name: 'A few small details' }).waitFor();
});

await check('back preserves values', async () => {
  await page.getByRole('button', { name: 'Back' }).click();
  assert.equal(await page.getByLabel(/Nickname for Maya/).inputValue(), 'Mimi');
  await page.getByRole('button', { name: 'Next' }).click();
});

await check('story: future date rejected with message and focus', async () => {
  await page.locator('#anniversary').fill('2999-01-01');
  await page.locator('#dedication').fill('For the long way home');
  await page.getByRole('button', { name: 'Next' }).click();
  assert.match(await page.locator('#anniversary-error').innerText(), /future/i);
  await page.waitForFunction(() => document.activeElement?.id === 'anniversary');
  assert.ok(await page.getByRole('heading', { name: 'A few small details' }).isVisible());
});

await check('story: valid date + dedication, Next', async () => {
  await page.locator('#anniversary').fill('2021-06-15');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('heading', { name: 'Choose your sky' }).waitFor();
  assert.ok(await page.getByText('Step 4 of 4').isVisible());
  assert.equal(await page.getByRole('button', { name: 'Skip' }).count(), 0);
});

await check('theme: arrow keys change selection and preview applies', async () => {
  await page.getByRole('radio', { name: /Twilight/ }).focus();
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.getByRole('radio', { name: /Aurora/ }).isChecked(), true);
  assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'aurora');
  await page.screenshot({ path: `${shots}/onboarding-theme.png` });
});

await check('finish shows dashboard with saved data', async () => {
  await page.getByRole('button', { name: 'Finish' }).click();
  await page.getByRole('heading', { level: 1, name: /Welcome back, Mimi & Bear/ }).waitFor();
  assert.ok(await page.getByText('Maya & Arjun').isVisible());
  assert.ok(await page.getByText('For the long way home').isVisible());
  const days = await page.getByTestId('days-together').innerText();
  assert.match(days, /days/);
  await page.screenshot({ path: `${shots}/dashboard.png` });
});

await check('persistence: reload goes straight to dashboard', async () => {
  await page.reload();
  await page.getByRole('heading', { level: 1, name: /Welcome back/ }).waitFor();
  assert.equal(await page.getByRole('button', { name: 'Enter Our Universe' }).count(), 0);
  assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'aurora');
});

await check('storage holds one namespaced key only', async () => {
  const keys = await page.evaluate(() => Object.keys(localStorage));
  assert.deepEqual(keys, ['our-little-universe:profile']);
});

await check('theme change persists across reload', async () => {
  await page.getByRole('radio', { name: /Ember/ }).check({ force: true });
  await page.waitForFunction(() => document.documentElement.dataset.theme === 'ember');
  await page.reload();
  await page.getByRole('heading', { level: 1, name: /Welcome back/ }).waitFor();
  assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'ember');
});

await check('reset: cancel keeps data; confirm clears and returns to welcome', async () => {
  await page.getByRole('button', { name: 'Reset setup' }).click();
  await page.getByRole('dialog').waitFor();
  await page.keyboard.press('Escape');
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  assert.ok(await page.getByRole('heading', { level: 1, name: /Welcome back/ }).isVisible());
  await page.getByRole('button', { name: 'Reset setup' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Reset setup' }).click();
  await page.getByRole('button', { name: 'Enter Our Universe' }).waitFor();
  assert.equal(await page.evaluate(() => localStorage.length), 0);
  assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'twilight');
});

await check('welcome after reset leads to fresh, empty onboarding', async () => {
  await page.getByRole('button', { name: 'Enter Our Universe' }).click();
  assert.equal(await page.locator('#partnerOneName').inputValue(), '');
});

await check('onboarding Back on step 1 returns to welcome', async () => {
  await page.getByRole('button', { name: 'Back' }).click();
  await page.getByRole('button', { name: 'Enter Our Universe' }).waitFor();
});

await check('all-skip path: optional steps skipped, no anniversary/dedication', async () => {
  await page.getByRole('button', { name: 'Enter Our Universe' }).click();
  await page.locator('#partnerOneName').fill('Sam');
  await page.locator('#partnerTwoName').fill('Riley');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Skip' }).click();
  await page.getByRole('button', { name: 'Skip' }).click();
  await page.getByRole('button', { name: 'Finish' }).click();
  await page.getByRole('heading', { level: 1, name: /Welcome back, Sam & Riley/ }).waitFor();
  assert.equal(await page.getByTestId('days-together').count(), 0);
  assert.equal(await page.locator('blockquote').count(), 0);
});

await check('corrupted storage falls back to welcome (no crash)', async () => {
  await page.evaluate(() => localStorage.setItem('our-little-universe:profile', '{broken'));
  await page.reload();
  await page.getByRole('button', { name: 'Enter Our Universe' }).waitFor();
});

await ctx.close();

// Reduced motion
const rm = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
const rmPage = await rm.newPage();
await check('reduced motion: no animations, content visible immediately', async () => {
  await rmPage.goto(url);
  await rmPage.getByRole('button', { name: 'Enter Our Universe' }).waitFor();
  const info = await rmPage.evaluate(() => ({
    title: getComputedStyle(document.querySelector('.welcome__title')).animationName,
    opacity: getComputedStyle(document.querySelector('.welcome__title')).opacity,
    art: getComputedStyle(document.querySelector('.art__float')).animationName,
    spin: getComputedStyle(document.querySelector('.art__spin')).animationName,
  }));
  assert.deepEqual(info, { title: 'none', opacity: '1', art: 'none', spin: 'none' });
});
await rm.close();

// Mobile
const mobile = await browser.newContext({ viewport: { width: 375, height: 667 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const m = await mobile.newPage();
await check('mobile: welcome + onboarding have no horizontal overflow', async () => {
  await m.goto(url);
  await m.getByRole('button', { name: 'Enter Our Universe' }).waitFor();
  await m.waitForTimeout(1500);
  await m.screenshot({ path: `${shots}/welcome-mobile.png` });
  const noOverflow = () => m.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
  assert.ok(await noOverflow());
  const box = await m.getByRole('button', { name: 'Enter Our Universe' }).boundingBox();
  assert.ok(box.y + box.height <= 667, 'button within first viewport');
  await m.getByRole('button', { name: 'Enter Our Universe' }).click();
  await m.getByRole('heading', { name: 'Who lives in this universe?' }).waitFor();
  assert.ok(await noOverflow());
  await m.waitForTimeout(1200);
  await m.screenshot({ path: `${shots}/onboarding-mobile.png` });
  const btn = await m.getByRole('button', { name: 'Next' }).boundingBox();
  assert.ok(btn.height >= 44, 'touch target >= 44px');
});
await mobile.close();

await browser.close();
server.close();

console.log(results.join('\n'));
const unexpected = errors.filter((e) => !/Failed to load resource/.test(e));
console.log(`console/page errors: ${unexpected.length}${unexpected.length ? '\n' + unexpected.join('\n') : ''}`);
process.exit(results.some((r) => r.startsWith('FAIL')) || unexpected.length ? 1 : 0);
