import type { Profile } from '../../types/profile';
import { ProfileStorageError, type ProfileRepository } from './ProfileRepository';
import { SCHEMA_VERSION, parseProfile } from './schema';
import { resolveBrowserStorage, type StorageLike } from '../storage/browserStorage';

export const STORAGE_KEY = 'our-little-universe:profile';

export type { StorageLike };

/**
 * Persists the profile in localStorage (via the shared browser-storage helper).
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
