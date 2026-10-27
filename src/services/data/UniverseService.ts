import { ADVENTURES, type Adventure } from '../../data/adventures';
import { toLocalISODate } from '../../lib/dates';
import { pickSuggestion, pushRecent } from '../../lib/suggestions';
import type { BucketItem, Flower, Memory, Plan, UniverseData } from '../../types/universe';
import type { UniverseRepository } from './UniverseRepository';

type Id = () => string;
const defaultId: Id = () => (globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(36).slice(2)}`);

/**
 * One place that reads and changes saved data. Every method loads the latest data,
 * applies a change and returns the full result, so the UI never edits storage directly.
 */
export class UniverseService {
  private queue: Promise<unknown> = Promise.resolve();

  constructor(
    private readonly repository: UniverseRepository,
    private readonly now: () => Date = () => new Date(),
    private readonly newId: Id = defaultId,
    private readonly pool: readonly Adventure[] = ADVENTURES,
    private readonly rand: () => number = Math.random,
  ) {}

  getData(): Promise<UniverseData> {
    return this.repository.load();
  }

  /** Changes are applied one at a time so quick clicks never overwrite each other. */
  private mutate(change: (data: UniverseData) => void): Promise<UniverseData> {
    const run = async () => {
      const data = await this.repository.load();
      change(data);
      await this.repository.save(data);
      return data;
    };
    const result = this.queue.then(run, run);
    this.queue = result.catch(() => undefined);
    return result;
  }

  private stamp(): string {
    return this.now().toISOString();
  }

  // Collections. Feature phases build their screens on these.
  addMemory(input: { title: string; note?: string; date: string }): Promise<UniverseData> {
    const m: Memory = { id: this.newId(), title: input.title.trim(), note: input.note?.trim() || null, date: input.date, createdAt: this.stamp() };
    return this.mutate((d) => void d.memories.push(m));
  }
  addFlower(input: { kind: string; name?: string }): Promise<UniverseData> {
    const f: Flower = { id: this.newId(), kind: input.kind, name: input.name?.trim() || null, plantedAt: this.stamp() };
    return this.mutate((d) => void d.flowers.push(f));
  }
  addPlan(input: { title: string; date: string; note?: string }): Promise<UniverseData> {
    const p: Plan = { id: this.newId(), title: input.title.trim(), date: input.date, note: input.note?.trim() || null, createdAt: this.stamp() };
    return this.mutate((d) => void d.plans.push(p));
  }
  addBucketItem(title: string): Promise<UniverseData> {
    const b: BucketItem = { id: this.newId(), title: title.trim(), completedAt: null, createdAt: this.stamp() };
    return this.mutate((d) => void d.bucketItems.push(b));
  }
  setBucketItemDone(id: string, done: boolean): Promise<UniverseData> {
    return this.mutate((d) => {
      const item = d.bucketItems.find((b) => b.id === id);
      if (item) item.completedAt = done ? this.stamp() : null;
    });
  }

  // Today's little adventure.
  /** Picks a fresh idea, avoiding the current one and recent history. */
  nextAdventure(): Promise<UniverseData> {
    return this.mutate((d) => {
      const date = toLocalISODate(this.now());
      const current = d.adventures.today?.date === date ? d.adventures.today.id : null;
      const pick = pickSuggestion(this.pool, { recent: d.adventures.recent, current, rand: this.rand });
      if (!pick) return;
      d.adventures.today = { date, id: pick.id };
      d.adventures.recent = pushRecent(d.adventures.recent, pick.id, this.pool.length);
    });
  }

  toggleFavourite(adventureId: string): Promise<UniverseData> {
    return this.mutate((d) => {
      const fav = d.adventures.favourites;
      d.adventures.favourites = fav.includes(adventureId) ? fav.filter((f) => f !== adventureId) : [...fav, adventureId];
    });
  }
}
