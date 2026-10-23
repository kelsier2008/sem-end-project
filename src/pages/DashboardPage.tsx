import { useMemo, type ReactNode } from 'react';
import { ArrowRight, CalendarClock, Inbox, Info, PenSquare, Plus, ShieldCheck, X, Zap } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import NoticeCard from '../components/NoticeCard';
import NoticeRow from '../components/NoticeRow';
import StatSummary from '../components/StatSummary';
import UpcomingDeadlines from '../components/UpcomingDeadlines';
import { getStats, isOverdue, sortNotices, upcomingDeadlines } from '../filters';
import { href, type Route } from '../router';
import { useNotices } from '../state/useNotices';
import { useUI } from '../state/ui';
import { btn, btnBase, btnTone, card, iconBtn } from '../styles';
import { useLocalStorage } from '../useLocalStorage';
import { plural } from '../utils';

function SectionHeader({ id, title, icon, link }: { id: string; title: string; icon?: ReactNode; link?: { to: Route; label: string } }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 id={id} className="flex items-center gap-2 text-base font-semibold text-ink">
        {icon}
        {title}
      </h2>
      {link && (
        <a
          href={href(link.to)}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-accent-text transition hover:bg-accent-soft"
        >
          {link.label}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </a>
      )}
    </div>
  );
}

/** Concentric arcs in the hero, echoing the broadcast motif of the logo. */
function BroadcastDecor() {
  return (
    <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="12" aria-hidden className="pointer-events-none absolute -right-6 -top-6 h-60 w-60 text-white/[0.07] sm:h-72 sm:w-72">
      <circle cx="200" cy="0" r="46" />
      <circle cx="200" cy="0" r="86" />
      <circle cx="200" cy="0" r="126" />
      <circle cx="200" cy="0" r="166" />
    </svg>
  );
}

export default function DashboardPage() {
  const { notices, now } = useNotices();
  const { openComposer } = useUI();
  const [hideDemoHint, setHideDemoHint] = useLocalStorage('campusboard:hide-demo-hint', false);

  const stats = useMemo(() => getStats(notices, now), [notices, now]);
  const highPriority = useMemo(
    () => sortNotices(notices.filter((n) => n.priority === 'High' && !isOverdue(n, now)), 'deadline', now).slice(0, 4),
    [notices, now],
  );
  const latest = useMemo(() => sortNotices(notices, 'newest', now).slice(0, 5), [notices, now]);
  const mine = useMemo(() => sortNotices(notices.filter((n) => n.isUserCreated), 'newest', now).slice(0, 4), [notices, now]);
  const upcoming = useMemo(() => upcomingDeadlines(notices, now).slice(0, 5), [notices, now]);
  const hasDemo = notices.some((n) => !n.isUserCreated);

  const today = now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
  const summary =
    stats.unread === 0 && stats.dueSoon === 0
      ? 'You’re all caught up. Nothing is due in the next three days.'
      : `You have ${plural(stats.unread, 'unread notice')} and ${plural(stats.dueSoon, 'deadline')} in the next three days.`;

  return (
    <div className="space-y-6 lg:space-y-8">
      <section aria-labelledby="dashboard-title" className="relative overflow-hidden rounded-2xl bg-deep px-5 py-7 text-white sm:px-8 sm:py-9 dark:border dark:border-line dark:bg-raised">
        <BroadcastDecor />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-brand-200">{today}</p>
            <h1 id="dashboard-title" className="mt-2 text-[26px] font-bold leading-tight tracking-tight sm:text-[34px]">
              Stay updated. Never miss a deadline.
            </h1>
            <p className="mt-2 text-[15px] text-white/75">Your campus announcements, all in one place.</p>
            <p className="mt-5 inline-flex items-start gap-2 rounded-xl bg-white/[0.08] px-3 py-2 text-sm text-white/90">
              <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-brand-200" aria-hidden />
              {summary}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => openComposer()} className={btn.primary}>
              <Plus className="h-[18px] w-[18px]" aria-hidden />
              Add notice
            </button>
            <a
              href={href('deadlines')}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white transition duration-150 hover:bg-white/15"
            >
              View deadlines
            </a>
          </div>
        </div>
      </section>

      <StatSummary stats={stats} now={now} />

      {hasDemo && !hideDemoHint && (
        <div className="flex items-start gap-3 rounded-2xl border border-line bg-surface py-3 pl-4 pr-2 text-sm shadow-card">
          <Info className="mt-0.5 h-[18px] w-[18px] shrink-0 text-accent-text" aria-hidden />
          <p className="flex-1 leading-relaxed text-ink-soft">
            <span className="font-semibold text-ink">You’re viewing sample announcements.</span> They’re fictional examples for this
            prototype. Add your own notices, or restore the samples anytime in{' '}
            <a href={href('settings')} className="font-medium text-accent-text underline-offset-2 hover:underline">
              Settings
            </a>
            .
          </p>
          <button type="button" onClick={() => setHideDemoHint(true)} aria-label="Dismiss sample data message" className={`${iconBtn} -my-1`}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 xl:gap-8">
        <div className="min-w-0 space-y-6 xl:col-span-2 xl:space-y-8">
          <section aria-labelledby="priority-heading">
            <SectionHeader
              id="priority-heading"
              title="High-priority announcements"
              icon={<Zap className="h-4 w-4 text-red-600 dark:text-red-400" fill="currentColor" aria-hidden />}
              link={{ to: 'notices', label: 'All notices' }}
            />
            {highPriority.length ? (
              <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {highPriority.map((n) => (
                  <li key={n.id} className="flex">
                    <NoticeCard notice={n} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState compact icon={ShieldCheck} title="No urgent notices" message="High-priority announcements will show up here." />
            )}
          </section>

          <section aria-labelledby="latest-heading">
            <SectionHeader id="latest-heading" title="Latest notices" link={{ to: 'notices', label: 'View all' }} />
            {latest.length ? (
              <ul className={`${card} p-2`}>
                {latest.map((n) => (
                  <NoticeRow key={n.id} notice={n} />
                ))}
              </ul>
            ) : (
              <EmptyState compact icon={Inbox} title="No notices yet" message="New announcements will appear here as they’re posted." />
            )}
          </section>
        </div>

        <div className="min-w-0 space-y-6 xl:space-y-8">
          <UpcomingDeadlines notices={upcoming} total={stats.upcoming} />

          <section aria-labelledby="mine-heading" className={`${card} p-2`}>
            <div className="px-3 pb-1 pt-2.5">
              <h2 id="mine-heading" className="text-base font-semibold text-ink">
                Recently added by you
              </h2>
            </div>
            {mine.length ? (
              <ul className="mt-1">
                {mine.map((n) => (
                  <NoticeRow key={n.id} notice={n} />
                ))}
              </ul>
            ) : (
              <div className="p-2">
                <EmptyState
                  compact
                  icon={PenSquare}
                  title="Nothing added yet"
                  message="Notices you post from this browser appear here."
                  action={
                    <button type="button" onClick={() => openComposer()} className={`${btnBase} ${btnTone.secondary} h-9 px-3`}>
                      <Plus className="h-4 w-4" aria-hidden />
                      Add notice
                    </button>
                  }
                />
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
