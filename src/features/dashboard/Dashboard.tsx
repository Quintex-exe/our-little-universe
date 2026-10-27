import { useState } from 'react';
import { Starfield } from '../../components/Starfield';
import { ThemePicker } from '../../components/ThemePicker';
import { daysTogether, formatLongDate } from '../../lib/dates';
import { useProfile } from '../../state/ProfileContext';
import { ResetDialog } from './ResetDialog';
import './dashboard.css';

export function Dashboard() {
  const { profile, updateTheme, resetSetup } = useProfile();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!profile) return null;
  const { partnerOne, partnerTwo, anniversary, dedication, theme } = profile;
  const days = anniversary ? daysTogether(anniversary) : null;
  const greetOne = partnerOne.nickname ?? partnerOne.name;
  const greetTwo = partnerTwo.nickname ?? partnerTwo.name;

  async function confirmReset() {
    setBusy(true);
    setError(null);
    try {
      await resetSetup();
    } catch {
      setError('We couldn’t clear your saved setup. Please try again.');
      setBusy(false);
    }
  }

  return (
    <main className="dash">
      <div className="dash__bg" aria-hidden="true" />
      <Starfield density={0.7} />

      <div className="dash__inner">
        <header className="dash__header">
          <p className="dash__eyebrow">Our Little Universe</p>
          <h1 className="dash__title">
            Welcome back, {greetOne} &amp; {greetTwo}
          </h1>
          <p className="dash__sub">
            {partnerOne.name} &amp; {partnerTwo.name}
          </p>
        </header>

        <div className="dash__grid">
          {anniversary && (
            <section className="card" aria-labelledby="card-time">
              <h2 id="card-time" className="card__label">
                Together since {formatLongDate(anniversary)}
              </h2>
              <p className="card__big" data-testid="days-together">
                {days === null ? '—' : days === 0 ? 'Day one' : `${days.toLocaleString()} days`}
              </p>
            </section>
          )}

          {dedication && (
            <section className="card card--wide" aria-labelledby="card-note">
              <h2 id="card-note" className="card__label">
                Our dedication
              </h2>
              <blockquote className="card__quote">{dedication}</blockquote>
            </section>
          )}

          <section className="card card--wide" aria-labelledby="card-theme">
            <h2 id="card-theme" className="card__label">
              Colour theme
            </h2>
            <ThemePicker name="dashboard-theme" value={theme} onChange={(t) => void updateTheme(t)} />
          </section>
        </div>

        <footer className="dash__footer">
          <p>Saved on this device only. More of your universe is on its way.</p>
          <button type="button" className="btn btn--ghost" onClick={() => setConfirming(true)}>
            Reset setup
          </button>
        </footer>
      </div>

      <ResetDialog
        open={confirming}
        busy={busy}
        error={error}
        onCancel={() => {
          if (!busy) {
            setConfirming(false);
            setError(null);
          }
        }}
        onConfirm={() => void confirmReset()}
      />
    </main>
  );
}
