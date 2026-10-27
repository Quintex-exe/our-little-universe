import { forwardRef, useId, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
}

const control =
  'w-full rounded-control border bg-surface px-4 text-text placeholder:text-muted/70 transition ' +
  'focus:border-ring focus:outline-none focus:ring-4 focus:ring-ring/20 disabled:opacity-60';

function Shell({
  id,
  label,
  hint,
  error,
  children,
}: FieldProps & { id: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-msg`} role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-msg`} className="text-sm text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & FieldProps>(
  function Input({ label, hint, error, className, id, ...rest }, ref) {
    const auto = useId();
    const fid = id ?? auto;
    return (
      <Shell id={fid} label={label} hint={hint} error={error}>
        <input
          ref={ref}
          id={fid}
          aria-invalid={!!error || undefined}
          aria-describedby={error || hint ? `${fid}-msg` : undefined}
          className={cn(control, 'h-11', error ? 'border-danger' : 'border-border-strong', className)}
          {...rest}
        />
      </Shell>
    );
  },
);

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps>(
  function Textarea({ label, hint, error, className, id, rows = 4, ...rest }, ref) {
    const auto = useId();
    const fid = id ?? auto;
    return (
      <Shell id={fid} label={label} hint={hint} error={error}>
        <textarea
          ref={ref}
          id={fid}
          rows={rows}
          aria-invalid={!!error || undefined}
          aria-describedby={error || hint ? `${fid}-msg` : undefined}
          className={cn(control, 'resize-y py-3', error ? 'border-danger' : 'border-border-strong', className)}
          {...rest}
        />
      </Shell>
    );
  },
);
