import { LocalStorageProfileRepository } from './LocalStorageProfileRepository';
import { ProfileService } from './ProfileService';

export * from './ProfileRepository';
export { ProfileService, ProfileValidationError } from './ProfileService';
export type { PreferencesPatch } from './ProfileService';

/** Swap the repository here when Supabase arrives. */
export const profileService = new ProfileService(new LocalStorageProfileRepository());
