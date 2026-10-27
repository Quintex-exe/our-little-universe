import type { UniverseData } from '../../types/universe';

/**
 * Storage boundary for everything a couple saves. Implement this for Supabase later
 * and pass it to UniverseService; nothing above it changes.
 */
export interface UniverseRepository {
  load(): Promise<UniverseData>;
  save(data: UniverseData): Promise<void>;
}
