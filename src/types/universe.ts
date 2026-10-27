/** Shared data model for everything a couple saves. Feature phases fill these collections. */

export interface Memory {
  id: string;
  title: string;
  note: string | null;
  /** ISO day the memory happened, YYYY-MM-DD */
  date: string;
  createdAt: string;
}

export interface Flower {
  id: string;
  kind: string;
  name: string | null;
  plantedAt: string;
}

export interface Plan {
  id: string;
  title: string;
  /** ISO day, YYYY-MM-DD */
  date: string;
  note: string | null;
  createdAt: string;
}

export interface BucketItem {
  id: string;
  title: string;
  completedAt: string | null;
  createdAt: string;
}

export interface AdventureState {
  /** The idea shown for a given local day, so a reload keeps it. */
  today: { date: string; id: string } | null;
  favourites: string[];
  /** Most recently suggested ids, oldest first. Used to avoid repeats. */
  recent: string[];
}

export interface UniverseData {
  schemaVersion: 1;
  memories: Memory[];
  flowers: Flower[];
  plans: Plan[];
  bucketItems: BucketItem[];
  adventures: AdventureState;
}

export const EMPTY_UNIVERSE: UniverseData = {
  schemaVersion: 1,
  memories: [],
  flowers: [],
  plans: [],
  bucketItems: [],
  adventures: { today: null, favourites: [], recent: [] },
};

export interface UniverseStats {
  memories: number;
  flowers: number;
  upcomingPlans: number;
  bucketCompleted: number;
  bucketTotal: number;
}
