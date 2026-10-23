import { useNotices } from '../state/useNotices';
import { useUI } from '../state/ui';
import type { Notice } from '../types';
import { formatPosted } from '../utils';
import { CATEGORY_ICONS, CATEGORY_STYLES, UrgentBadge } from './NoticeBadges';

/** Compact one-line notice for dashboard lists. Opens the detail view. */
export default function NoticeRow({ notice: n }: { notice: Notice }) {
  const { now } = useNotices();
  const { openDetails } = useUI();
  const Icon = CATEGORY_ICONS[n.category];
  const unread = !n.isRead;

  return (
    <li>
      <button
        type="button"
        onClick={() => openDetails(n.id)}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition duration-150 hover:bg-raised"
      >
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border ${CATEGORY_STYLES[n.category]}`}>
          <Icon className="h-4 w-4" aria-hidden />
          <span className="sr-only">{n.category}</span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className={`truncate text-sm ${unread ? 'font-semibold text-ink' : 'font-medium text-ink-soft'}`}>{n.title}</span>
            {n.priority === 'High' && <UrgentBadge />}
          </span>
          <span className="mt-0.5 block truncate text-xs text-ink-muted">
            {n.department} · <time dateTime={n.publishedAt}>{formatPosted(n.publishedAt, now)}</time>
          </span>
        </span>
        {unread && (
          <span className="flex shrink-0 items-center">
            <span className="h-2 w-2 rounded-full bg-brand-500" aria-hidden />
            <span className="sr-only">Unread</span>
          </span>
        )}
      </button>
    </li>
  );
}
