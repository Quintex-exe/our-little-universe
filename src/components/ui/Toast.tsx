import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '../../lib/cn';

export type ToastTone = 'info' | 'success' | 'error';

export interface ToastInput {
  title: string;
  description?: string;
  tone?: ToastTone;
  /** Milliseconds before auto-dismiss. Default 4500. */
  duration?: number;
}

interface ToastItem extends ToastInput {
  id: number;
}

interface ToastApi {
  notify: (toast: ToastInput) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const toneStyle: Record<ToastTone, { icon: typeof Info; color: string }> = {
  info: { icon: Info, color: 'text-accent' },
  success: { icon: CheckCircle2, color: 'text-success' },
  error: { icon: AlertCircle, color: 'text-danger' },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setItems((l) => l.filter((t) => t.id !== id)), []);

  const notify = useCallback(
    (toast: ToastInput) => {
      const id = nextId.current++;
      setItems((l) => [...l.slice(-3), { ...toast, id }]);
      window.setTimeout(() => dismiss(id), toast.duration ?? 4500);
    },
    [dismiss],
  );

  const api = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-6 lg:items-end lg:px-6"
      >
        {items.map((t) => {
          const { icon: Icon, color } = toneStyle[t.tone ?? 'info'];
          return (
            <div
              key={t.id}
              role="status"
              className="pointer-events-auto flex w-full max-w-sm animate-[toast-in_0.3s_ease-out] items-start gap-3 rounded-2xl border border-border bg-surface p-4 shadow-lift"
            >
              <Icon size={20} className={cn('mt-0.5 shrink-0', color)} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold leading-snug">{t.title}</p>
                {t.description && <p className="mt-0.5 text-sm text-muted">{t.description}</p>}
              </div>
              <button
                type="button"
                aria-label="Dismiss"
                onClick={() => dismiss(t.id)}
                className="-m-1 grid size-7 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-text"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
