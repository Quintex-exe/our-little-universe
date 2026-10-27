import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { BrandMark } from '../components/layout/BrandMark';
import { Sky } from '../components/Sky';
import { Button } from '../components/ui';

const d = (s: number) => ({ '--d': `${s}s` }) as React.CSSProperties;

/** Always a night scene, whatever the light/dark setting. */
export default function Welcome() {
  const navigate = useNavigate();
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden px-6 py-20 text-ivory">
      <Sky variant="night" />

      <div className="relative z-10 flex max-w-2xl flex-col items-center text-center">
        <BrandMark className="rise size-14 text-ivory sm:size-16" />
        <p className="eyebrow rise mt-8 !text-ivory/70" style={d(0.15)}>
          A place for two
        </p>
        <h1 className="rise mt-4 text-5xl leading-[1.05] sm:text-7xl" style={d(0.3)}>
          Our Little Universe
        </h1>
        <p className="rise mt-6 max-w-md text-lg text-ivory/80 sm:text-xl" style={d(0.55)}>
          A small, quiet corner of the sky for the two of you. Keep what matters, tend something together, and leave
          notes for each other to find.
        </p>
        <div className="rise mt-10" style={d(0.8)}>
          <Button size="lg" onClick={() => navigate('/onboarding')} rightIcon={<ArrowRight size={18} />}>
            Enter Our Universe
          </Button>
        </div>
        <p className="rise mt-6 text-sm text-ivory/60" style={d(1)}>
          Everything stays on this device.
        </p>
      </div>
    </main>
  );
}
