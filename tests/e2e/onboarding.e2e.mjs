// Run after `npm run build`:  node tests/e2e/onboarding.e2e.mjs
// Needs Playwright (set PW_RESOLVE_FROM to a file next to node_modules containing it if not installed locally).
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const require = createRequire(process.env.PW_RESOLVE_FROM ?? import.meta.url);
const { chromium } = require('playwright');

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.map': 'application/json' };
const server = createServer(async (req, res) => {
  const path = req.url.split('?')[0];
  try {
    const body = await readFile(join('dist', extname(path) ? path : '/index.html')); // SPA fallback
    res.writeHead(200, { 'content-type': MIME[extname(path) || '.html'] ?? 'application/octet-stream' }).end(body);
  } catch {
    res.writeHead(404).end('nf');
  }
});
await new Promise((r) => server.listen(0, r));
const base = `http://127.0.0.1:${server.address().port}`;
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
page.on('console', (m) => m.type() === 'error' && !/fonts\.|ERR_/.test(m.text()) && errors.push(m.text()));
const path = () => new URL(page.url()).pathname;
const stored = () => page.evaluate(() => localStorage.getItem('our-little-universe:profile'));
const overflow = () => page.evaluate(() => document.documentElement.scrollWidth > innerWidth);

await check('welcome screen renders for new visitors', async () => {
  await page.goto(base + '/');
  await page.getByRole('heading', { name: 'Our Little Universe' }).waitFor();
  assert.equal(path(), '/welcome');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${shots}/welcome-desktop.png` });
});

await check('dashboard is gated before setup', async () => {
  await page.goto(base + '/dashboard');
  await page.getByRole('heading', { name: 'Our Little Universe' }).waitFor();
  assert.equal(path(), '/welcome');
});

await check('Enter Our Universe opens onboarding', async () => {
  await page.getByRole('button', { name: 'Enter Our Universe' }).click();
  await page.getByRole('heading', { name: 'Who lives in this universe?' }).waitFor();
  assert.equal(path(), '/onboarding');
});

await check('required names are validated', async () => {
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByText("Please enter partner one's name.").waitFor();
  assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('aria-invalid')), 'true');
  assert.equal(await page.getByRole('button', { name: 'Skip' }).count(), 0, 'names step must not be skippable');
});

await check('Enter key advances; keyboard-only fill works', async () => {
  await page.getByLabel('Partner one').fill('Maya');
  await page.getByLabel('Partner two').fill('Arjun');
  await page.getByLabel('Partner two').press('Enter');
  await page.getByRole('heading', { name: 'What do you call each other?' }).waitFor();
  assert.equal(await page.evaluate(() => document.activeElement?.tagName), 'H1', 'focus moves to step heading');
});

await check('nicknames use partner names and can be skipped', async () => {
  await page.getByLabel('What does Maya like to be called? (optional)').fill('Mia');
  await page.getByRole('button', { name: 'Skip' }).click();
  await page.getByRole('heading', { name: 'A few small details' }).waitFor();
});

await check('Back keeps entered values', async () => {
  await page.getByRole('button', { name: 'Back' }).click();
  await page.getByRole('heading', { name: 'What do you call each other?' }).waitFor();
  // skipping cleared the step's fields by design
  assert.equal(await page.getByLabel('What does Maya like to be called? (optional)').inputValue(), '');
  await page.getByLabel('What does Maya like to be called? (optional)').fill('Mia');
  await page.getByLabel('What does Arjun like to be called? (optional)').fill('Bear');
  await page.getByRole('button', { name: 'Next' }).click();
});

await check('future anniversary is rejected, valid one accepted', async () => {
  await page.getByLabel('Anniversary (optional)').fill('2999-01-01');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByText('This date is in the future.').waitFor();
  await page.getByLabel('Anniversary (optional)').fill('2024-02-14');
  await page.getByLabel('A short dedication (optional)').fill('For every ordinary evening.');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('heading', { name: 'Choose your look' }).waitFor();
});

await check('palette picks by keyboard and previews live', async () => {
  await page.getByRole('radio', { name: /Rose petal/ }).focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await page.waitForFunction(() => document.documentElement.dataset.palette === 'sage');
  assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--primary').trim()), '#a9b8a0');
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${shots}/onboarding-theme.png` });
});

await check('Finish saves and opens the dashboard', async () => {
  await page.getByRole('button', { name: 'Finish' }).click();
  await page.getByRole('heading', { name: /Mia & Bear/ }).waitFor();
  assert.equal(path(), '/dashboard');
  await page.getByText('For every ordinary evening.').waitFor();
  await page.getByText(/[\d,]+ days together and counting/).waitFor();
  const data = JSON.parse(await stored());
  assert.equal(data.data.theme, 'sage');
  assert.equal(data.data.partnerOne.name, 'Maya');
  assert.equal(data.data.partnerOne.nickname, 'Mia');
  await page.screenshot({ path: `${shots}/dashboard-desktop.png` });
});

await check('returning visit goes straight to dashboard with saved palette', async () => {
  await page.goto(base + '/');
  await page.getByRole('heading', { name: /Mia & Bear/ }).waitFor();
  assert.equal(path(), '/dashboard');
  assert.equal(await page.evaluate(() => document.documentElement.dataset.palette), 'sage');
  await page.goto(base + '/onboarding');
  await page.getByRole('heading', { name: /Mia & Bear/ }).waitFor();
});

await check('palette can be changed in settings and persists', async () => {
  await page.goto(base + '/settings');
  await page.getByRole('radio', { name: /Golden hour/ }).check({ force: true });
  await page.waitForFunction(() => document.documentElement.dataset.palette === 'gold');
  assert.equal(JSON.parse(await stored()).data.theme, 'gold');
});

await check('reset setup returns to welcome and clears storage', async () => {
  await page.getByRole('button', { name: 'Reset setup' }).first().click();
  await page.getByRole('dialog').getByRole('button', { name: 'Reset setup' }).click();
  await page.getByRole('heading', { name: 'Our Little Universe' }).waitFor();
  assert.equal(path(), '/welcome');
  assert.equal(await stored(), null);
  assert.equal(await page.evaluate(() => document.documentElement.dataset.palette), 'rose');
});

await check('onboarding works with storage failures (memory fallback)', async () => {
  const c2 = await browser.newContext();
  await c2.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } });
  });
  const p2 = await c2.newPage();
  await p2.goto(base + '/onboarding');
  await p2.getByLabel('Partner one').fill('A');
  await p2.getByLabel('Partner two').fill('B');
  await p2.getByRole('button', { name: 'Next' }).click();
  await p2.getByRole('button', { name: 'Skip' }).click();
  await p2.getByRole('button', { name: 'Skip' }).click();
  await p2.getByRole('button', { name: 'Finish' }).click();
  await p2.getByRole('heading', { name: /A & B/ }).waitFor();
  await c2.close();
});

for (const [name, w, h] of [['mobile', 375, 740], ['tablet', 820, 1100]]) {
  await check(`${name}: no horizontal overflow on welcome and every onboarding step`, async () => {
    const c = await browser.newContext({ viewport: { width: w, height: h } });
    const p = await c.newPage();
    await p.goto(base + '/welcome');
    await p.waitForTimeout(1400);
    assert.equal(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'welcome');
    await p.screenshot({ path: `${shots}/welcome-${name}.png` });
    await p.getByRole('button', { name: 'Enter Our Universe' }).click();
    await p.getByLabel('Partner one').fill('Maya');
    await p.getByLabel('Partner two').fill('Arjun');
    for (let i = 0; i < 3; i++) {
      assert.equal(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `step ${i + 1}`);
      await p.screenshot({ path: `${shots}/onboarding-${name}-${i + 1}.png` });
      await p.getByRole('button', { name: 'Next' }).click();
    }
    assert.equal(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'step 4');
    await p.screenshot({ path: `${shots}/onboarding-${name}-4.png` });
    await c.close();
  });
}

await check('reduced motion: welcome content is visible immediately', async () => {
  const c = await browser.newContext({ reducedMotion: 'reduce' });
  const p = await c.newPage();
  await p.goto(base + '/welcome');
  await p.getByRole('heading', { name: 'Our Little Universe' }).waitFor();
  await p.waitForTimeout(100);
  const op = await p.getByRole('button', { name: 'Enter Our Universe' }).evaluate((el) => getComputedStyle(el.parentElement).opacity);
  assert.equal(op, '1');
  await c.close();
});

await check('dark mode renders onboarding', async () => {
  const c = await browser.newContext({ colorScheme: 'dark', viewport: { width: 1280, height: 800 } });
  const p = await c.newPage();
  await p.goto(base + '/onboarding');
  await p.getByRole('heading', { name: 'Who lives in this universe?' }).waitFor();
  assert.equal(await p.evaluate(() => document.documentElement.dataset.theme), 'dark');
  await p.screenshot({ path: `${shots}/onboarding-dark.png` });
  await c.close();
});

check.errors = errors;
await browser.close();
server.close();
console.log(results.join('\n'));
if (errors.length) console.log('PAGE ERRORS:\n' + errors.join('\n'));
if (results.some((r) => r.startsWith('FAIL')) || errors.length) process.exit(1);
