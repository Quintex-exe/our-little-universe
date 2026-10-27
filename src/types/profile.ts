export const THEME_IDS = ['twilight', 'aurora', 'ember', 'moonlight'] as const;
export type ThemeId = (typeof THEME_IDS)[number];
export const DEFAULT_THEME: ThemeId = 'twilight';

export interface Partner {
  name: string;
  nickname: string | null;
}

/** Persisted shape. Storage-agnostic: maps cleanly to a future database row. */
export interface Profile {
  schemaVersion: 1;
  partnerOne: Partner;
  partnerTwo: Partner;
  /** ISO date, YYYY-MM-DD */
  anniversary: string | null;
  dedication: string | null;
  theme: ThemeId;
  createdAt: string;
  updatedAt: string;
}

/** Raw form state. Optional fields use empty strings. */
export interface OnboardingDraft {
  partnerOneName: string;
  partnerOneNickname: string;
  partnerTwoName: string;
  partnerTwoNickname: string;
  anniversary: string;
  dedication: string;
  theme: ThemeId;
}

export const EMPTY_DRAFT: OnboardingDraft = {
  partnerOneName: '',
  partnerOneNickname: '',
  partnerTwoName: '',
  partnerTwoNickname: '',
  anniversary: '',
  dedication: '',
  theme: DEFAULT_THEME,
};
