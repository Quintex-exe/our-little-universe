export interface PickOptions {
  /** Recently suggested ids, oldest first. */
  recent: readonly string[];
  /** The idea on screen now; never returned again straight away. */
  current?: string | null;
  /** Returns a number in [0, 1). Injected for tests. */
  rand?: () => number;
}

/** How many past suggestions to remember: half the pool, so a cycle never repeats early. */
export function historyLimit(poolSize: number): number {
  return Math.max(1, Math.floor(poolSize / 2));
}

/** Picks an item that is not the current one and not among the recent ones. */
export function pickSuggestion<T extends { id: string }>(
  pool: readonly T[],
  { recent, current = null, rand = Math.random }: PickOptions,
): T | null {
  if (pool.length === 0) return null;
  if (pool.length === 1) return pool[0];
  const avoid = new Set(recent.slice(-historyLimit(pool.length)));
  if (current) avoid.add(current);
  let candidates = pool.filter((p) => !avoid.has(p.id));
  if (candidates.length === 0) candidates = pool.filter((p) => p.id !== current);
  return candidates[Math.min(candidates.length - 1, Math.floor(rand() * candidates.length))];
}

/** Appends an id to the history and trims it to the limit. */
export function pushRecent(recent: readonly string[], id: string, poolSize: number): string[] {
  return [...recent.filter((r) => r !== id), id].slice(-historyLimit(poolSize));
}
