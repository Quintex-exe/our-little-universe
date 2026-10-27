import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { LocalStorageProfileRepository, STORAGE_KEY, type StorageLike } from '../src/services/profile/LocalStorageProfileRepository';
import { ProfileService, ProfileValidationError } from '../src/services/profile/ProfileService';
import { ProfileStorageError } from '../src/services/profile/ProfileRepository';
import { EMPTY_DRAFT } from '../src/types/profile';

function fakeStorage(): StorageLike & { map: Map<string, string> } {
  const map = new Map<string, string>();
  return {
    map,
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
    removeItem: (k) => void map.delete(k),
  };
}

const now = () => new Date('2026-10-27T10:00:00Z');
const draft = {
  ...EMPTY_DRAFT,
  partnerOneName: '  Maya ',
  partnerTwoName: 'Arjun',
  partnerOneNickname: '',
  partnerTwoNickname: 'Bear',
  dedication: '  For us  ',
  theme: 'aurora' as const,
};

describe('ProfileService + LocalStorageProfileRepository', () => {
  it('saves, trims, and loads a profile', async () => {
    const storage = fakeStorage();
    const service = new ProfileService(new LocalStorageProfileRepository(storage), now);
    await service.completeOnboarding(draft);
    const loaded = await new ProfileService(new LocalStorageProfileRepository(storage), now).getProfile();
    assert.equal(loaded?.partnerOne.name, 'Maya');
    assert.equal(loaded?.partnerOne.nickname, null);
    assert.equal(loaded?.partnerTwo.nickname, 'Bear');
    assert.equal(loaded?.anniversary, null);
    assert.equal(loaded?.dedication, 'For us');
    assert.equal(loaded?.theme, 'aurora');
  });

  it('rejects invalid drafts without saving', async () => {
    const storage = fakeStorage();
    const service = new ProfileService(new LocalStorageProfileRepository(storage), now);
    await assert.rejects(() => service.completeOnboarding(EMPTY_DRAFT), ProfileValidationError);
    assert.equal(storage.map.size, 0);
  });

  it('updates preferences', async () => {
    const service = new ProfileService(new LocalStorageProfileRepository(fakeStorage()), now);
    await service.completeOnboarding(draft);
    const next = await service.updatePreferences({ theme: 'ember' });
    assert.equal(next.theme, 'ember');
    assert.equal((await service.getProfile())?.theme, 'ember');
  });

  it('resets setup', async () => {
    const storage = fakeStorage();
    const service = new ProfileService(new LocalStorageProfileRepository(storage), now);
    await service.completeOnboarding(draft);
    await service.resetSetup();
    assert.equal(await service.getProfile(), null);
    assert.equal(storage.map.has(STORAGE_KEY), false);
  });

  it('ignores corrupted or foreign data', async () => {
    const storage = fakeStorage();
    const repo = new LocalStorageProfileRepository(storage);
    storage.map.set(STORAGE_KEY, '{not json');
    assert.equal(await repo.load(), null);
    storage.map.set(STORAGE_KEY, JSON.stringify({ v: 99, data: {} }));
    assert.equal(await repo.load(), null);
    storage.map.set(STORAGE_KEY, JSON.stringify({ v: 1, data: { partnerOne: { name: 'A' } } }));
    assert.equal(await repo.load(), null);
  });

  it('sanitises bad theme values on load', async () => {
    const storage = fakeStorage();
    const repo = new LocalStorageProfileRepository(storage);
    storage.map.set(
      STORAGE_KEY,
      JSON.stringify({ v: 1, data: { partnerOne: { name: 'A' }, partnerTwo: { name: 'B' }, theme: 'neon', anniversary: 'nope' } }),
    );
    const p = await repo.load();
    assert.equal(p?.theme, 'twilight');
    assert.equal(p?.anniversary, null);
  });

  it('surfaces write failures as ProfileStorageError', async () => {
    const broken: StorageLike = {
      getItem: () => null,
      setItem: () => {
        throw new Error('quota');
      },
      removeItem: () => {},
    };
    const service = new ProfileService(new LocalStorageProfileRepository(broken), now);
    await assert.rejects(() => service.completeOnboarding(draft), ProfileStorageError);
  });

  it('falls back to memory when storage is unavailable', async () => {
    const repo = new LocalStorageProfileRepository(null);
    const service = new ProfileService(repo, now);
    await service.completeOnboarding(draft);
    assert.equal(repo.isPersistent, false);
    assert.equal((await service.getProfile())?.partnerTwo.name, 'Arjun');
  });
});
