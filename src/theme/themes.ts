import type { ThemeId } from '../types/profile';

export const THEMES: { id: ThemeId; label: string; description: string }[] = [
  { id: 'twilight', label: 'Twilight', description: 'Soft violet dusk' },
  { id: 'aurora', label: 'Aurora', description: 'Northern-lights green' },
  { id: 'ember', label: 'Ember', description: 'Warm rose and amber' },
  { id: 'moonlight', label: 'Moonlight', description: 'Cool silver blue' },
];
