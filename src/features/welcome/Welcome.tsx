import type { CSSProperties } from 'react';
import { Starfield } from '../../components/Starfield';
import { CelestialArt } from './CelestialArt';
import './welcome.css';

export function Welcome({ onEnter }: { onEnter: () => void }) {
  return (
    <main className="welcome">
      <div className="welcome__bg" aria-hidden="true" />
      <Starfield />
      <CelestialArt />

      <div className="welcome__content">
        <p className="welcome__eyebrow rise" style={{ '--i': 0 } as CSSProperties}>
          A place for two
        </p>
        <h1 className="welcome__title rise" style={{ '--i': 1 } as CSSProperties}>
          Our Little Universe
        </h1>
        <p className="welcome__intro rise" style={{ '--i': 2 } as CSSProperties}>
          A quiet corner of the sky, made for the two of you. Set it up in a minute, then fill it with the moments
          that matter.
        </p>
        <div className="rise" style={{ '--i': 3 } as CSSProperties}>
          <button type="button" className="btn btn--primary btn--lg" onClick={onEnter}>
            Enter Our Universe
          </button>
          <p className="welcome__note">Takes about a minute. Saved only on this device.</p>
        </div>
      </div>
    </main>
  );
}
