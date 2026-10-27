import { cn } from '../lib/cn';

interface Star {
  x: number;
  y: number;
  size: number;
  delay: number;
  dur: number;
  tone: string;
}

/** Deterministic PRNG so the sky is identical on every render and visit. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeStars(count: number, seed: number, tones: string[]): Star[] {
  const rand = mulberry32(seed);
  return Array.from({ length: count }, () => ({
    x: rand() * 100,
    y: rand() * 100,
    size: 1 + rand() * 2.2,
    delay: rand() * 6,
    dur: 3 + rand() * 4,
    tone: tones[Math.floor(rand() * tones.length)],
  }));
}

const NIGHT = makeStars(72, 7, ['bg-ivory', 'bg-ivory', 'bg-gold', 'bg-lavender', 'bg-rose']);
const SOFT = makeStars(26, 21, ['bg-gold', 'bg-lavender', 'bg-rose', 'bg-sage']);

function Stars({ stars, className }: { stars: Star[]; className?: string }) {
  return (
    <>
      {stars.map((s, i) => (
        <span
          key={i}
          className={cn('absolute rounded-full animate-[twinkle_var(--dur)_ease-in-out_infinite]', s.tone, className)}
          style={
            {
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.size,
              height: s.size,
              animationDelay: `${s.delay}s`,
              '--dur': `${s.dur}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </>
  );
}

/**
 * Decorative sky. `night` is a full plum night scene (always dark, whatever the theme);
 * `soft` is a light scattering of stars that sits on the normal page background.
 */
export function Sky({ variant = 'soft' }: { variant?: 'night' | 'soft' }) {
  if (variant === 'soft') {
    return (
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden opacity-60">
        <Stars stars={SOFT} />
      </div>
    );
  }
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #17111f 0%, #292238 52%, #43304f 100%)' }}
    >
      {/* horizon glow */}
      <div
        className="absolute inset-x-0 bottom-0 h-3/5"
        style={{ background: 'radial-gradient(80% 90% at 50% 110%, rgb(217 154 166 / 0.45), transparent 70%)' }}
      />
      <div
        className="absolute -right-24 -top-24 size-[28rem] rounded-full"
        style={{ background: 'radial-gradient(circle, rgb(184 167 217 / 0.28), transparent 65%)' }}
      />

      <Stars stars={NIGHT} />

      {/* orbit rings */}
      <svg className="absolute left-1/2 top-[44%] w-[150vmax] -translate-x-1/2 -translate-y-1/2 text-ivory/10" viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="18" stroke="currentColor" strokeWidth="0.06" strokeDasharray="0.4 0.8" />
        <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="0.06" />
        <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="0.06" strokeDasharray="0.4 0.8" />
      </svg>

      {/* crescent moon */}
      <svg className="drift absolute right-[8%] top-[9%] w-16 sm:w-24" style={{ '--d': '1s' } as React.CSSProperties} viewBox="0 0 64 64">
        <defs>
          <mask id="moon-cut">
            <rect width="64" height="64" fill="#fff" />
            <circle cx="42" cy="26" r="22" fill="#000" />
          </mask>
        </defs>
        <circle cx="30" cy="34" r="22" fill="#F1E3C4" mask="url(#moon-cut)" />
      </svg>

      {/* planets */}
      <div
        className="drift absolute -bottom-32 -left-20 size-52 rounded-full sm:-bottom-28 sm:left-[6%] sm:size-80"
        style={{ background: 'radial-gradient(circle at 32% 28%, #f0c4cc, #d99aa6 45%, #8a5a72 100%)', '--d': '0s' } as React.CSSProperties}
      />
      <div
        className="drift absolute bottom-[16%] right-[7%] size-12 rounded-full sm:right-[14%] sm:size-16"
        style={{ background: 'radial-gradient(circle at 32% 28%, #dcd2f0, #b8a7d9 55%, #6d5c9c 100%)', '--d': '2.5s' } as React.CSSProperties}
      >
        <span className="absolute left-1/2 top-1/2 h-[28%] w-[190%] -translate-x-1/2 -translate-y-1/2 -rotate-[18deg] rounded-full border border-gold/60" />
      </div>
    </div>
  );
}
