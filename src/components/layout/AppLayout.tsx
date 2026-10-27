import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Ellipsis } from 'lucide-react';
import { primaryPaths, sections } from '../../config/sections';
import { cn } from '../../lib/cn';
import { Dialog } from '../ui/Dialog';
import { BrandMark } from './BrandMark';
import { ThemeToggle } from './ThemeToggle';

const accentDot = {
  rose: 'bg-rose',
  lavender: 'bg-lavender',
  sage: 'bg-sage',
  gold: 'bg-gold',
} as const;

function Wordmark() {
  return (
    <div className="flex items-center gap-3">
      <BrandMark />
      <div className="leading-tight">
        <p className="font-serif text-lg font-semibold">Our Little</p>
        <p className="font-serif text-lg font-semibold text-muted">Universe</p>
      </div>
    </div>
  );
}

export function AppLayout() {
  const [moreOpen, setMoreOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setMoreOpen(false);
    window.scrollTo({ top: 0 });
  }, [pathname]);

  const primary = sections.filter((s) => primaryPaths.includes(s.path));
  const overflowActive = !primaryPaths.includes(pathname) && sections.some((s) => s.path === pathname);

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[17rem_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-border bg-bg-soft/70 px-5 py-6 backdrop-blur lg:flex">
        <Wordmark />
        <nav aria-label="Main" className="mt-8 flex flex-1 flex-col gap-1 overflow-y-auto">
          {sections.map(({ path, label, icon: Icon, accent }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-[0.95rem] font-medium transition',
                  isActive ? 'bg-surface text-text shadow-soft ring-1 ring-border' : 'text-muted hover:bg-surface/60 hover:text-text',
                )
              }
            >
              <Icon size={19} />
              <span className="flex-1">{label}</span>
              <span className={cn('size-1.5 rounded-full opacity-0 transition group-aria-[current=page]:opacity-100', accentDot[accent])} />
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center justify-between pt-4">
          <span className="eyebrow">Theme</span>
          <ThemeToggle />
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        {/* Mobile / tablet top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-bg/80 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-md sm:px-6 lg:hidden">
          <Wordmark />
          <ThemeToggle />
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-8 sm:px-8 sm:pt-10 lg:px-12 lg:pb-16 lg:pt-14">
          <div key={pathname} className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile / tablet bottom navigation */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
      >
        <ul className="mx-auto flex max-w-xl items-stretch justify-around px-2">
          {primary.map(({ path, label, icon: Icon }) => (
            <li key={path} className="flex-1">
              <NavLink
                to={path}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center gap-0.5 py-2.5 text-[0.7rem] font-semibold transition',
                    isActive ? 'text-text' : 'text-muted',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={cn('grid h-7 w-12 place-items-center rounded-full transition', isActive && 'bg-primary/40')}>
                      <Icon size={20} />
                    </span>
                    {label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
          <li className="flex-1">
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              className={cn(
                'flex w-full flex-col items-center gap-0.5 py-2.5 text-[0.7rem] font-semibold transition',
                overflowActive ? 'text-text' : 'text-muted',
              )}
            >
              <span className={cn('grid h-7 w-12 place-items-center rounded-full', overflowActive && 'bg-primary/40')}>
                <Ellipsis size={20} />
              </span>
              More
            </button>
          </li>
        </ul>
      </nav>

      <Dialog open={moreOpen} onClose={() => setMoreOpen(false)} title="Everywhere in your universe">
        <ul className="grid grid-cols-2 gap-2.5">
          {sections.map(({ path, label, icon: Icon, accent }) => (
            <li key={path}>
              <NavLink
                to={path}
                className="flex items-center gap-3 rounded-2xl border border-border bg-surface-2 px-3.5 py-3 text-sm font-semibold transition hover:border-border-strong"
              >
                <span className={cn('grid size-8 place-items-center rounded-full text-plum', accentDot[accent])}>
                  <Icon size={16} />
                </span>
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </Dialog>
    </div>
  );
}
