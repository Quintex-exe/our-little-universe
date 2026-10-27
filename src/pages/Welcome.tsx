import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { BrandMark } from '../components/layout/BrandMark';
import { ThemeToggle } from '../components/layout/ThemeToggle';
import { Button } from '../components/ui';

const stars = [
  { top: '12%', left: '14%', size: 6, delay: '0s', color: 'bg-gold' },
  { top: '22%', left: '82%', size: 8, delay: '0.8s', color: 'bg-lavender' },
  { top: '68%', left: '9%', size: 5, delay: '1.4s', color: 'bg-rose' },
  { top: '78%', left: '88%', size: 6, delay: '0.4s', color: 'bg-gold' },
  { top: '40%', left: '92%', size: 4, delay: '2s', color: 'bg-sage' },
  { top: '8%', left: '56%', size: 4, delay: '1.1s', color: 'bg-rose' },
];

export default function Welcome() {
  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden px-6 py-16">
      <div className="absolute right-4 top-4 sm:right-8 sm:top-8">
        <ThemeToggle />
      </div>

      {stars.map((s, i) => (
        <span
          key={i}
          aria-hidden
          className={`absolute rounded-full ${s.color} animate-[twinkle_4s_ease-in-out_infinite]`}
          style={{ top: s.top, left: s.left, width: s.size, height: s.size, animationDelay: s.delay }}
        />
      ))}

      <div className="page-enter relative flex max-w-2xl flex-col items-center text-center">
        <div className="relative mb-8 grid size-36 place-items-center rounded-full border border-border bg-surface/70 shadow-lift sm:size-44">
          <div className="absolute inset-3 rounded-full border border-dashed border-border-strong" />
          <BrandMark className="size-20 sm:size-24" />
        </div>
        <p className="eyebrow mb-4">A place for two</p>
        <h1 className="text-5xl sm:text-7xl">Our Little Universe</h1>
        <p className="mt-5 max-w-md text-lg text-muted sm:text-xl">
          A quiet corner of the sky, made for the two of you. Plant things, keep things, and wander back anytime.
        </p>
        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
          <Link to="/dashboard">
            <Button size="lg" rightIcon={<ArrowRight size={18} />}>
              Step inside
            </Button>
          </Link>
          <Link to="/settings">
            <Button size="lg" variant="ghost">
              Preview the design
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
