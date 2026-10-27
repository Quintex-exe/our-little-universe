// Run after `npm run build`:  node tests/e2e/dashboard.e2e.mjs
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
    const body = await readFile(join('dist', extname(path) ? path : '/index.html'));
    res.writeHead(200, { 'content-type': MIME[extname(path) || '.html'] ?? 'application/octet-stream' }).end(body);
  } catch {
    res.writeHead(404).end('nf');
  }
});
await new Promise((r) => server.listen(0, r));
const base = `http://127.0.0.1:${server.address().port}`;
const shots = process.env.SHOTS_DIR ?? '/tmp';

const PROFILE = {
  v: 1,
  data: {
    schemaVersion: 1,
    partnerOne: { name: 'Maya', nickname: 'Mia' },
    partnerTwo: { name: 'Arjun', nickname: null },
    anniversary: '2024-02-14',
    dedication: 'For every ordinary evening.',
    theme: 'lavender',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
};
const iso = (offsetDays) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const DATA = {
  v: 1,
  data: {
    schemaVersion: 1,
    memories: [
      { id: 'm1', title: 'The night the power went out', note: 'We ate cereal by candlelight.', date: '2025-03-02', createdAt: '2025-03-03T00:00:00.000Z' },
      { id: 'm2', title: 'First train trip', note: null, date: '2025-06-11', createdAt: '2025-06-12T00:00:00.000Z' },
      { id: 'm3', title: 'Rooftop dinner', note: 'Too windy, perfect anyway.', date: '2025-09-20', createdAt: '2025-09-21T00:00:00.000Z' },
    ],
    flowers: [
      { id: 'f1', kind: 'rose', name: null, plantedAt: '2026-02-01T00:00:00.000Z' },
      { id: 'f2', kind: 'tulip', name: 'Pip', plantedAt: '2026-02-02T00:00:00.000Z' },
    ],
    plans: [
      { id: 'p1', title: 'Old', date: iso(-3), note: null, createdAt: '2026-01-01T00:00:00.000Z' },
      { id: 'p2', title: 'Soon', date: iso(5), note: null, createdAt: '2026-01-01T00:00:00.000Z' },
    ],
    bucketItems: [
      { id: 'b1', title: 'Northern lights', completedAt: '2026-03-01T00:00:00.000Z', createdAt: '2026-01-01T00:00:00.000Z' },
      { id: 'b2', title: 'Learn to sail', completedAt: '2026-04-01T00:00:00.000Z', createdAt: '2026-01-01T00:00:00.000Z' },
      { id: 'b3', title: 'Road trip', completedAt: null, createdAt: '2026-01-01T00:00:00.000Z' },
    ],
    adventures: { today: null, favourites: [], recent: [] },
  },
};

const browser = await chromium.launch();
const results = [];
const errors = [];
const check = async (name, fn) => {
  try {
    await fn();
    results.push(`PASS ${name}`);
  } catch (e) {
    results.push(`FAIL ${name}: ${e.message.split('\n')[0]}`);
  }
};

async function open(seed, { viewport = { width: 1280, height: 900 }, colorScheme = 'light' } = {}) {
  const ctx = await browser.newContext({ viewport, colorScheme });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && !/fonts\.|ERR_/.test(m.text()) && errors.push(m.text()));
  await page.goto(base + '/welcome');
  await page.evaluate(
    ([profile, data]) => {
      localStorage.setItem('our-little-universe:profile', JSON.stringify(profile));
      if (data) localStorage.setItem('our-little-universe:data', JSON.stringify(data));
    },
    [PROFILE, seed],
  );
  await page.goto(base + '/dashboard');
  await page.getByTestId('greeting').waitFor();
  return { ctx, page };
}
const pathOf = (page) => new URL(page.url()).pathname;
const wait = (page) => page.waitForTimeout(1300); // let entrance animations finish

// ---------- Empty state ----------
{
  const { ctx, page } = await open(null);
  await check('greeting uses nickname/name, time-of-day greeting and a date', async () => {
    const g = await page.getByTestId('greeting').innerText();
    assert.match(g, /^(Good morning|Good afternoon|Good evening|Good night|Still up), Mia & Arjun$/);
    const d = await page.getByTestId('today-date').innerText();
    assert.match(d, /\w+day, (\d{1,2} \w+|\w+ \d{1,2})/i); // CSS uppercases it
    await page.getByText(/days together and counting/).waitFor();
    await page.getByText('For every ordinary evening.').waitFor();
  });
  await check('empty stats are real zeros with empty captions (nothing invented)', async () => {
    for (const k of ['memories', 'garden', 'dates', 'bucket-list']) assert.equal(await page.getByTestId(`stat-${k}`).innerText(), '0');
    await page.getByText('None saved yet').waitFor();
    await page.getByText('Nothing planted yet').waitFor();
    await page.getByText('Nothing planned yet').waitFor();
    await page.getByText('No items yet').waitFor();
  });
  await check('featured memory shows empty state with working Add a memory action', async () => {
    await page.getByRole('heading', { name: 'Your first memory belongs here' }).waitFor();
    await page.locator('main').getByRole('link', { name: 'Add a memory' }).last().click();
    await page.waitForURL('**/memories');
    await page.goBack();
    await page.getByTestId('greeting').waitFor();
  });
  await check('all six quick actions navigate to the right routes', async () => {
    const expected = [
      ['Plant a flower', '/garden'],
      ['Add a memory', '/memories'],
      ['Plan a date', '/dates'],
      ['Send a message', '/messages'],
      ['Play a game', '/games'],
      ['Add a bucket-list item', '/bucket-list'],
    ];
    for (const [label, route] of expected) {
      await page.locator('#quick-actions').locator('..').getByRole('link', { name: new RegExp(label) }).click();
      await page.waitForURL('**' + route);
      assert.equal(pathOf(page), route);
      await page.goBack();
      await page.getByTestId('greeting').waitFor();
    }
  });
  await check('stat cards link to their sections', async () => {
    for (const [label, route] of [['Saved memories', '/memories'], ['Garden flowers', '/garden'], ['Upcoming plans', '/dates'], ['Bucket list done', '/bucket-list']]) {
      await page.getByRole('link', { name: new RegExp(label) }).click();
      await page.waitForURL('**' + route);
      await page.goBack();
      await page.getByTestId('greeting').waitFor();
    }
  });

  await check('adventure: prompt, generate, persists on reload', async () => {
    await page.getByRole('heading', { name: 'What shall we do today?' }).waitFor();
    await page.getByRole('button', { name: 'Find an idea' }).click();
    const t = await page.getByTestId('adventure-title').innerText();
    assert.ok(t.length > 3);
    await page.reload();
    assert.equal(await page.getByTestId('adventure-title').innerText(), t);
  });
  await check('adventure: 40 "Another idea" clicks never repeat within the history window or back-to-back', async () => {
    const seen = [await page.getByTestId('adventure-title').innerText()];
    for (let i = 0; i < 40; i++) {
      const prev = seen[seen.length - 1];
      await page.getByRole('button', { name: 'Another idea' }).click();
      await page.waitForFunction((p) => document.querySelector('[data-testid=adventure-title]')?.textContent !== p, prev);
      seen.push(await page.getByTestId('adventure-title').innerText());
    }
    const limit = Math.floor(30 / 2); // pool size is 30
    for (let i = 0; i < seen.length; i++) {
      const window = seen.slice(Math.max(0, i - limit), i);
      assert.ok(!window.includes(seen[i]), `repeat at ${i}: ${seen[i]}`);
    }
    assert.ok(new Set(seen).size >= 25, `variety ${new Set(seen).size}`);
  });
  await check('adventure: save favourite toggles, lists, persists, and can be removed', async () => {
    const title = await page.getByTestId('adventure-title').innerText();
    const save = page.getByRole('button', { name: /Save idea|Saved/ });
    assert.equal(await save.getAttribute('aria-pressed'), 'false');
    await save.click();
    await page.getByRole('button', { name: 'Saved', exact: true }).waitFor();
    await page.getByText('Saved ideas (1)').waitFor();
    await page.reload();
    await page.getByText('Saved ideas (1)').click();
    await page.getByText(title, { exact: true }).last().waitFor();
    await page.getByRole('button', { name: `Remove ${title} from saved ideas` }).click();
    await page.getByText('Saved ideas (1)').waitFor({ state: 'detached' });
    assert.equal(await page.getByRole('button', { name: 'Save idea' }).getAttribute('aria-pressed'), 'false');
  });
  await ctx.close();
}

// ---------- Seeded data ----------
{
  const { ctx, page } = await open(DATA);
  await check('stats reflect saved data (upcoming only, completed only)', async () => {
    assert.equal(await page.getByTestId('stat-memories').innerText(), '3');
    assert.equal(await page.getByTestId('stat-garden').innerText(), '2');
    assert.equal(await page.getByTestId('stat-dates').innerText(), '1');
    assert.equal(await page.getByTestId('stat-bucket-list').innerText(), '2');
    await page.getByText('of 3 checked off').waitFor();
  });
  await check('featured memory is a real saved memory and stable on reload', async () => {
    const t = await page.getByTestId('featured-title').innerText();
    assert.ok(['The night the power went out', 'First train trip', 'Rooftop dinner'].includes(t), t);
    await page.reload();
    assert.equal(await page.getByTestId('featured-title').innerText(), t);
    await page.getByRole('link', { name: 'See all memories' }).click();
    await page.waitForURL('**/memories');
  });
  await ctx.close();
}

// ---------- Corrupt data ----------
await check('corrupt saved data falls back to empty states without crashing', async () => {
  const { ctx, page } = await open({ v: 1, data: { memories: 'oops', plans: [null, 3] } });
  assert.equal(await page.getByTestId('stat-memories').innerText(), '0');
  await ctx.close();
});

// ---------- Responsive + themes ----------
for (const [name, w, h] of [['mobile', 375, 800], ['tablet', 820, 1100], ['desktop', 1360, 900]]) {
  for (const scheme of ['light', 'dark']) {
    await check(`${name}/${scheme}: no horizontal overflow, renders`, async () => {
      const { ctx, page } = await open(DATA, { viewport: { width: w, height: h }, colorScheme: scheme });
      await page.getByRole('button', { name: 'Find an idea' }).click();
      await wait(page);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), scheme);
      await page.screenshot({ path: `${shots}/dash-${name}-${scheme}.png`, fullPage: true });
      await ctx.close();
    });
  }
}

await check('reduced motion: dashboard content visible immediately', async () => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(base + '/welcome');
  await page.evaluate(([p]) => localStorage.setItem('our-little-universe:profile', JSON.stringify(p)), [PROFILE]);
  await page.goto(base + '/dashboard');
  await page.getByTestId('greeting').waitFor();
  assert.equal(await page.getByTestId('greeting').evaluate((el) => getComputedStyle(el.closest('header')).opacity), '1');
  await ctx.close();
});

await browser.close();
server.close();
console.log(results.join('\n'));
if (errors.length) console.log('PAGE ERRORS:\n' + [...new Set(errors)].join('\n'));
if (results.some((r) => r.startsWith('FAIL')) || errors.length) process.exit(1);
