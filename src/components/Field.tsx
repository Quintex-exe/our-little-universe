import type { ComponentPropsWithoutRef, ReactNode } from 'react';

interface FieldBase {
  id: string;
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
}

function describedBy(id: string, hint?: string, error?: string): string | undefined {
  const ids = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean);
  return ids.length ? ids.join(' ') : undefined;
}

function Shell({ id, label, optional, hint, error, children }: FieldBase & { children: ReactNode }) {
  return (
    <div className="field">
      <label htmlFor={id} className="field__label">
        {label}
        {optional && <span className="field__optional">Optional</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="field__hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextField({
  id,
  label,
  optional,
  hint,
  error,
  ...input
}: FieldBase & Omit<ComponentPropsWithoutRef<'input'>, 'id'>) {
  return (
    <Shell id={id} label={label} optional={optional} hint={hint} error={error}>
      <input
        id={id}
        className="field__control"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint && !error ? hint : undefined, error)}
        {...input}
      />
    </Shell>
  );
}

export function TextAreaField({
  id,
  label,
  optional,
  hint,
  error,
  counter,
  ...input
}: FieldBase & { counter?: string } & Omit<ComponentPropsWithoutRef<'textarea'>, 'id'>) {
  return (
    <Shell id={id} label={label} optional={optional} hint={hint} error={error}>
      <textarea
        id={id}
        className="field__control field__control--area"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint && !error ? hint : undefined, error)}
        {...input}
      />
      {counter && (
        <p className="field__counter" aria-hidden="true">
          {counter}
        </p>
      )}
    </Shell>
  );
}
