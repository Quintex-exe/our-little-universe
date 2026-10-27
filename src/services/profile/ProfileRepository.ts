import type { Profile } from '../../types/profile';

/**
 * Storage boundary. Implement this for Supabase later (load/save/clear against a
 * `profiles` row) and pass it to ProfileService. Nothing else needs to change.
 */
export interface ProfileRepository {
  load(): Promise<Profile | null>;
  save(profile: Profile): Promise<void>;
  clear(): Promise<void>;
}

export class ProfileStorageError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'ProfileStorageError';
  }
}
