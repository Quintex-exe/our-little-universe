import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ProfileGate } from './components/layout/RouteGuards';
import { LoadingScreen } from './components/feedback/StatusScreens';
import { BucketList, Dates, Games, Garden, Memories, Messages, Timeline } from './pages/Placeholders';

const Welcome = lazy(() => import('./pages/Welcome'));
const Onboarding = lazy(() => import('./features/onboarding/Onboarding'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));

export default function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<Navigate to="/welcome" replace />} />
        {/* First-time visitors only; returning couples are sent to the dashboard. */}
        <Route path="/welcome" element={<ProfileGate needs="no-profile"><Welcome /></ProfileGate>} />
        <Route path="/onboarding" element={<ProfileGate needs="no-profile"><Onboarding /></ProfileGate>} />
        <Route element={<ProfileGate needs="profile"><AppLayout /></ProfileGate>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/garden" element={<Garden />} />
          <Route path="/memories" element={<Memories />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/dates" element={<Dates />} />
          <Route path="/games" element={<Games />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/bucket-list" element={<BucketList />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
