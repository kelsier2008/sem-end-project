import { useMemo, useState } from 'react';
import { CalendarCheck, ChevronDown, SearchX } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import PageHeader from '../components/PageHeader';
import { DeadlineRow } from '../components/UpcomingDeadlines';
import { isOverdue, matchesSearch, upcomingDeadlines } from '../filters';
import { useNotices } from '../state/useNotices';
import { useUI } from '../state/ui';
import { btn, card } from '../styles';
import { CATEGORIES, type Category, type Notice } from '../types';
import { calendarDaysUntil, plural } from '../utils';

function Group({ title, notices, tone }: { title: string; notices: Notice[]; tone?: 'today' }) {
  if (!notices.length) return null;
  const id = `group-${title.toLowerCase().replace(/\W+/g, '-')}`;
  return (
    <section aria-labelledby={id} className={`${card} p-2 ${tone === 'today' ? 'border-brand-200 dark:border-brand-500/40' : ''}`}>
      <h2 id={id} className="flex items-center gap-2 px-3 pb-1 pt-2.5 text-sm font-semibold text-ink">
        {tone === 'today' && <span className="h-2 w-2 rounded-full bg-brand-500" aria-hidden />}
        {title}
        <span className="rounded-full bg-raised px-2 py-0.5 text-xs font-semibold tabular-nums text-ink-muted">{notices.length}</span>
      </h2>
      <ul className="mt-1">
        {notices.map((n) => (
          <DeadlineRow key={n.id} notice={n} showBadges />
        ))}
      </ul>
    </section>
  );
}

export default function DeadlinesPage() {
  const { notices, now } = useNotices();
  const { search, setSearch } = useUI();
  const [category, setCategory] = useState<Category | 'All'>('All');
  const [showOverdue, setShowOverdue] = useState(false);

  const scoped = useMemo(
    () => notices.filter((n) => n.deadline && (category === 'All' || n.category === category) && matchesSearch(n, search)),
    [notices, category, search],
  );
  const upcoming = useMemo(() => upcomingDeadlines(scoped, now), [scoped, now]);
  const overdue = useMemo(
    () => scoped.filter((n) => isOverdue(n, now)).sort((a, b) => Date.parse(b.deadline!) - Date.parse(a.deadline!)),
    [scoped, now],
  );

  const days = (n: Notice) => calendarDaysUntil(n.deadline!, now);
  const today = upcoming.filter((n) => days(n) === 0);
  const week = upcoming.filter((n) => days(n) >= 1 && days(n) <= 7);
  const later = upcoming.filter((n) => days(n) > 7);
  const narrowed = category !== 'All' || search.trim() !== '';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Upcoming deadlines"
        subtitle={
          upcoming.length
            ? `${plural(upcoming.length, 'upcoming deadline')}${today.length ? ` · ${today.length} due today` : ''}, nearest first.`
            : 'Deadlines and event dates from your notices, nearest first.'
        }
      />

      <div role="group" aria-label="Category" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        {(['All', ...CATEGORIES] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            aria-pressed={category === c}
            className={`h-9 shrink-0 rounded-full border px-3.5 text-sm font-medium transition duration-150 ${
              category === c
                ? 'border-deep bg-deep text-white dark:border-brand-400 dark:bg-brand-500'
                : 'border-line bg-surface text-ink-soft hover:border-line-strong hover:text-ink'
            }`}
          >
            {c === 'All' ? 'All categories' : c}
          </button>
        ))}
      </div>

      {upcoming.length ? (
        <div className="space-y-4">
          <Group title="Due today" notices={today} tone="today" />
          <Group title="Next 7 days" notices={week} />
          <Group title="Later" notices={later} />
        </div>
      ) : narrowed ? (
        <EmptyState
          icon={SearchX}
          title="No deadlines match"
          message="Try another category or search term."
          action={
            <button
              type="button"
              onClick={() => {
                setCategory('All');
                setSearch('');
              }}
              className={btn.secondary}
            >
              Clear filters
            </button>
          }
        />
      ) : (
        <EmptyState icon={CalendarCheck} title="No upcoming deadlines" message="Nothing is due right now. Enjoy the breather." />
      )}

      {overdue.length > 0 && (
        <section className={`${card} p-2`}>
          <h2>
            <button
              type="button"
              onClick={() => setShowOverdue((s) => !s)}
              aria-expanded={showOverdue}
              aria-controls="overdue-list"
              className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-ink transition hover:bg-raised"
            >
              <span className="flex items-center gap-2">
                Past deadlines
                <span className="rounded-full bg-raised px-2 py-0.5 text-xs font-semibold tabular-nums text-ink-muted">{overdue.length}</span>
              </span>
              <ChevronDown className={`h-4 w-4 text-ink-muted transition-transform duration-200 ${showOverdue ? 'rotate-180' : ''}`} aria-hidden />
            </button>
          </h2>
          {showOverdue && (
            <ul id="overdue-list" className="mt-1">
              {overdue.map((n) => (
                <DeadlineRow key={n.id} notice={n} showBadges />
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
