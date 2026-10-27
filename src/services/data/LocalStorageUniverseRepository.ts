import { resolveBrowserStorage, type StorageLike } from '../storage/browserStorage';
import { EMPTY_UNIVERSE, type UniverseData } from '../../types/universe';
import { UNIVERSE_SCHEMA_VERSION, parseUniverse } from './schema';
import type { UniverseRepository } from './UniverseRepository';

export const UNIVERSE_STORAGE_KEY = 'our-little-universe:data';

export class LocalStorageUniverseRepository implements UniverseRepository {
  private memory: string | null = null;

  constructor(private readonly storage: StorageLike | null = resolveBrowserStorage()) {}

  async load(): Promise<UniverseData> {
    let raw: string | null = null;
    try {
      raw = this.storage ? this.storage.getItem(UNIVERSE_STORAGE_KEY) : this.memory;
    } catch {
      /* unreadable: treat as empty */
    }
    if (!raw) return structuredClone(EMPTY_UNIVERSE);
    try {
      const envelope = JSON.parse(raw) as { v?: unknown; data?: unknown };
      return envelope.v === UNIVERSE_SCHEMA_VERSION ? parseUniverse(envelope.data) : structuredClone(EMPTY_UNIVERSE);
    } catch {
      return structuredClone(EMPTY_UNIVERSE);
    }
  }

  async save(data: UniverseData): Promise<void> {
    const raw = JSON.stringify({ v: UNIVERSE_SCHEMA_VERSION, data });
    if (!this.storage) {
      this.memory = raw;
      return;
    }
    this.storage.setItem(UNIVERSE_STORAGE_KEY, raw);
  }
}
