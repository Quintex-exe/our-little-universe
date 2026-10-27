import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { ErrorScreen, LoadingScreen } from '../feedback/StatusScreens';
import { useProfile } from '../../state/ProfileContext';

/** Waits for saved data, then shows children only when the setup state matches `needs`. */
export function ProfileGate({ needs, children }: { needs: 'profile' | 'no-profile'; children: ReactNode }) {
  const { status, profile, retry } = useProfile();
  if (status === 'loading') return <LoadingScreen />;
  if (status === 'failed') return <ErrorScreen onRetry={retry} />;
  if (needs === 'profile' && !profile) return <Navigate to="/welcome" replace />;
  if (needs === 'no-profile' && profile) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
