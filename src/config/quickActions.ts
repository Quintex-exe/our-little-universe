import { CalendarHeart, CheckCheck, Flower2, Gamepad2, ImagePlus, Send } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { SectionAccent } from '../types/navigation';

export interface QuickAction {
  label: string;
  hint: string;
  to: string;
  icon: LucideIcon;
  accent: SectionAccent;
}

export const quickActions: QuickAction[] = [
  { label: 'Plant a flower', hint: 'Grow something together', to: '/garden', icon: Flower2, accent: 'sage' },
  { label: 'Add a memory', hint: 'Keep a moment safe', to: '/memories', icon: ImagePlus, accent: 'lavender' },
  { label: 'Plan a date', hint: 'Pick the next evening', to: '/dates', icon: CalendarHeart, accent: 'rose' },
  { label: 'Send a message', hint: 'Leave a note to find', to: '/messages', icon: Send, accent: 'rose' },
  { label: 'Play a game', hint: 'Something light for two', to: '/games', icon: Gamepad2, accent: 'gold' },
  { label: 'Add a bucket-list item', hint: 'Something still to do', to: '/bucket-list', icon: CheckCheck, accent: 'sage' },
];
