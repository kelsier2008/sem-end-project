import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface Props {
  icon: LucideIcon;
  title: string;
  message: string;
  action?: ReactNode;
  compact?: boolean;
}

export default function EmptyState({ icon: Icon, title, message, action, compact }: Props) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong bg-surface/60 text-center ${
        compact ? 'px-5 py-8' : 'px-6 py-16'
      }`}
    >
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-accent-soft text-accent-text">
        <Icon className="h-6 w-6" aria-hidden />
      </div>
      <h3 className="mt-4 text-base font-semibold text-ink">{title}</h3>
      <p className="mt-1 max-w-sm text-sm leading-relaxed text-ink-muted">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
