import { Button } from '../ui';

export function LoadingScreen() {
  return (
    <main className="grid min-h-dvh place-items-center px-6" aria-busy="true">
      <div role="status" className="flex flex-col items-center gap-5 text-center">
        <span className="relative grid size-16 place-items-center" aria-hidden>
          <span className="absolute inset-0 animate-[spin_3s_linear_infinite] rounded-full border border-dashed border-border-strong" />
          <span className="size-3 rounded-full bg-gold" />
          <span className="absolute left-1/2 top-0 size-3 -translate-x-1/2 rounded-full bg-rose" />
        </span>
        <p className="font-serif text-lg text-muted">Looking at the stars…</p>
      </div>
    </main>
  );
}

export function ErrorScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="grid min-h-dvh place-items-center px-6">
      <div role="alert" className="flex max-w-sm flex-col items-center gap-4 text-center">
        <h1 className="text-3xl">Something drifted off course</h1>
        <p className="text-muted">We couldn’t open your saved setup.</p>
        <Button onClick={onRetry}>Try again</Button>
      </div>
    </main>
  );
}
