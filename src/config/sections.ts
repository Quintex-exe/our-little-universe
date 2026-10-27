import {
  CalendarHeart,
  CheckCheck,
  Gamepad2,
  Home,
  Images,
  Mailbox,
  Route,
  Settings,
  Sprout,
  Sparkles,
} from 'lucide-react';
import type { Section } from '../types/navigation';

export const welcomeSection: Section = {
  path: '/welcome',
  label: 'Welcome',
  icon: Sparkles,
  accent: 'gold',
  tagline: 'A quiet corner of the sky, made for two.',
  preview: [],
};

/** Ordered sections shown in navigation. */
export const sections: Section[] = [
  {
    path: '/dashboard',
    label: 'Home',
    icon: Home,
    accent: 'rose',
    tagline: 'Your little universe at a glance.',
    preview: ['Days together', 'Today’s note', 'What’s growing'],
  },
  {
    path: '/garden',
    label: 'Garden',
    icon: Sprout,
    accent: 'sage',
    tagline: 'Tend something small and shared.',
    preview: ['Plant seeds together', 'Watch them grow', 'Seasonal blooms'],
  },
  {
    path: '/memories',
    label: 'Memories',
    icon: Images,
    accent: 'lavender',
    tagline: 'Keep the moments worth keeping.',
    preview: ['Photo keepsakes', 'Little stories', 'Favourite days'],
  },
  {
    path: '/timeline',
    label: 'Timeline',
    icon: Route,
    accent: 'gold',
    tagline: 'The path you have walked so far.',
    preview: ['Milestones', 'Anniversaries', 'Chapters'],
  },
  {
    path: '/dates',
    label: 'Dates',
    icon: CalendarHeart,
    accent: 'rose',
    tagline: 'Plan the next good evening.',
    preview: ['Date ideas', 'Upcoming plans', 'Past favourites'],
  },
  {
    path: '/games',
    label: 'Games',
    icon: Gamepad2,
    accent: 'lavender',
    tagline: 'Playful things for two.',
    preview: ['Quick quizzes', 'Would you rather', 'Shared challenges'],
  },
  {
    path: '/messages',
    label: 'Messages',
    icon: Mailbox,
    accent: 'rose',
    tagline: 'Notes left for each other.',
    preview: ['Love notes', 'Open when…', 'Scheduled surprises'],
  },
  {
    path: '/bucket-list',
    label: 'Bucket list',
    icon: CheckCheck,
    accent: 'sage',
    tagline: 'Everything you still want to do.',
    preview: ['Dreams to chase', 'Small adventures', 'Checked-off wins'],
  },
  {
    path: '/settings',
    label: 'Settings',
    icon: Settings,
    accent: 'gold',
    tagline: 'Make this place feel like yours.',
    preview: ['Appearance', 'Profile', 'Data & privacy'],
  },
];

/** Primary items pinned to the mobile bottom bar; the rest live under "More". */
export const primaryPaths = ['/dashboard', '/garden', '/memories', '/messages'];
