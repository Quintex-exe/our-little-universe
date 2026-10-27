import { useMemo } from 'react';
import { Quote } from 'lucide-react';
import { Button } from '../components/ui';
import { AdventureCard } from '../features/dashboard/AdventureCard';
import { FeaturedMemory } from '../features/dashboard/FeaturedMemory';
import { QuickActions } from '../features/dashboard/QuickActions';
import { StatsGrid } from '../features/dashboard/StatsGrid';
import { daysTogether, formatToday, greetingFor, toLocalISODate } from '../lib/dates';
import { computeStats, pickFeaturedMemory } from '../lib/stats';
import { useProfile } from '../state/ProfileContext';
import { useUniverse } from '../state/UniverseContext';

const delay = (s: number) => ({ '--d': `${s}s` }) as React.CSSProperties;

export default function Dashboard() {
  const { profile } = useProfile();
  const { status, data, retry } = useUniverse();
  const now = new Date();
  const today = toLocalISODate(now);

  const stats = useMemo(() => computeStats(data, today), [data, today]);
  const featured = useMemo(() => pickFeaturedMemory(data.memories, today), [data.memories, today]);

  if (!profile) return null;
  const { partnerOne, partnerTwo, anniversary, dedication } = profile;
  const callOne = partnerOne.nickname ?? partnerOne.name;
  const callTwo = partnerTwo.nickname ?? partnerTwo.name;
  const days = anniversary ? daysTogether(anniversary) : null;
  const loading = status === 'loading';

  return (
    <div className="flex flex-col gap-10 sm:gap-12">
      <header className="rise">
        <p className="eyebrow" data-testid="today-date">
          {formatToday(now)}
        </p>
        <h1 className="mt-2 text-4xl sm:text-5xl" data-testid="greeting">
          {greetingFor(now)}, {callOne} &amp; {callTwo}
        </h1>
        <p className="mt-3 text-lg text-muted">
          {days !== null && days > 0
            ? `${days.toLocaleString()} ${days === 1 ? 'day' : 'days'} together and counting.`
            : days === 0
              ? 'Today is day one.'
              : 'Your little universe is right where you left it.'}
        </p>
        {dedication && (
          <p className="mt-4 flex max-w-xl items-start gap-2.5 font-serif text-lg leading-snug text-muted">
            <Quote size={16} aria-hidden className="mt-1.5 shrink-0" />
            <span className="whitespace-pre-line">{dedication}</span>
          </p>
        )}
      </header>

      {status === 'failed' && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-danger/40 bg-danger/10 px-5 py-4">
          <p>We couldn’t open your saved data.</p>
          <Button size="sm" variant="secondary" onClick={retry}>
            Try again
          </Button>
        </div>
      )}

      <div className="rise" style={delay(0.1)}>
        <QuickActions />
      </div>
      <div className="rise" style={delay(0.2)}>
        <StatsGrid stats={stats} loading={loading} />
      </div>
      <div className="rise grid gap-5 lg:grid-cols-2" style={delay(0.3)}>
        <FeaturedMemory memory={featured} loading={loading} />
        <AdventureCard />
      </div>
    </div>
  );
}
