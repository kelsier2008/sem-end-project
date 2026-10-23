import {
  AlarmClock,
  BookOpenCheck,
  CalendarClock,
  CalendarX,
  ClipboardList,
  Clock,
  PartyPopper,
  Wallet,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type { Category } from '../types';
import { deadlineState, formatDateTime, relativeDeadline, type DeadlineState } from '../utils';

export const CATEGORY_STYLES: Record<Category, string> = {
  Exams: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/25',
  Assignments: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/25',
  Events: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/25',
  Fees: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/25',
};

export const CATEGORY_ICONS: Record<Category, LucideIcon> = {
  Exams: BookOpenCheck,
  Assignments: ClipboardList,
  Events: PartyPopper,
  Fees: Wallet,
};

export function CategoryBadge({ category }: { category: Category }) {
  const Icon = CATEGORY_ICONS[category];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${CATEGORY_STYLES[category]}`}>
      <Icon className="h-3 w-3" aria-hidden />
      {category}
    </span>
  );
}

export function UrgentBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 rounded-md bg-red-600/10 px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-red-700 dark:bg-red-500/15 dark:text-red-300">
      <Zap className="h-3 w-3" fill="currentColor" aria-hidden />
      Urgent
    </span>
  );
}

const DEADLINE_STYLES: Record<DeadlineState, { cls: string; Icon: LucideIcon }> = {
  overdue: { cls: 'bg-raised text-ink-muted', Icon: CalendarX },
  today: { cls: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300', Icon: AlarmClock },
  soon: { cls: 'bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300', Icon: Clock },
  later: { cls: 'bg-raised text-ink-soft', Icon: CalendarClock },
};

export function DeadlineChip({ deadline, category, now }: { deadline: string; category: Category; now: Date }) {
  const { cls, Icon } = DEADLINE_STYLES[deadlineState(deadline, now)];
  return (
    <span className={`inline-flex max-w-full items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium ${cls}`}>
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span className="truncate">
        <span className="font-semibold">{relativeDeadline(deadline, now, category)}</span>
        <span aria-hidden> · </span>
        <time dateTime={deadline}>{formatDateTime(deadline)}</time>
      </span>
    </span>
  );
}
