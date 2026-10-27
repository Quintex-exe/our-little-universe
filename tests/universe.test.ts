import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ADVENTURES } from '../src/data/adventures';
import { computeStats, pickFeaturedMemory } from '../src/lib/stats';
import { historyLimit, pickSuggestion, pushRecent } from '../src/lib/suggestions';
import { LocalStorageUniverseRepository, UNIVERSE_STORAGE_KEY } from '../src/services/data/LocalStorageUniverseRepository';
import { UniverseService } from '../src/services/data/UniverseService';
import type { StorageLike } from '../src/services/storage/browserStorage';
import { EMPTY_UNIVERSE } from '../src/types/universe';

function fakeStorage(): StorageLike & { map: Map<string, string> } {
  const map = new Map<string, string>();
  return { map, getItem: (k) => map.get(k) ?? null, setItem: (k, v) => void map.set(k, v), removeItem: (k) => void map.delete(k) };
}
let n = 0;
const make = (storage = fakeStorage(), now = () => new Date('2026-10-27T10:00:00'), rand?: () => number) =>
  new UniverseService(new LocalStorageUniverseRepository(storage), now, () => `id${++n}`, ADVENTURES, rand);

describe('computeStats', () => {
  it('is all zeros for empty data', () => {
    assert.deepEqual(computeStats(EMPTY_UNIVERSE, '2026-10-27'), { memories: 0, flowers: 0, upcomingPlans: 0, bucketCompleted: 0, bucketTotal: 0 });
  });
  it('counts saved data, upcoming plans only, and completed bucket items', async () => {
    const s = make();
    await s.addMemory({ title: 'Beach', date: '2026-01-01' });
    await s.addFlower({ kind: 'rose' });
    await s.addFlower({ kind: 'tulip' });
    await s.addPlan({ title: 'Past', date: '2026-10-26' });
    await s.addPlan({ title: 'Today', date: '2026-10-27' });
    await s.addPlan({ title: 'Later', date: '2026-12-01' });
    await s.addBucketItem('Northern lights');
    const d = await s.addBucketItem('Learn to sail');
    await s.setBucketItemDone(d.bucketItems[0].id, true);
    const stats = computeStats(await s.getData(), '2026-10-27');
    assert.deepEqual(stats, { memories: 1, flowers: 2, upcomingPlans: 2, bucketCompleted: 1, bucketTotal: 2 });
  });
});

describe('pickFeaturedMemory', () => {
  it('returns null when empty and is stable for a given day', () => {
    assert.equal(pickFeaturedMemory([], '2026-10-27'), null);
    const ms = Array.from({ length: 5 }, (_, i) => ({ id: `m${i}` }));
    assert.equal(pickFeaturedMemory(ms, '2026-10-27'), pickFeaturedMemory(ms, '2026-10-27'));
    const seen = new Set(Array.from({ length: 40 }, (_, i) => pickFeaturedMemory(ms, `2026-11-${String(i + 1).padStart(2, '0')}`)?.id));
    assert.ok(seen.size > 1, 'varies across days');
  });
});

describe('pickSuggestion', () => {
  const pool = Array.from({ length: 10 }, (_, i) => ({ id: `a${i}` }));
  it('never returns current or recent items, and covers the pool before repeating', () => {
    let recent: string[] = [];
    let current: string | null = null;
    const picks: string[] = [];
    for (let i = 0; i < 200; i++) {
      const p = pickSuggestion(pool, { recent, current })!;
      assert.notEqual(p.id, current);
      assert.ok(!recent.slice(-historyLimit(pool.length)).includes(p.id), 'not in history window');
      picks.push(p.id);
      recent = pushRecent(recent, p.id, pool.length);
      current = p.id;
    }
    assert.equal(new Set(picks).size, pool.length, 'every item eventually appears');
  });
  it('handles tiny pools', () => {
    assert.equal(pickSuggestion([], { recent: [] }), null);
    assert.equal(pickSuggestion([{ id: 'x' }], { recent: ['x'], current: 'x' })?.id, 'x');
    const two = [{ id: 'x' }, { id: 'y' }];
    assert.equal(pickSuggestion(two, { recent: ['x'], current: 'x' })?.id, 'y');
  });
  it('trims history', () => {
    assert.equal(pushRecent(['a', 'b', 'c'], 'd', 6).length, 3);
    assert.deepEqual(pushRecent(['a', 'b'], 'a', 10), ['b', 'a']);
  });
});

describe('adventures via UniverseService', () => {
  it('has unique ids and enough variety', () => {
    assert.equal(new Set(ADVENTURES.map((a) => a.id)).size, ADVENTURES.length);
    assert.ok(ADVENTURES.length >= 24);
  });
  it('sets today, persists, and avoids repeats across service restarts', async () => {
    const storage = fakeStorage();
    const seen: string[] = [];
    for (let i = 0; i < 30; i++) {
      const d = await make(storage).nextAdventure(); // new service each time = new visit
      assert.equal(d.adventures.today?.date, '2026-10-27');
      const id = d.adventures.today!.id;
      assert.ok(!seen.slice(-historyLimit(ADVENTURES.length)).includes(id), `repeat too soon: ${id}`);
      seen.push(id);
    }
  });
  it('toggles favourites and persists them', async () => {
    const storage = fakeStorage();
    await make(storage).toggleFavourite('sunset-walk');
    assert.deepEqual((await make(storage).getData()).adventures.favourites, ['sunset-walk']);
    await make(storage).toggleFavourite('sunset-walk');
    assert.deepEqual((await make(storage).getData()).adventures.favourites, []);
  });
  it('rapid concurrent changes do not overwrite each other', async () => {
    const s = make();
    await Promise.all([s.toggleFavourite('a'), s.toggleFavourite('b'), s.addMemory({ title: 'x', date: '2026-01-01' }), s.toggleFavourite('c')]);
    const d = await s.getData();
    assert.deepEqual(d.adventures.favourites.sort(), ['a', 'b', 'c']);
    assert.equal(d.memories.length, 1);
  });
});

describe('storage robustness', () => {
  it('ignores corrupt or foreign data and drops bad entries', async () => {
    const storage = fakeStorage();
    const repo = new LocalStorageUniverseRepository(storage);
    storage.map.set(UNIVERSE_STORAGE_KEY, '{nope');
    assert.deepEqual(await repo.load(), EMPTY_UNIVERSE);
    storage.map.set(UNIVERSE_STORAGE_KEY, JSON.stringify({ v: 1, data: { memories: [{ id: 'a', title: 'ok', date: '2026-02-30' }, { id: 'b', title: 'fine', date: '2026-02-01' }, 5, null], flowers: 'x' } }));
    const d = await repo.load();
    assert.equal(d.memories.length, 1);
    assert.equal(d.memories[0].id, 'b');
    assert.deepEqual(d.flowers, []);
  });
  it('falls back to memory when storage is unavailable', async () => {
    const s = new UniverseService(new LocalStorageUniverseRepository(null));
    await s.addBucketItem('x');
    assert.equal((await s.getData()).bucketItems.length, 1);
  });
});
