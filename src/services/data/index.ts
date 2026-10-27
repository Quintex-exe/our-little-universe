import { LocalStorageUniverseRepository } from './LocalStorageUniverseRepository';
import { UniverseService } from './UniverseService';

export type { UniverseRepository } from './UniverseRepository';
export { UniverseService } from './UniverseService';

/** Swap the repository here when Supabase arrives. */
export const universeService = new UniverseService(new LocalStorageUniverseRepository());
