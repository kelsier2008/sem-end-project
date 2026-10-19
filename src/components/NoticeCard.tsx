import { useState } from 'react';
import { CalendarDays, Check, ChevronDown, Clock, Star, Trash2, User } from 'lucide-react';
import type { Notice } from '../types';
import { categoryStyles, daysUntil, formatDate, relativeDue, urgencyDot } from '../utils';

interface Props {
  notice: Notice;
  onToggleStar: (id: string) => void;
  onToggleRead: (id: string) => void;
  onMarkRead: (id: string) => void;
  onDelete?: (id: string) => void;
}

const PREVIEW = 140;

export default function NoticeCard({ notice, onToggleStar, onToggleRead, onMarkRead, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false);
  const long = notice.content.length > PREVIEW;
  const due = notice.dueDate ? daysUntil(notice.dueDate) : null;
  const overdue = due !== null && due < 0;
  const soon = due !== null && due >= 0 && due <= 3;

  const toggleExpand = () => {
    setExpanded((e) => !e);
    if (!notice.isRead) onMarkRead(notice.id);
  };

  return (
    <article
      className={`group relative flex flex-col rounded-xl border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-neutral-900 dark:hover:shadow-black/40 ${
        notice.isRead
          ? 'border-neutral-200 dark:border-neutral-800'
          : 'border-neutral-300 dark:border-neutral-700'
      } ${overdue ? 'opacity-70' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${categoryStyles[notice.category]}`}>
            {notice.category}
          </span>
          {notice.urgency && (
            <span className="inline-flex items-center gap-1.5 text-xs capitalize text-neutral-500 dark:text-neutral-400" title={`${notice.urgency} urgency`}>
              <span className="relative flex h-2 w-2">
                {notice.urgency === 'high' && !overdue && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-60" />
                )}
                <span className={`relative inline-flex h-2 w-2 rounded-full ${urgencyDot[notice.urgency]}`} />
              </span>
              {notice.urgency}
            </span>
          )}
          {!notice.isRead && (
            <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
              New
            </span>
          )}
        </div>

        <button
          onClick={() => onToggleStar(notice.id)}
          aria-label={notice.isStarred ? 'Unstar notice' : 'Star notice'}
          aria-pressed={!!notice.isStarred}
          className={`-m-1 rounded-md p-1 transition duration-200 hover:scale-110 ${
            notice.isStarred ? 'text-amber-500' : 'text-neutral-300 hover:text-neutral-500 dark:text-neutral-600 dark:hover:text-neutral-400'
          }`}
        >
          <Star className="h-4 w-4" fill={notice.isStarred ? 'currentColor' : 'none'} />
        </button>
      </div>

      <h3 className={`mt-3 text-[15px] leading-snug tracking-tight ${notice.isRead ? 'font-medium' : 'font-semibold'}`}>
        {notice.title}
      </h3>

      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
        {expanded || !long ? notice.content : `${notice.content.slice(0, PREVIEW).trimEnd()}…`}
      </p>
      {long && (
        <button
          onClick={toggleExpand}
          aria-expanded={expanded}
          className="mt-1.5 inline-flex w-fit items-center gap-1 text-xs font-medium text-neutral-500 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        >
          {expanded ? 'Show less' : 'Read more'}
          <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
        </button>
      )}

      <div className="mt-auto pt-4">
        {notice.dueDate && (
          <div
            className={`mb-3 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ${
              overdue
                ? 'bg-neutral-100 text-neutral-500 line-through dark:bg-neutral-800 dark:text-neutral-500'
                : soon
                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300'
                  : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            {relativeDue(notice.dueDate)} · {formatDate(notice.dueDate)}
          </div>
        )}

        <div className="flex items-center justify-between gap-2 border-t border-neutral-100 pt-3 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
          <div className="flex min-w-0 items-center gap-3">
            <span className="inline-flex min-w-0 items-center gap-1">
              <User className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{notice.author}</span>
            </span>
            <span className="inline-flex shrink-0 items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDate(notice.date)}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-0.5 opacity-100 transition duration-200 sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
            <button
              onClick={() => onToggleRead(notice.id)}
              title={notice.isRead ? 'Mark as unread' : 'Mark as read'}
              aria-label={notice.isRead ? 'Mark as unread' : 'Mark as read'}
              className="rounded-md p-1.5 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
            >
              <Check className={`h-3.5 w-3.5 ${notice.isRead ? 'text-emerald-500' : ''}`} />
            </button>
            {onDelete && (
              <button
                onClick={() => onDelete(notice.id)}
                title="Delete notice"
                aria-label="Delete notice"
                className="rounded-md p-1.5 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
