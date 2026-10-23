import type { ReactNode } from 'react';

export default function PageHeader({ title, subtitle, actions }: { title: string; subtitle: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-[28px]">{title}</h1>
        <p className="mt-1 text-sm text-ink-muted sm:text-[15px]">{subtitle}</p>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
