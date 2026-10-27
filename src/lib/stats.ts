import type { UniverseData, UniverseStats } from '../types/universe';

/** Every figure is derived from saved data; nothing is hardcoded. */
export function computeStats(data: UniverseData, today: string): UniverseStats {
  return {
    memories: data.memories.length,
    flowers: data.flowers.length,
    upcomingPlans: data.plans.filter((p) => p.date >= today).length,
    bucketCompleted: data.bucketItems.filter((b) => b.completedAt !== null).length,
    bucketTotal: data.bucketItems.length,
  };
}

/** Picks one memory per calendar day, stable across reloads that day. */
export function pickFeaturedMemory<T extends { id: string }>(memories: T[], today: string): T | null {
  if (memories.length === 0) return null;
  let h = 2166136261;
  for (const ch of today) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return memories[(h >>> 0) % memories.length];
}
