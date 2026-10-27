import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import {
  BucketList,
  Dashboard,
  Dates,
  Games,
  Garden,
  Memories,
  Messages,
  Timeline,
} from './pages/Placeholders';

const Welcome = lazy(() => import('./pages/Welcome'));
const Settings = lazy(() => import('./pages/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));

export default function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<Navigate to="/welcome" replace />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route element={<AppLayout />}>
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
