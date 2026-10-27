import { Starfield } from './Starfield';

export function LoadingScreen() {
  return (
    <main className="status-screen" aria-busy="true">
      <Starfield density={0.6} />
      <div role="status" className="status-screen__body">
        <span className="status-screen__orbit" aria-hidden="true" />
        <p>Looking at the stars…</p>
      </div>
    </main>
  );
}

export function ErrorScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="status-screen">
      <div role="alert" className="status-screen__body">
        <h1 className="status-screen__title">Something drifted off course</h1>
        <p>We couldn’t open your saved setup.</p>
        <button type="button" className="btn btn--primary" onClick={onRetry}>
          Try again
        </button>
      </div>
    </main>
  );
}
