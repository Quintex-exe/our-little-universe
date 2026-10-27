import { Link } from 'react-router-dom';
import { ImagePlus, Quote } from 'lucide-react';
import { Button, Card, CardText, Skeleton } from '../../components/ui';
import { formatLongDate } from '../../lib/dates';
import type { Memory } from '../../types/universe';

export function FeaturedMemory({ memory, loading }: { memory: Memory | null; loading: boolean }) {
  return (
    <Card tone="lavender" className="flex h-full flex-col p-6 sm:p-7" aria-labelledby="featured-memory" aria-busy={loading}>
      <p className="eyebrow">Featured memory</p>

      {loading ? (
        <div className="mt-5 flex flex-col gap-3">
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      ) : memory ? (
        <div className="mt-4 flex flex-1 flex-col">
          <Quote size={22} aria-hidden className="text-muted" />
          <h2 id="featured-memory" className="mt-3 text-2xl sm:text-3xl" data-testid="featured-title">
            {memory.title}
          </h2>
          {memory.note && <p className="mt-3 line-clamp-4 whitespace-pre-line text-muted">{memory.note}</p>}
          <p className="mt-4 text-sm font-semibold text-muted">{formatLongDate(memory.date)}</p>
          <div className="mt-auto pt-6">
            <Link to="/memories">
              <Button variant="secondary" size="sm">
                See all memories
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-1 flex-col items-start">
          <span className="grid size-14 place-items-center rounded-2xl border border-dashed border-border-strong text-muted">
            <ImagePlus size={24} aria-hidden />
          </span>
          <h2 id="featured-memory" className="mt-4 text-2xl sm:text-3xl">
            Your first memory belongs here
          </h2>
          <CardText>A trip, a joke, an ordinary Tuesday. Save one and it will show up on this page.</CardText>
          <div className="mt-auto pt-6">
            <Link to="/memories">
              <Button leftIcon={<ImagePlus size={16} />}>Add a memory</Button>
            </Link>
          </div>
        </div>
      )}
    </Card>
  );
}
