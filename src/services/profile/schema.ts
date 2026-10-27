import { isValidISODate } from '../../lib/dates';
import { LIMITS } from '../../lib/validation';
import { DEFAULT_THEME, THEME_IDS, type Partner, type Profile, type ThemeId } from '../../types/profile';

export const SCHEMA_VERSION = 1 as const;

function cleanText(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null;
  const v = value.trim();
  return v && v.length <= max ? v : null;
}

function cleanPartner(value: unknown): Partner | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  const name = cleanText(raw.name, LIMITS.name);
  if (!name) return null;
  return { name, nickname: cleanText(raw.nickname, LIMITS.nickname) };
}

/** Defensive parse of untrusted data (storage, network). Returns null when unusable. */
export function parseProfile(value: unknown): Profile | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  const partnerOne = cleanPartner(raw.partnerOne);
  const partnerTwo = cleanPartner(raw.partnerTwo);
  if (!partnerOne || !partnerTwo) return null;

  const theme: ThemeId = (THEME_IDS as readonly unknown[]).includes(raw.theme)
    ? (raw.theme as ThemeId)
    : DEFAULT_THEME;
  const anniversary =
    typeof raw.anniversary === 'string' && isValidISODate(raw.anniversary) ? raw.anniversary : null;
  const now = new Date().toISOString();

  return {
    schemaVersion: SCHEMA_VERSION,
    partnerOne,
    partnerTwo,
    anniversary,
    dedication: cleanText(raw.dedication, LIMITS.dedication),
    theme,
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : now,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : now,
  };
}
