import type { LucideIcon } from 'lucide-react';

export type SectionAccent = 'rose' | 'lavender' | 'sage' | 'gold';

export interface Section {
  path: string;
  label: string;
  icon: LucideIcon;
  accent: SectionAccent;
  /** One-line description shown in navigation and on placeholder pages. */
  tagline: string;
  /** What this space will hold; used by placeholder pages only. */
  preview: string[];
}
