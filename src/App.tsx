import { useEffect, useState } from 'react';
import { ErrorScreen, LoadingScreen } from './components/StatusScreens';
import { Dashboard } from './features/dashboard/Dashboard';
import { Onboarding } from './features/onboarding/Onboarding';
import { Welcome } from './features/welcome/Welcome';
import { useProfile } from './state/ProfileContext';

export default function App() {
  const { status, profile, retry } = useProfile();
  const [stage, setStage] = useState<'welcome' | 'onboarding'>('welcome');

  // After onboarding completes or setup is reset, always return to the welcome stage.
  useEffect(() => {
    setStage('welcome');
  }, [profile]);

  if (status === 'loading') return <LoadingScreen />;
  if (status === 'failed') return <ErrorScreen onRetry={retry} />;
  if (profile) return <Dashboard />;
  return stage === 'welcome' ? (
    <Welcome onEnter={() => setStage('onboarding')} />
  ) : (
    <Onboarding onExit={() => setStage('welcome')} />
  );
}
