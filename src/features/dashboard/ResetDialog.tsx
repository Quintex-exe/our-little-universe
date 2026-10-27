import { useEffect, useRef } from 'react';

export function ResetDialog({
  open,
  busy,
  error,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  busy: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="dialog"
      aria-labelledby="reset-title"
      aria-describedby="reset-desc"
      onClose={onCancel}
      onClick={(e) => e.target === ref.current && !busy && onCancel()}
    >
      <h2 id="reset-title" className="dialog__title">
        Reset your setup?
      </h2>
      <p id="reset-desc" className="dialog__text">
        This clears the names, dates and dedication saved on this device. You’ll start again from the welcome page.
      </p>
      {error && (
        <p role="alert" className="field__error">
          {error}
        </p>
      )}
      <div className="dialog__actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={busy} autoFocus>
          Keep my setup
        </button>
        <button type="button" className="btn btn--danger" onClick={onConfirm} disabled={busy}>
          {busy ? 'Resetting…' : 'Reset setup'}
        </button>
      </div>
    </dialog>
  );
}
