import { THEMES } from '../theme/themes';
import type { ThemeId } from '../types/profile';

export function ThemePicker({
  value,
  onChange,
  name = 'theme',
}: {
  value: ThemeId;
  onChange: (theme: ThemeId) => void;
  name?: string;
}) {
  return (
    <fieldset className="themes">
      <legend className="sr-only">Colour theme</legend>
      {THEMES.map((t) => (
        <label key={t.id} className="theme-option">
          <input
            type="radio"
            name={name}
            value={t.id}
            checked={value === t.id}
            onChange={() => onChange(t.id)}
            className="sr-only theme-option__input"
          />
          <span className="theme-option__card">
            <span className="theme-option__swatch" data-theme={t.id} aria-hidden="true" />
            <span className="theme-option__text">
              <span className="theme-option__name">{t.label}</span>
              <span className="theme-option__desc">{t.description}</span>
            </span>
          </span>
        </label>
      ))}
    </fieldset>
  );
}
