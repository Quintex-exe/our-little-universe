import type { Profile } from '../../types/profile';
import { ProfileStorageError, type ProfileRepository } from './ProfileRepository';
import { SCHEMA_VERSION, parseProfile } from './schema';

export const STORAGE_KEY = 'our-little-universe:profile';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function resolveBrowserStorage(): StorageLike | null {
  try {
    const s = globalThis.localStorage;
    const probe = '__olu_probe__';
    s.setItem(probe, '1');
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
}

/**
 * The only place in the app that touches localStorage.
 * Falls back to in-memory storage (session only) when localStorage is unavailable.
 */
export class LocalStorageProfileRepository implements ProfileRepository {
  private memory: string | null = null;

  constructor(private readonly storage: StorageLike | null = resolveBrowserStorage()) {}

  get isPersistent(): boolean {
    return this.storage !== null;
  }

  async load(): Promise<Profile | null> {
    let raw: string | null;
    try {
      raw = this.storage ? this.storage.getItem(STORAGE_KEY) : this.memory;
    } catch {
      return null;
    }
    if (!raw) return null;
    try {
      const envelope = JSON.parse(raw) as { v?: unknown; data?: unknown };
      if (envelope.v !== SCHEMA_VERSION) return null;
      return parseProfile(envelope.data);
    } catch {
      return null;
    }
  }

  async save(profile: Profile): Promise<void> {
    const raw = JSON.stringify({ v: SCHEMA_VERSION, data: profile });
    if (!this.storage) {
      this.memory = raw;
      return;
    }
    try {
      this.storage.setItem(STORAGE_KEY, raw);
    } catch (cause) {
      throw new ProfileStorageError('Could not save to this device.', { cause });
    }
  }

  async clear(): Promise<void> {
    this.memory = null;
    try {
      this.storage?.removeItem(STORAGE_KEY);
    } catch (cause) {
      throw new ProfileStorageError('Could not clear saved data.', { cause });
    }
  }
}
