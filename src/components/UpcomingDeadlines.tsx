import { ArrowRight, CalendarCheck } from 'lucide-react';
import { href } from '../router';
import { useNotices } from '../state/useNotices';
import { useUI } from '../state/ui';
import { card } from '../styles';
import type { Notice } from '../types';
import { deadlineState, formatTime, relativeDeadline } from '../utils';
import EmptyState from './EmptyState';
import { CategoryBadge, UrgentBadge } from './NoticeBadges';

const TILE = {
  overdue: 'border-line bg-raised text-ink-muted',
  today: 'border-brand-500 bg-brand-500 text-white',
  soon: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
  later: 'border-line bg-surface text-ink',
};

const STATUS_TEXT = {
  overdue: 'text-ink-muted',
  today: 'font-semibold text-red-700 dark:text-red-300',
  soon: 'font-semibold text-amber-800 dark:text-amber-300',
  later: 'text-ink-soft',
};

/** A notice shown by its deadline: date tile, title, and how long is left. */
export function DeadlineRow({ notice: n, showBadges = false }: { notice: Notice; showBadges?: boolean }) {
  const { now } = useNotices();
  const { openDetails } = useUI();
  const deadline = new Date(n.deadline!);
  const state = deadlineState(n.deadline!, now);

  return (
    <li>
      <button
        type="button"
        onClick={() => openDetails(n.id)}
        className="flex w-full items-center gap-3.5 rounded-xl p-2.5 text-left transition duration-150 hover:bg-raised"
      >
        <span className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl border ${TILE[state]}`} aria-hidden>
          <span className="text-[10px] font-semibold uppercase leading-none tracking-wider opacity-80">
            {deadline.toLocaleDateString(undefined, { month: 'short' })}
          </span>
          <span className="mt-1 text-lg font-bold leading-none tabular-nums">{deadline.getDate()}</span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className={`truncate text-sm text-ink ${n.isRead ? 'font-medium' : 'font-semibold'}`}>{n.title}</span>
            {showBadges && n.priority === 'High' && <UrgentBadge />}
          </span>
          <span className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-ink-muted">
            <span className={STATUS_TEXT[state]}>{relativeDeadline(n.deadline!, now, n.category)}</span>
            <span aria-hidden>·</span>
            <time dateTime={n.deadline!}>
              <span className="sr-only">{deadline.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}, </span>
              {formatTime(n.deadline!)}
            </time>
            {!showBadges && (
              <>
                <span aria-hidden>·</span>
                <span>{n.category}</span>
              </>
            )}
          </span>
        </span>
        {showBadges && (
          <span className="hidden shrink-0 sm:block">
            <CategoryBadge category={n.category} />
          </span>
        )}
      </button>
    </li>
  );
}

/** Dashboard widget: the next few deadlines. */
export default function UpcomingDeadlines({ notices, total }: { notices: Notice[]; total: number }) {
  return (
    <section aria-labelledby="upcoming-heading" className={`${card} p-2`}>
      <div className="flex items-center justify-between px-3 pb-1 pt-2.5">
        <h2 id="upcoming-heading" className="text-base font-semibold text-ink">
          Upcoming deadlines
        </h2>
        <a
          href={href('deadlines')}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-accent-text transition hover:bg-accent-soft"
        >
          See all{total > notices.length ? ` ${total}` : ''}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </a>
      </div>
      {notices.length ? (
        <ul className="mt-1">
          {notices.map((n) => (
            <DeadlineRow key={n.id} notice={n} />
          ))}
        </ul>
      ) : (
        <div className="p-2">
          <EmptyState compact icon={CalendarCheck} title="Nothing due" message="No upcoming deadlines right now." />
        </div>
      )}
    </section>
  );
}
