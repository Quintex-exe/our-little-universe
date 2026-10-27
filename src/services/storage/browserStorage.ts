export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** Returns localStorage when usable, otherwise null (private mode, blocked storage). */
export function resolveBrowserStorage(): StorageLike | null {
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
