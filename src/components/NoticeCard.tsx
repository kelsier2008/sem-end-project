import { useId } from 'react';
import { ArrowRight, Building2, CalendarDays, Check, CheckCheck, Mail, Pencil, Star, Trash2, UserRound } from 'lucide-react';
import { useNotices } from '../state/useNotices';
import { useUI } from '../state/ui';
import { iconBtn, iconBtnBase } from '../styles';
import type { Notice } from '../types';
import { formatPosted } from '../utils';
import { CategoryBadge, DeadlineChip, UrgentBadge } from './NoticeBadges';

export default function NoticeCard({ notice: n }: { notice: Notice }) {
  const { now, toggleRead, toggleStar } = useNotices();
  const { openDetails, openComposer, requestDelete } = useUI();
  const titleId = useId();
  const unread = !n.isRead;

  return (
    <article
      aria-labelledby={titleId}
      className={`group relative flex w-full flex-col rounded-2xl border bg-surface p-5 shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-lift ${
        unread ? 'border-line-strong' : 'border-line'
      }`}
    >
      {unread && <span aria-hidden className="absolute bottom-5 left-0 top-5 w-[3px] rounded-r-full bg-brand-500" />}

      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <CategoryBadge category={n.category} />
          {n.priority === 'High' && <UrgentBadge />}
          {unread ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-accent-text">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden />
              Unread
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-ink-muted">
              <CheckCheck className="h-3.5 w-3.5" aria-hidden />
              Read
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => toggleStar(n.id)}
          aria-label={n.isStarred ? `Remove “${n.title}” from important` : `Mark “${n.title}” as important`}
          aria-pressed={n.isStarred}
          title={n.isStarred ? 'Starred as important' : 'Star as important'}
          className={`-m-1.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl transition duration-150 hover:bg-raised ${
            n.isStarred ? 'text-amber-500' : 'text-ink-muted/60 hover:text-ink-muted'
          }`}
        >
          <Star className="h-[18px] w-[18px]" fill={n.isStarred ? 'currentColor' : 'none'} />
        </button>
      </div>

      <h3 id={titleId} className={`mt-3 text-[15px] leading-snug tracking-tight text-ink ${unread ? 'font-semibold' : 'font-medium'}`}>
        {n.title}
      </h3>
      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-soft">{n.description}</p>

      {n.deadline && (
        <div className="mt-3">
          <DeadlineChip deadline={n.deadline} category={n.category} now={now} />
        </div>
      )}

      <dl className="mb-4 mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ink-muted">
        <div className="flex min-w-0 items-center gap-1.5">
          <dt className="sr-only">Department</dt>
          <Building2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <dd className="truncate">{n.department}</dd>
        </div>
        <div className="flex min-w-0 items-center gap-1.5">
          <dt className="sr-only">Posted by</dt>
          <UserRound className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <dd className="truncate">
            {n.author}
            {n.isUserCreated && <span className="ml-1 font-medium text-accent-text">(you)</span>}
          </dd>
        </div>
        <div className="flex items-center gap-1.5">
          <dt className="sr-only">Published</dt>
          <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <dd>
            <time dateTime={n.publishedAt}>{formatPosted(n.publishedAt, now)}</time>
          </dd>
        </div>
      </dl>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-line pt-3">
        <button
          type="button"
          onClick={() => toggleRead(n.id)}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-xs font-semibold text-ink-soft transition duration-150 hover:bg-raised hover:text-ink"
        >
          {unread ? <Check className="h-4 w-4" aria-hidden /> : <Mail className="h-4 w-4" aria-hidden />}
          {unread ? 'Mark as read' : 'Mark as unread'}
        </button>

        <div className="flex items-center gap-0.5">
          {n.isUserCreated && (
            <>
              <button type="button" onClick={() => openComposer(n)} aria-label={`Edit “${n.title}”`} title="Edit" className={iconBtn}>
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => requestDelete(n.id)}
                aria-label={`Delete “${n.title}”`}
                title="Delete"
                className={`${iconBtnBase} h-9 w-9 text-ink-muted hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-300`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => openDetails(n.id)}
            aria-label={`View details: ${n.title}`}
            className="inline-flex h-9 items-center gap-1 rounded-xl px-2.5 text-xs font-semibold text-accent-text transition duration-150 hover:bg-accent-soft"
          >
            View details
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden />
          </button>
        </div>
      </div>
    </article>
  );
}
