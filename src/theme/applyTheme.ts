import type { ThemeId } from '../types/profile';

const META_COLORS: Record<ThemeId, string> = {
  twilight: '#0b0b1f',
  aurora: '#061a1a',
  ember: '#1c0d14',
  moonlight: '#0a1424',
};

/** Single DOM side-effect for theming. */
export function applyTheme(theme: ThemeId): void {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', META_COLORS[theme]);
}
