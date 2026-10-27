import { isValidISODate } from '../../lib/dates';
import {
  EMPTY_UNIVERSE,
  type AdventureState,
  type BucketItem,
  type Flower,
  type Memory,
  type Plan,
  type UniverseData,
} from '../../types/universe';

export const UNIVERSE_SCHEMA_VERSION = 1 as const;

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const str = (v: unknown): string | null => (typeof v === 'string' && v.trim() ? v : null);
const day = (v: unknown): string | null => (typeof v === 'string' && isValidISODate(v) ? v : null);
const list = <T>(v: unknown, map: (x: Record<string, unknown>) => T | null): T[] =>
  Array.isArray(v) ? v.flatMap((x) => (isObj(x) ? (map(x) ?? []) : [])) : [];

function memory(x: Record<string, unknown>): Memory | null {
  const id = str(x.id), title = str(x.title), date = day(x.date);
  if (!id || !title || !date) return null;
  return { id, title, note: str(x.note), date, createdAt: str(x.createdAt) ?? new Date(0).toISOString() };
}
function flower(x: Record<string, unknown>): Flower | null {
  const id = str(x.id), kind = str(x.kind);
  if (!id || !kind) return null;
  return { id, kind, name: str(x.name), plantedAt: str(x.plantedAt) ?? new Date(0).toISOString() };
}
function plan(x: Record<string, unknown>): Plan | null {
  const id = str(x.id), title = str(x.title), date = day(x.date);
  if (!id || !title || !date) return null;
  return { id, title, date, note: str(x.note), createdAt: str(x.createdAt) ?? new Date(0).toISOString() };
}
function bucket(x: Record<string, unknown>): BucketItem | null {
  const id = str(x.id), title = str(x.title);
  if (!id || !title) return null;
  return { id, title, completedAt: str(x.completedAt), createdAt: str(x.createdAt) ?? new Date(0).toISOString() };
}
const strings = (v: unknown): string[] => (Array.isArray(v) ? v.filter((s): s is string => typeof s === 'string') : []);

function adventures(v: unknown): AdventureState {
  if (!isObj(v)) return { ...EMPTY_UNIVERSE.adventures, favourites: [], recent: [] };
  const t = isObj(v.today) ? { date: day(v.today.date), id: str(v.today.id) } : null;
  return {
    today: t && t.date && t.id ? { date: t.date, id: t.id } : null,
    favourites: [...new Set(strings(v.favourites))],
    recent: strings(v.recent),
  };
}

/** Defensive parse of untrusted stored data. Bad entries are dropped, never thrown on. */
export function parseUniverse(value: unknown): UniverseData {
  if (!isObj(value)) return structuredClone(EMPTY_UNIVERSE);
  return {
    schemaVersion: UNIVERSE_SCHEMA_VERSION,
    memories: list(value.memories, memory),
    flowers: list(value.flowers, flower),
    plans: list(value.plans, plan),
    bucketItems: list(value.bucketItems, bucket),
    adventures: adventures(value.adventures),
  };
}
