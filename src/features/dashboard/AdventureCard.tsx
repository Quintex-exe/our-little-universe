import { useState } from 'react';
import { Clock, Heart, RefreshCw, Sparkles, Wallet, X } from 'lucide-react';
import { Badge, Button, Card, Skeleton, useToast } from '../../components/ui';
import { ADVENTURES, CATEGORY_LABEL } from '../../data/adventures';
import { cn } from '../../lib/cn';
import { toLocalISODate } from '../../lib/dates';
import { useUniverse } from '../../state/UniverseContext';

const byId = new Map(ADVENTURES.map((a) => [a.id, a]));

export function AdventureCard() {
  const { status, data, nextAdventure, toggleFavourite } = useUniverse();
  const { notify } = useToast();
  const [busy, setBusy] = useState(false);

  const today = toLocalISODate(new Date());
  const current = data.adventures.today?.date === today ? byId.get(data.adventures.today.id) : undefined;
  const saved = data.adventures.favourites.flatMap((id) => byId.get(id) ?? []);
  const isSaved = current ? data.adventures.favourites.includes(current.id) : false;

  async function run(action: () => Promise<void>, failure: string) {
    if (busy) return;
    setBusy(true);
    try {
      await action();
    } catch {
      notify({ tone: 'error', title: failure, description: 'Please try again.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card tone="gold" className="flex h-full flex-col p-6 sm:p-7" aria-busy={status === 'loading'}>
      <p className="eyebrow">Today’s little adventure</p>

      {status === 'loading' ? (
        <div className="mt-5 flex flex-col gap-3">
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-10 w-40" />
        </div>
      ) : (
        <div className="mt-4 flex flex-1 flex-col">
          {current ? (
            <div key={current.id} className="step-enter" aria-live="polite">
              <Badge tone="gold">{CATEGORY_LABEL[current.category]}</Badge>
              <h2 className="mt-3 text-2xl sm:text-3xl" data-testid="adventure-title">
                {current.title}
              </h2>
              <p className="mt-3 text-muted">{current.detail}</p>
              <p className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm font-semibold text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={15} aria-hidden /> {current.time}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Wallet size={15} aria-hidden /> {current.cost}
                </span>
              </p>
            </div>
          ) : (
            <div>
              <span className="grid size-14 place-items-center rounded-2xl border border-dashed border-border-strong text-muted">
                <Sparkles size={24} aria-hidden />
              </span>
              <h2 className="mt-4 text-2xl sm:text-3xl">What shall we do today?</h2>
              <p className="mt-3 text-muted">Get one small idea for the two of you. Not keen? Ask for another.</p>
            </div>
          )}

          <div className="mt-auto flex flex-wrap items-center gap-3 pt-6">
            {current ? (
              <>
                <Button
                  variant="secondary"
                  loading={busy}
                  onClick={() => void run(nextAdventure, 'Couldn’t get another idea')}
                  leftIcon={<RefreshCw size={16} />}
                >
                  Another idea
                </Button>
                <Button
                  variant={isSaved ? 'primary' : 'ghost'}
                  aria-pressed={isSaved}
                  disabled={busy}
                  onClick={() => void run(() => toggleFavourite(current.id), 'Couldn’t update your saved ideas')}
                  leftIcon={<Heart size={16} className={cn(isSaved && 'fill-current')} />}
                >
                  {isSaved ? 'Saved' : 'Save idea'}
                </Button>
              </>
            ) : (
              <Button loading={busy} onClick={() => void run(nextAdventure, 'Couldn’t find an idea')} leftIcon={<Sparkles size={16} />}>
                Find an idea
              </Button>
            )}
          </div>

          {saved.length > 0 && (
            <details className="mt-5 rounded-2xl border border-border bg-surface-2 px-4 py-3">
              <summary className="cursor-pointer text-sm font-semibold">Saved ideas ({saved.length})</summary>
              <ul className="mt-3 flex flex-col gap-1.5">
                {saved.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 text-sm">
                    <span>{a.title}</span>
                    <button
                      type="button"
                      aria-label={`Remove ${a.title} from saved ideas`}
                      disabled={busy}
                      onClick={() => void run(() => toggleFavourite(a.id), 'Couldn’t update your saved ideas')}
                      className="grid size-7 shrink-0 place-items-center rounded-full text-muted transition hover:bg-surface hover:text-text"
                    >
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </Card>
  );
}
