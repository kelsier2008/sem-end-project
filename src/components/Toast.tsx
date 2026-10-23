import { useEffect } from 'react';
import { CircleCheck, X } from 'lucide-react';

export interface ToastMessage {
  id: number;
  message: string;
}

/** The live region is always mounted so screen readers announce each new message. */
export default function Toast({ toast, onDismiss }: { toast: ToastMessage | null; onDismiss: () => void }) {
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(onDismiss, 4000);
    return () => window.clearTimeout(timer);
  }, [toast, onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex justify-center px-4 sm:bottom-6"
    >
      {toast && (
        <div
          key={toast.id}
          className="pointer-events-auto flex max-w-md animate-scale-in items-center gap-3 rounded-xl bg-deep py-2.5 pl-4 pr-2 text-sm font-medium text-white shadow-lift dark:bg-raised dark:text-ink"
        >
          <CircleCheck className="h-5 w-5 shrink-0 text-emerald-400" aria-hidden />
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss notification"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white dark:text-ink-muted dark:hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
