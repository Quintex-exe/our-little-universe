import { isValidISODate, toLocalISODate } from './dates';
import { THEME_IDS, type OnboardingDraft } from '../types/profile';

export const LIMITS = { name: 40, nickname: 30, dedication: 280 } as const;
export const MIN_ANNIVERSARY = '1900-01-01';

export type StepId = 'names' | 'nicknames' | 'story' | 'theme';
export type FieldErrors = Partial<Record<keyof OnboardingDraft, string>>;

const HAS_TEXT = /[\p{L}\p{N}]/u;
const CONTROL_CHARS = /[\p{Cc}]/u;

function checkName(value: string, max: number, label: string, required: boolean): string | undefined {
  const v = value.trim();
  if (!v) return required ? `Please enter ${label}.` : undefined;
  if (v.length > max) return `Keep this to ${max} characters or fewer.`;
  if (!HAS_TEXT.test(v)) return 'Please include at least one letter.';
  if (CONTROL_CHARS.test(v)) return 'Please remove special control characters.';
  return undefined;
}

export const STEP_FIELDS: Record<StepId, (keyof OnboardingDraft)[]> = {
  names: ['partnerOneName', 'partnerTwoName'],
  nicknames: ['partnerOneNickname', 'partnerTwoNickname'],
  story: ['anniversary', 'dedication'],
  theme: ['theme'],
};

export function validateField(
  field: keyof OnboardingDraft,
  draft: OnboardingDraft,
  today: Date = new Date(),
): string | undefined {
  switch (field) {
    case 'partnerOneName':
      return checkName(draft.partnerOneName, LIMITS.name, "partner one's name", true);
    case 'partnerTwoName':
      return checkName(draft.partnerTwoName, LIMITS.name, "partner two's name", true);
    case 'partnerOneNickname':
      return checkName(draft.partnerOneNickname, LIMITS.nickname, 'a nickname', false);
    case 'partnerTwoNickname':
      return checkName(draft.partnerTwoNickname, LIMITS.nickname, 'a nickname', false);
    case 'anniversary': {
      const v = draft.anniversary.trim();
      if (!v) return undefined;
      if (!isValidISODate(v)) return 'Please enter a valid date.';
      if (v < MIN_ANNIVERSARY) return 'Please choose a date after 1900.';
      if (v > toLocalISODate(today)) return 'This date is in the future.';
      return undefined;
    }
    case 'dedication': {
      if (draft.dedication.trim().length > LIMITS.dedication)
        return `Keep this to ${LIMITS.dedication} characters or fewer.`;
      return undefined;
    }
    case 'theme':
      return (THEME_IDS as readonly string[]).includes(draft.theme) ? undefined : 'Please pick a theme.';
  }
}

export function validateStep(step: StepId, draft: OnboardingDraft, today: Date = new Date()): FieldErrors {
  const errors: FieldErrors = {};
  for (const field of STEP_FIELDS[step]) {
    const message = validateField(field, draft, today);
    if (message) errors[field] = message;
  }
  return errors;
}

export function validateAll(draft: OnboardingDraft, today: Date = new Date()): FieldErrors {
  const all: FieldErrors = {};
  for (const step of Object.keys(STEP_FIELDS) as StepId[]) Object.assign(all, validateStep(step, draft, today));
  return all;
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
