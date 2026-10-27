import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { ThemeToggle } from '../../components/layout/ThemeToggle';
import { PalettePicker } from '../../components/PalettePicker';
import { Sky } from '../../components/Sky';
import { Button, Card, Input, Textarea } from '../../components/ui';
import { toLocalISODate } from '../../lib/dates';
import {
  LIMITS,
  MIN_ANNIVERSARY,
  STEP_FIELDS,
  hasErrors,
  validateField,
  validateStep,
  type FieldErrors,
} from '../../lib/validation';
import { ProfileValidationError } from '../../services/profile';
import { useProfile } from '../../state/ProfileContext';
import { EMPTY_DRAFT, type OnboardingDraft } from '../../types/profile';
import { STEPS } from './steps';

export default function Onboarding() {
  const navigate = useNavigate();
  const { completeOnboarding, previewTheme } = useProfile();
  const [draft, setDraft] = useState<OnboardingDraft>(EMPTY_DRAFT);
  const [index, setIndex] = useState(0);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const step = STEPS[index];
  const isLast = index === STEPS.length - 1;
  const one = draft.partnerOneName.trim() || 'partner one';
  const two = draft.partnerTwoName.trim() || 'partner two';

  // Move focus to the step heading so screen readers and keyboard users land in the right place.
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [index]);

  useEffect(() => {
    previewTheme(draft.theme);
  }, [draft.theme, previewTheme]);
  useEffect(() => () => previewTheme(null), [previewTheme]);

  function setField<K extends keyof OnboardingDraft>(key: K, value: OnboardingDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
    if (errors[key]) setErrors(({ [key]: _removed, ...rest }) => rest);
  }

  /** Validate on blur only when the field has content, so Back/Skip never shift the layout. */
  function blurCheck(key: keyof OnboardingDraft) {
    if (!String(draft[key]).trim()) return;
    const message = validateField(key, draft);
    if (message) setErrors((e) => ({ ...e, [key]: message }));
  }

  function focusFirstInvalid() {
    requestAnimationFrame(() => {
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    });
  }

  function goTo(next: number) {
    setErrors({});
    setSaveError(null);
    setIndex(next);
  }

  function back() {
    if (saving) return;
    if (index === 0) navigate('/welcome');
    else goTo(index - 1);
  }

  function skip() {
    const cleared = { ...draft };
    for (const f of STEP_FIELDS[step.id]) (cleared as Record<string, unknown>)[f] = EMPTY_DRAFT[f];
    setDraft(cleared);
    goTo(index + 1);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (saving) return;

    const found = validateStep(step.id, draft);
    if (hasErrors(found)) {
      setErrors(found);
      focusFirstInvalid();
      return;
    }
    if (!isLast) {
      goTo(index + 1);
      return;
    }

    const badStep = STEPS.findIndex((s) => hasErrors(validateStep(s.id, draft)));
    if (badStep !== -1) {
      goTo(badStep);
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      await completeOnboarding(draft);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      if (err instanceof ProfileValidationError) {
        const first = STEPS.findIndex((s) => STEP_FIELDS[s.id].some((f) => err.errors[f]));
        if (first !== -1) goTo(first);
      } else {
        setSaveError('We couldn’t save your setup on this device. Please try again.');
      }
      setSaving(false);
    }
  }

  const today = toLocalISODate(new Date());

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-10 sm:px-6">
      <Sky variant="soft" />

      <Card className="page-enter w-full max-w-xl p-6 sm:p-9" aria-labelledby="onb-title">
        <header className="flex items-center justify-between gap-4">
          <p className="eyebrow" aria-live="polite">
            Step {index + 1} of {STEPS.length}
          </p>
          <ol className="flex gap-2" aria-label="Progress">
            {STEPS.map((s, i) => (
              <li
                key={s.id}
                aria-current={i === index ? 'step' : undefined}
                className={
                  'h-1.5 rounded-full transition-all duration-300 ' +
                  (i === index ? 'w-8 bg-primary' : i < index ? 'w-4 bg-primary/60' : 'w-4 bg-border-strong')
                }
              >
                <span className="sr-only">{s.title}</span>
              </li>
            ))}
          </ol>
        </header>

        <form ref={formRef} onSubmit={onSubmit} noValidate className="mt-7">
          <div key={step.id} className="step-enter">
            <h1 id="onb-title" ref={headingRef} tabIndex={-1} className="text-3xl outline-none sm:text-4xl">
              {step.title}
            </h1>
            <p className="mt-2 text-muted">{step.hint}</p>

            <div className="mt-6 flex flex-col gap-5">
              {step.id === 'names' && (
                <>
                  <Input
                    label="Partner one"
                    placeholder="First name"
                    autoComplete="off"
                    value={draft.partnerOneName}
                    error={errors.partnerOneName}
                    onChange={(e) => setField('partnerOneName', e.target.value)}
                    onBlur={() => blurCheck('partnerOneName')}
                  />
                  <Input
                    label="Partner two"
                    placeholder="First name"
                    autoComplete="off"
                    value={draft.partnerTwoName}
                    error={errors.partnerTwoName}
                    onChange={(e) => setField('partnerTwoName', e.target.value)}
                    onBlur={() => blurCheck('partnerTwoName')}
                  />
                </>
              )}

              {step.id === 'nicknames' && (
                <>
                  <Input
                    label={`What does ${one} like to be called? (optional)`}
                    placeholder="Nickname"
                    autoComplete="off"
                    value={draft.partnerOneNickname}
                    error={errors.partnerOneNickname}
                    onChange={(e) => setField('partnerOneNickname', e.target.value)}
                    onBlur={() => blurCheck('partnerOneNickname')}
                  />
                  <Input
                    label={`What does ${two} like to be called? (optional)`}
                    placeholder="Nickname"
                    autoComplete="off"
                    value={draft.partnerTwoNickname}
                    error={errors.partnerTwoNickname}
                    onChange={(e) => setField('partnerTwoNickname', e.target.value)}
                    onBlur={() => blurCheck('partnerTwoNickname')}
                  />
                </>
              )}

              {step.id === 'story' && (
                <>
                  <Input
                    label="Anniversary (optional)"
                    type="date"
                    min={MIN_ANNIVERSARY}
                    max={today}
                    hint="Used to count your days together."
                    value={draft.anniversary}
                    error={errors.anniversary}
                    onChange={(e) => setField('anniversary', e.target.value)}
                    onBlur={() => blurCheck('anniversary')}
                  />
                  <Textarea
                    label="A short dedication (optional)"
                    placeholder="A line just for the two of you"
                    rows={3}
                    value={draft.dedication}
                    error={errors.dedication}
                    hint={`${draft.dedication.trim().length} / ${LIMITS.dedication}`}
                    onChange={(e) => setField('dedication', e.target.value)}
                    onBlur={() => blurCheck('dedication')}
                  />
                </>
              )}

              {step.id === 'theme' && (
                <>
                  <PalettePicker
                    name="onboarding-theme"
                    legend="Colour theme"
                    value={draft.theme}
                    onChange={(t) => setField('theme', t)}
                  />
                  <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface-2 px-4 py-3">
                    <span className="text-sm font-semibold">Light or dark</span>
                    <ThemeToggle />
                  </div>
                  {errors.theme && (
                    <p role="alert" className="text-sm text-danger">
                      {errors.theme}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          {saveError && (
            <p role="alert" className="mt-5 rounded-2xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm">
              {saveError}
            </p>
          )}

          <div className="mt-8 flex items-center gap-3">
            <Button variant="ghost" onClick={back} disabled={saving} leftIcon={<ArrowLeft size={16} />}>
              Back
            </Button>
            <div className="ml-auto flex items-center gap-2">
              {step.optional && (
                <Button variant="ghost" onClick={skip} disabled={saving}>
                  Skip
                </Button>
              )}
              {isLast ? (
                <Button type="submit" loading={saving} leftIcon={<Check size={16} />}>
                  {saving ? 'Saving…' : 'Finish'}
                </Button>
              ) : (
                <Button type="submit" rightIcon={<ArrowRight size={16} />}>
                  Next
                </Button>
              )}
            </div>
          </div>
        </form>
      </Card>
    </main>
  );
}
