import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { quickActions } from '../../config/quickActions';
import { cn } from '../../lib/cn';

const tint = {
  rose: 'bg-rose/35',
  lavender: 'bg-lavender/40',
  sage: 'bg-sage/45',
  gold: 'bg-gold/40',
} as const;

export function QuickActions() {
  return (
    <section aria-labelledby="quick-actions" className="flex flex-col gap-4">
      <h2 id="quick-actions" className="text-2xl">
        Start something
      </h2>
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {quickActions.map(({ label, hint, to, icon: Icon, accent }) => (
          <li key={to}>
            <Link
              to={to}
              className="group flex h-full flex-col gap-3 rounded-2xl border border-border bg-surface p-4 shadow-soft transition duration-300 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-lift sm:flex-row sm:items-center sm:p-5"
            >
              <span className={cn('grid size-11 shrink-0 place-items-center rounded-full', tint[accent])}>
                <Icon size={20} aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold leading-snug">{label}</span>
                <span className="mt-0.5 hidden text-sm text-muted sm:block">{hint}</span>
              </span>
              <ArrowUpRight
                size={18}
                aria-hidden
                className="hidden shrink-0 text-muted transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-text sm:block"
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
