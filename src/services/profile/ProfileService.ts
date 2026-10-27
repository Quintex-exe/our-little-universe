import { hasErrors, validateAll, type FieldErrors } from '../../lib/validation';
import type { OnboardingDraft, Profile, ThemeId } from '../../types/profile';
import type { ProfileRepository } from './ProfileRepository';
import { SCHEMA_VERSION } from './schema';

export class ProfileValidationError extends Error {
  constructor(public readonly errors: FieldErrors) {
    super('Onboarding data is invalid.');
    this.name = 'ProfileValidationError';
  }
}

const orNull = (v: string): string | null => (v.trim() ? v.trim() : null);

export interface PreferencesPatch {
  theme?: ThemeId;
}

export class ProfileService {
  constructor(
    private readonly repository: ProfileRepository,
    private readonly now: () => Date = () => new Date(),
  ) {}

  getProfile(): Promise<Profile | null> {
    return this.repository.load();
  }

  async completeOnboarding(draft: OnboardingDraft): Promise<Profile> {
    const errors = validateAll(draft, this.now());
    if (hasErrors(errors)) throw new ProfileValidationError(errors);

    const stamp = this.now().toISOString();
    const profile: Profile = {
      schemaVersion: SCHEMA_VERSION,
      partnerOne: { name: draft.partnerOneName.trim(), nickname: orNull(draft.partnerOneNickname) },
      partnerTwo: { name: draft.partnerTwoName.trim(), nickname: orNull(draft.partnerTwoNickname) },
      anniversary: orNull(draft.anniversary),
      dedication: orNull(draft.dedication),
      theme: draft.theme,
      createdAt: stamp,
      updatedAt: stamp,
    };
    await this.repository.save(profile);
    return profile;
  }

  async updatePreferences(patch: PreferencesPatch): Promise<Profile> {
    const current = await this.repository.load();
    if (!current) throw new Error('No profile to update.');
    const next: Profile = { ...current, ...patch, updatedAt: this.now().toISOString() };
    await this.repository.save(next);
    return next;
  }

  resetSetup(): Promise<void> {
    return this.repository.clear();
  }
}
