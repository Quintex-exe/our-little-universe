import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { profileService as defaultService, type ProfileService } from '../services/profile';
import { applyPalette } from '../theme/palettes';
import { DEFAULT_THEME, type OnboardingDraft, type Profile, type ThemeId } from '../types/profile';

type Status = 'loading' | 'ready' | 'failed';

interface ProfileContextValue {
  status: Status;
  profile: Profile | null;
  completeOnboarding(draft: OnboardingDraft): Promise<void>;
  updateTheme(theme: ThemeId): Promise<void>;
  resetSetup(): Promise<void>;
  /** Temporarily shows a palette (e.g. while choosing in onboarding). Pass null to stop previewing. */
  previewTheme(theme: ThemeId | null): void;
  retry(): void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({
  children,
  service = defaultService,
}: {
  children: ReactNode;
  service?: ProfileService;
}) {
  const [status, setStatus] = useState<Status>('loading');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [preview, setPreview] = useState<ThemeId | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    service
      .getProfile()
      .then((p) => {
        if (cancelled) return;
        setProfile(p);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('failed');
      });
    return () => {
      cancelled = true;
    };
  }, [service, attempt]);

  // Single place that decides which palette is on screen.
  useEffect(() => {
    applyPalette(preview ?? profile?.theme ?? DEFAULT_THEME);
  }, [preview, profile]);

  const completeOnboarding = useCallback(
    async (draft: OnboardingDraft) => setProfile(await service.completeOnboarding(draft)),
    [service],
  );
  const updateTheme = useCallback(
    async (theme: ThemeId) => setProfile(await service.updatePreferences({ theme })),
    [service],
  );
  const resetSetup = useCallback(async () => {
    await service.resetSetup();
    setProfile(null);
  }, [service]);
  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  const value = useMemo(
    () => ({ status, profile, completeOnboarding, updateTheme, resetSetup, previewTheme: setPreview, retry }),
    [status, profile, completeOnboarding, updateTheme, resetSetup, retry],
  );
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used inside <ProfileProvider>.');
  return ctx;
}
