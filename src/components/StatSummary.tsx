import { ArrowUpRight, BellDot, CalendarClock, Inbox, Star, type LucideIcon } from 'lucide-react';
import type { Stats } from '../filters';
import { href, type Route } from '../router';
import { calendarDaysUntil, plural } from '../utils';

interface SummaryCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  hint: string;
  to: Route;
  tint: string;
}

export function SummaryCard({ icon: Icon, label, value, hint, to, tint }: SummaryCardProps) {
  return (
    <a
      href={href(to)}
      className="group flex flex-col rounded-2xl border border-line bg-surface p-4 shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift sm:p-5 dark:hover:border-brand-500/40"
    >
      <div className="flex items-center justify-between">
        <span className={`grid h-9 w-9 place-items-center rounded-xl ${tint}`}>
          <Icon className="h-[18px] w-[18px]" aria-hidden />
        </span>
        <ArrowUpRight className="h-4 w-4 text-ink-muted opacity-0 transition duration-150 group-hover:opacity-100" aria-hidden />
      </div>
      <p className="mt-4 text-[28px] font-bold leading-none tabular-nums tracking-tight text-ink">{value}</p>
      <p className="mt-1.5 text-sm font-medium text-ink">{label}</p>
      <p className="mt-0.5 truncate text-xs text-ink-muted">{hint}</p>
    </a>
  );
}

export default function StatSummary({ stats, now }: { stats: Stats; now: Date }) {
  const next = stats.nextDeadline;
  const nextHint = !next
    ? 'Nothing due right now'
    : calendarDaysUntil(next.deadline!, now) === 0
      ? 'Next one is due today'
      : `Next in ${plural(calendarDaysUntil(next.deadline!, now), 'day')}`;

  return (
    <section aria-label="Summary" className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      <SummaryCard
        icon={Inbox}
        label="Total notices"
        value={stats.total}
        hint={stats.userCreated ? `${stats.userCreated} added by you` : 'Across all departments'}
        to="notices"
        tint="bg-accent-soft text-accent-text"
      />
      <SummaryCard
        icon={BellDot}
        label="Unread notices"
        value={stats.unread}
        hint={stats.unread ? 'Waiting for you' : 'You’re all caught up'}
        to="unread"
        tint="bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
      />
      <SummaryCard
        icon={Star}
        label="Important"
        value={stats.important}
        hint="Starred by you"
        to="important"
        tint="bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
      />
      <SummaryCard
        icon={CalendarClock}
        label="Upcoming deadlines"
        value={stats.upcoming}
        hint={nextHint}
        to="deadlines"
        tint="bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
      />
    </section>
  );
}
