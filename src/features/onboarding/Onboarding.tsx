import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Starfield } from '../../components/Starfield';
import { TextAreaField, TextField } from '../../components/Field';
import { ThemePicker } from '../../components/ThemePicker';
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
import { applyTheme } from '../../theme/applyTheme';
import { EMPTY_DRAFT, type OnboardingDraft } from '../../types/profile';
import { STEPS } from './steps';
import './onboarding.css';

export function Onboarding({ onExit }: { onExit: () => void }) {
  const { completeOnboarding } = useProfile();
  const [draft, setDraft] = useState<OnboardingDraft>(EMPTY_DRAFT);
  const [index, setIndex] = useState(0);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const step = STEPS[index];
  const isLast = index === STEPS.length - 1;

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [index]);

  useEffect(() => {
    applyTheme(draft.theme);
  }, [draft.theme]);

  function setField<K extends keyof OnboardingDraft>(key: K, value: OnboardingDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
    if (errors[key]) setErrors(({ [key]: _removed, ...rest }) => rest);
  }

  /** Validate on blur only when the field has content, so Back/Skip clicks never shift layout. */
  function blurCheck(key: keyof OnboardingDraft) {
    const value = String(draft[key]).trim();
    if (!value) return;
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
    if (index === 0) onExit();
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
    <main className="onb">
      <div className="onb__bg" aria-hidden="true" />
      <Starfield density={0.7} />

      <section className="onb__card" aria-labelledby="onb-title">
        <header className="onb__header">
          <p className="onb__progress-text">
            Step {index + 1} of {STEPS.length}
          </p>
          <ol className="onb__dots" aria-label="Progress">
            {STEPS.map((s, i) => (
              <li
                key={s.id}
                className={`onb__dot${i === index ? ' is-current' : i < index ? ' is-done' : ''}`}
                aria-current={i === index ? 'step' : undefined}
              >
                <span className="sr-only">{s.title}</span>
              </li>
            ))}
          </ol>
        </header>

        <form ref={formRef} onSubmit={onSubmit} noValidate className="onb__form" key={step.id}>
          <h1 id="onb-title" ref={headingRef} tabIndex={-1} className="onb__title">
            {step.title}
          </h1>
          <p className="onb__hint">{step.hint}</p>

          {step.id === 'names' && (
            <div className="onb__fields">
              <TextField
                id="partnerOneName"
                label="Partner one"
                value={draft.partnerOneName}
                error={errors.partnerOneName}
                maxLength={LIMITS.name + 10}
                autoComplete="off"
                onChange={(e) => setField('partnerOneName', e.target.value)}
                onBlur={() => blurCheck('partnerOneName')}
              />
              <TextField
                id="partnerTwoName"
                label="Partner two"
                value={draft.partnerTwoName}
                error={errors.partnerTwoName}
                maxLength={LIMITS.name + 10}
                autoComplete="off"
                onChange={(e) => setField('partnerTwoName', e.target.value)}
                onBlur={() => blurCheck('partnerTwoName')}
              />
            </div>
          )}

          {step.id === 'nicknames' && (
            <div className="onb__fields">
              <TextField
                id="partnerOneNickname"
                label={`Nickname for ${draft.partnerOneName.trim() || 'partner one'}`}
                optional
                value={draft.partnerOneNickname}
                error={errors.partnerOneNickname}
                maxLength={LIMITS.nickname + 10}
                autoComplete="off"
                onChange={(e) => setField('partnerOneNickname', e.target.value)}
                onBlur={() => blurCheck('partnerOneNickname')}
              />
              <TextField
                id="partnerTwoNickname"
                label={`Nickname for ${draft.partnerTwoName.trim() || 'partner two'}`}
                optional
                value={draft.partnerTwoNickname}
                error={errors.partnerTwoNickname}
                maxLength={LIMITS.nickname + 10}
                autoComplete="off"
                onChange={(e) => setField('partnerTwoNickname', e.target.value)}
                onBlur={() => blurCheck('partnerTwoNickname')}
              />
            </div>
          )}

          {step.id === 'story' && (
            <div className="onb__fields">
              <TextField
                id="anniversary"
                type="date"
                label="Anniversary"
                optional
                hint="The day your story began."
                min={MIN_ANNIVERSARY}
                max={today}
                value={draft.anniversary}
                error={errors.anniversary}
                onChange={(e) => setField('anniversary', e.target.value)}
                onBlur={() => blurCheck('anniversary')}
              />
              <TextAreaField
                id="dedication"
                label="A short dedication"
                optional
                hint="A line or two, just for the two of you."
                rows={4}
                value={draft.dedication}
                error={errors.dedication}
                counter={`${draft.dedication.length} / ${LIMITS.dedication}`}
                onChange={(e) => setField('dedication', e.target.value)}
                onBlur={() => blurCheck('dedication')}
              />
            </div>
          )}

          {step.id === 'theme' && (
            <div className="onb__fields">
              <ThemePicker value={draft.theme} onChange={(t) => setField('theme', t)} />
            </div>
          )}

          {saveError && (
            <p role="alert" className="field__error onb__save-error">
              {saveError}
            </p>
          )}

          <div className="onb__actions">
            <button type="button" className="btn btn--ghost" onClick={back} disabled={saving}>
              Back
            </button>
            <div className="onb__actions-end">
              {step.optional && (
                <button type="button" className="btn btn--ghost" onClick={skip} disabled={saving}>
                  Skip
                </button>
              )}
              <button type="submit" className="btn btn--primary" disabled={saving} aria-busy={saving || undefined}>
                {isLast ? (saving ? 'Saving…' : 'Finish') : 'Next'}
              </button>
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}
