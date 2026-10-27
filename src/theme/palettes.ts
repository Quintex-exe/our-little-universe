import type { ThemeId } from '../types/profile';

export interface PaletteOption {
  id: ThemeId;
  label: string;
  blurb: string;
  /** Preview swatches: [main, supporting]. */
  swatch: [string, string];
}

export const PALETTES: PaletteOption[] = [
  { id: 'rose', label: 'Rose petal', blurb: 'Warm and soft', swatch: ['#D99AA6', '#B8A7D9'] },
  { id: 'lavender', label: 'Lavender dusk', blurb: 'Calm and dreamy', swatch: ['#B8A7D9', '#D99AA6'] },
  { id: 'sage', label: 'Sage meadow', blurb: 'Fresh and grounded', swatch: ['#A9B8A0', '#D9B879'] },
  { id: 'gold', label: 'Golden hour', blurb: 'Glowing and cosy', swatch: ['#D9B879', '#B8A7D9'] },
];

/** Sets the accent palette on <html>; CSS in styles/index.css does the rest. */
export function applyPalette(id: ThemeId): void {
  document.documentElement.dataset.palette = id;
}
