import { Hourglass } from 'lucide-react';
import { sections } from '../../config/sections';
import { Badge } from '../ui/Badge';
import { Card, CardText, CardTitle } from '../ui/Card';
import { PageHeader } from './PageHeader';

/** Shared stand-in for every section until its feature is built. */
export function PlaceholderPage({ path }: { path: string }) {
  const section = sections.find((s) => s.path === path);
  if (!section) return null;
  const { label, tagline, accent, icon: Icon, preview } = section;

  return (
    <div className="flex flex-col gap-10">
      <PageHeader eyebrow="Coming soon" title={label} description={tagline} />

      <Card tone={accent} className="grid gap-8 p-7 sm:p-9 md:grid-cols-[auto_1fr] md:items-center">
        <div className="grid size-24 place-items-center rounded-[2rem] border border-border bg-surface-2 text-text sm:size-28">
          <Icon size={42} strokeWidth={1.5} />
        </div>
        <div>
          <Badge tone={accent}>
            <Hourglass size={12} /> Still being built
          </Badge>
          <h2 className="mt-3 text-2xl sm:text-3xl">This corner is waiting for you</h2>
          <CardText className="max-w-prose">
            The {label.toLowerCase()} space isn’t open yet. Here is a peek at what will live here.
          </CardText>
        </div>
      </Card>

      {preview.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-3">
          {preview.map((item) => (
            <li key={item}>
              <Card interactive className="h-full p-5">
                <CardTitle className="text-lg">{item}</CardTitle>
                <CardText className="text-sm">Placeholder</CardText>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
