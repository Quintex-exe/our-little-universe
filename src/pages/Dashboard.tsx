import { Link } from 'react-router-dom';
import { Quote } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Badge, Card, CardText, CardTitle } from '../components/ui';
import { sections } from '../config/sections';
import { daysTogether, formatLongDate } from '../lib/dates';
import { useProfile } from '../state/ProfileContext';

export default function Dashboard() {
  const { profile } = useProfile();
  if (!profile) return null;
  const { partnerOne, partnerTwo, anniversary, dedication } = profile;
  const days = anniversary ? daysTogether(anniversary) : null;
  const callOne = partnerOne.nickname ?? partnerOne.name;
  const callTwo = partnerTwo.nickname ?? partnerTwo.name;
  const explore = sections.filter((s) => !['/dashboard', '/settings'].includes(s.path));

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        eyebrow="Welcome back"
        title={`${callOne} & ${callTwo}`}
        description={`${partnerOne.name} and ${partnerTwo.name}, your little universe is right where you left it.`}
      />

      {(anniversary || dedication) && (
        <div className="grid gap-5 md:grid-cols-5">
          {anniversary && (
            <Card tone="rose" className={dedication ? 'md:col-span-2' : 'md:col-span-5'}>
              <p className="eyebrow">Together since {formatLongDate(anniversary)}</p>
              <p className="mt-3 font-serif text-5xl font-semibold" data-testid="days-together">
                {days === null ? '—' : days === 0 ? 'Day one' : days.toLocaleString()}
              </p>
              {days !== null && days > 0 && <CardText>{days === 1 ? 'day' : 'days'} and counting</CardText>}
            </Card>
          )}
          {dedication && (
            <Card tone="lavender" className={anniversary ? 'md:col-span-3' : 'md:col-span-5'}>
              <Quote size={20} className="text-muted" aria-hidden />
              <blockquote className="mt-3 whitespace-pre-line font-serif text-xl leading-snug sm:text-2xl">
                {dedication}
              </blockquote>
            </Card>
          )}
        </div>
      )}

      <section aria-labelledby="explore" className="flex flex-col gap-4">
        <h2 id="explore" className="text-2xl">Around your universe</h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {explore.map(({ path, label, tagline, icon: Icon, accent }) => (
            <li key={path}>
              <Link to={path} className="block h-full rounded-card">
                <Card interactive className="h-full p-5">
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid size-10 place-items-center rounded-full bg-surface-2">
                      <Icon size={19} />
                    </span>
                    <Badge tone={accent}>Soon</Badge>
                  </div>
                  <CardTitle className="mt-4 text-lg">{label}</CardTitle>
                  <CardText className="text-sm">{tagline}</CardText>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
