import type { ElementType, HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export type CardTone = 'default' | 'rose' | 'lavender' | 'sage' | 'gold';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  tone?: CardTone;
  interactive?: boolean;
}

const tones: Record<CardTone, string> = {
  default: '',
  rose: 'before:bg-rose',
  lavender: 'before:bg-lavender',
  sage: 'before:bg-sage',
  gold: 'before:bg-gold',
};

/** Soft rounded surface. `tone` adds a thin coloured edge along the top. */
export function Card({ as: Tag = 'div', tone = 'default', interactive, className, ...rest }: CardProps) {
  return (
    <Tag
      className={cn(
        'relative overflow-hidden rounded-card border border-border bg-surface p-6 shadow-soft',
        tone !== 'default' && 'before:absolute before:inset-x-6 before:top-0 before:h-[3px] before:rounded-b-full',
        tones[tone],
        interactive && 'transition duration-300 hover:-translate-y-0.5 hover:shadow-lift hover:border-border-strong',
        className,
      )}
      {...rest}
    />
  );
}

export function CardTitle({ className, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-xl', className)} {...rest} />;
}

export function CardText({ className, ...rest }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('mt-1.5 text-[0.95rem] text-muted', className)} {...rest} />;
}
