import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Sparkles } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { ThemeToggle } from '../components/layout/ThemeToggle';
import { PalettePicker } from '../components/PalettePicker';
import { useProfile } from '../state/ProfileContext';
import { Badge, Button, Card, CardText, CardTitle, Dialog, Input, Textarea, useToast } from '../components/ui';

const palette = [
  { name: 'Warm ivory', hex: '#FFF8F0' },
  { name: 'Dusty rose', hex: '#D99AA6' },
  { name: 'Muted lavender', hex: '#B8A7D9' },
  { name: 'Midnight plum', hex: '#292238' },
  { name: 'Soft sage', hex: '#A9B8A0' },
  { name: 'Warm gold', hex: '#D9B879' },
];

/** Settings placeholder doubling as a living style guide for Phase 1. */
export default function Settings() {
  const [open, setOpen] = useState(false);
  const { notify } = useToast();
  const navigate = useNavigate();
  const { profile, updateTheme, resetSetup } = useProfile();
  const [resetOpen, setResetOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function confirmReset() {
    setBusy(true);
    try {
      await resetSetup();
      navigate('/welcome', { replace: true });
    } catch {
      notify({ tone: 'error', title: 'Couldn’t reset', description: 'Your saved setup could not be cleared. Please try again.' });
      setBusy(false);
    }
  }

  async function pickPalette(id: Parameters<typeof updateTheme>[0]) {
    try {
      await updateTheme(id);
    } catch {
      notify({ tone: 'error', title: 'Couldn’t save your colour', description: 'Please try again.' });
    }
  }

  return (
    <div className="flex flex-col gap-10">
      <PageHeader eyebrow="Settings" title="Make it yours" description="Real settings arrive later. For now, this page shows the building blocks." />

      <Card tone="gold" className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle>Appearance</CardTitle>
            <CardText>Follow your device, or pick a side.</CardText>
          </div>
          <ThemeToggle />
        </div>
        {profile && (
          <PalettePicker name="settings-theme" legend="Colour theme" value={profile.theme} onChange={(t) => void pickPalette(t)} />
        )}
      </Card>

      {profile && (
        <Card>
          <CardTitle>Your setup</CardTitle>
          <CardText>
            {profile.partnerOne.name} &amp; {profile.partnerTwo.name}. Saved on this device only.
          </CardText>
          <Button variant="secondary" className="mt-5" onClick={() => setResetOpen(true)}>
            Reset setup
          </Button>
        </Card>
      )}

      <section aria-labelledby="ds-palette" className="flex flex-col gap-4">
        <h2 id="ds-palette" className="text-2xl">Palette</h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {palette.map((c) => (
            <li key={c.hex} className="overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
              <div className="h-16 border-b border-border" style={{ background: c.hex }} />
              <div className="p-3">
                <p className="text-sm font-semibold">{c.name}</p>
                <p className="font-mono text-xs text-muted">{c.hex}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="ds-controls" className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 id="ds-controls" className="text-2xl">Buttons &amp; badges</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button leftIcon={<Heart size={16} />}>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button size="sm">Small</Button>
            <Button disabled>Disabled</Button>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Badge tone="rose">Rose</Badge>
            <Badge tone="lavender">Lavender</Badge>
            <Badge tone="sage">Sage</Badge>
            <Badge tone="gold"><Sparkles size={12} /> Gold</Badge>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => setOpen(true)}>Open dialog</Button>
            <Button
              variant="secondary"
              onClick={() => notify({ tone: 'success', title: 'Saved to your universe', description: 'This is a sample notification.' })}
            >
              Show notification
            </Button>
          </div>
        </Card>

        <Card>
          <h2 className="text-2xl">Form fields</h2>
          <form className="mt-5 flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
            <Input label="Nickname" placeholder="What do you call each other?" hint="Shown on your home page." />
            <Input label="Anniversary" type="date" error="Pick a date to continue." />
            <Textarea label="A note" placeholder="Write something small…" rows={3} />
          </form>
        </Card>
      </section>

      <Dialog
        open={resetOpen}
        onClose={() => !busy && setResetOpen(false)}
        title="Reset your setup?"
        description="This clears your names, dates and colour from this device and takes you back to the beginning. Memories and other saved things stay."
        footer={
          <>
            <Button variant="ghost" onClick={() => setResetOpen(false)} disabled={busy}>Keep it</Button>
            <Button variant="danger" loading={busy} onClick={() => void confirmReset()}>Reset setup</Button>
          </>
        }
      />

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="A gentle dialog"
        description="Used for confirmations and quick forms."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Not now</Button>
            <Button onClick={() => setOpen(false)}>Sounds good</Button>
          </>
        }
      >
        <p className="text-muted">Dialogs trap focus, close on Esc, and respond to a tap on the backdrop.</p>
      </Dialog>
    </div>
  );
}
