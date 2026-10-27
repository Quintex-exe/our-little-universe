import { Link } from 'react-router-dom';
import { CalendarClock, CheckCheck, Flower2, ImageIcon } from 'lucide-react';
import { Card, Skeleton } from '../../components/ui';
import type { UniverseStats } from '../../types/universe';

interface Stat {
  label: string;
  value: number;
  to: string;
  icon: typeof ImageIcon;
  tone: 'lavender' | 'sage' | 'rose' | 'gold';
  /** What to say when there is nothing yet, and what to say once there is. */
  empty: string;
  filled: string;
}

function build(s: UniverseStats): Stat[] {
  return [
    { label: 'Saved memories', value: s.memories, to: '/memories', icon: ImageIcon, tone: 'lavender', empty: 'None saved yet', filled: s.memories === 1 ? 'moment kept' : 'moments kept' },
    { label: 'Garden flowers', value: s.flowers, to: '/garden', icon: Flower2, tone: 'sage', empty: 'Nothing planted yet', filled: s.flowers === 1 ? 'flower growing' : 'flowers growing' },
    { label: 'Upcoming plans', value: s.upcomingPlans, to: '/dates', icon: CalendarClock, tone: 'rose', empty: 'Nothing planned yet', filled: s.upcomingPlans === 1 ? 'plan ahead' : 'plans ahead' },
    {
      label: 'Bucket list done',
      value: s.bucketCompleted,
      to: '/bucket-list',
      icon: CheckCheck,
      tone: 'gold',
      empty: s.bucketTotal === 0 ? 'No items yet' : `0 of ${s.bucketTotal} done`,
      filled: `of ${s.bucketTotal} checked off`,
    },
  ];
}

export function StatsGrid({ stats, loading }: { stats: UniverseStats; loading: boolean }) {
  return (
    <section aria-labelledby="stats" className="flex flex-col gap-4">
      <h2 id="stats" className="text-2xl">
        Your universe in numbers
      </h2>
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4" aria-busy={loading}>
        {loading
          ? Array.from({ length: 4 }, (_, i) => (
              <li key={i}>
                <Card className="p-5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="mt-4 h-10 w-16" />
                  <Skeleton className="mt-3 h-3 w-28" />
                </Card>
              </li>
            ))
          : build(stats).map(({ label, value, to, icon: Icon, tone, empty, filled }) => (
              <li key={label}>
                <Link to={to} className="block h-full rounded-card">
                  <Card tone={tone} interactive className="h-full p-5">
                    <div className="flex items-center justify-between gap-2 text-muted">
                      <p className="text-sm font-semibold">{label}</p>
                      <Icon size={17} aria-hidden />
                    </div>
                    <p className="mt-3 font-serif text-4xl font-semibold tabular-nums" data-testid={`stat-${to.slice(1)}`}>
                      {value.toLocaleString()}
                    </p>
                    <p className="mt-1 text-sm text-muted">{value === 0 ? empty : filled}</p>
                  </Card>
                </Link>
              </li>
            ))}
      </ul>
    </section>
  );
}
