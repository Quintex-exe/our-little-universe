import { cn } from '../../lib/cn';

/** Small two-orb logo: a rose and a lavender planet circling a gold spark. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden className={cn('size-9', className)}>
      <circle cx="20" cy="20" r="15" fill="none" stroke="currentColor" strokeOpacity="0.35" strokeDasharray="2 4" />
      <circle cx="13" cy="24" r="7" fill="var(--rose)" />
      <circle cx="27" cy="16" r="5.5" fill="var(--lavender)" />
      <path d="M20 4.5l1.3 3.2 3.2 1.3-3.2 1.3L20 13.5l-1.3-3.2L15.5 9l3.2-1.3z" fill="var(--gold)" />
    </svg>
  );
}
