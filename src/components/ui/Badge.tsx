import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';
import type { CardTone } from './Card';

const tones: Record<CardTone, string> = {
  default: 'bg-surface-2 text-muted',
  rose: 'bg-rose/25 text-text',
  lavender: 'bg-lavender/30 text-text',
  sage: 'bg-sage/35 text-text',
  gold: 'bg-gold/30 text-text',
};

export function Badge({
  tone = 'default',
  className,
  ...rest
}: HTMLAttributes<HTMLSpanElement> & { tone?: CardTone }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide',
        tones[tone],
        className,
      )}
      {...rest}
    />
  );
}
