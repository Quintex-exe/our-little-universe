import { Check } from 'lucide-react';
import { cn } from '../lib/cn';
import { PALETTES } from '../theme/palettes';
import type { ThemeId } from '../types/profile';

/** Native radio group: arrow keys, Tab and screen readers work without extra code. */
export function PalettePicker({
  name,
  value,
  onChange,
  legend,
}: {
  name: string;
  value: ThemeId;
  onChange: (id: ThemeId) => void;
  legend: string;
}) {
  return (
    <fieldset>
      <legend className="sr-only">{legend}</legend>
      <div className="grid grid-cols-2 gap-3">
        {PALETTES.map((p) => {
          const checked = p.id === value;
          return (
            <label
              key={p.id}
              className={cn(
                'relative flex cursor-pointer flex-col gap-3 rounded-2xl border bg-surface p-4 transition',
                'has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring',
                checked ? 'border-text shadow-soft' : 'border-border hover:border-border-strong',
              )}
            >
              <input
                type="radio"
                name={name}
                value={p.id}
                checked={checked}
                onChange={() => onChange(p.id)}
                className="sr-only"
              />
              <span className="flex items-center">
                <span className="size-8 rounded-full border border-black/5" style={{ background: p.swatch[0] }} />
                <span className="-ml-2.5 size-8 rounded-full border-2 border-surface" style={{ background: p.swatch[1] }} />
                {checked && (
                  <span className="ml-auto grid size-6 place-items-center rounded-full bg-text text-bg">
                    <Check size={14} strokeWidth={3} />
                  </span>
                )}
              </span>
              <span>
                <span className="block text-sm font-semibold">{p.label}</span>
                <span className="block text-xs text-muted">{p.blurb}</span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
