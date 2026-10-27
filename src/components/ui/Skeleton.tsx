import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

/** Pulsing placeholder block shown while saved data loads. */
export function Skeleton({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden className={cn('animate-pulse rounded-xl bg-surface-2', className)} {...rest} />;
}
