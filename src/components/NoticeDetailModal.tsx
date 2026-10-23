import { useEffect, useId } from 'react';
import { ExternalLink, FlaskConical, Mail, MailOpen, Pencil, Star, Trash2, UserRoundCheck } from 'lucide-react';
import { useNotices } from '../state/useNotices';
import { useUI } from '../state/ui';
import { btn, btnBase, btnTone } from '../styles';
import { formatDateTime, relativeDeadline, safeUrl } from '../utils';
import Modal, { ModalHeader } from './Modal';
import { CategoryBadge, DeadlineChip, UrgentBadge } from './NoticeBadges';

export default function NoticeDetailModal({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { notices, now, setRead, toggleRead, toggleStar } = useNotices();
  const { openComposer, requestDelete } = useUI();
  const titleId = useId();
  const notice = id ? notices.find((n) => n.id === id) : undefined;

  // Opening a notice counts as reading it. Runs once per opened notice, so "Mark as unread" sticks.
  useEffect(() => {
    if (id) setRead(id, true);
  }, [id, setRead]);

  // Close if the notice disappears, e.g. after a reset in another tab.
  useEffect(() => {
    if (id && !notice) onClose();
  }, [id, notice, onClose]);

  const link = notice?.actionLink;
  const linkUrl = link ? safeUrl(link.url) : null;

  return (
    <Modal open={!!notice} onClose={onClose} labelledBy={titleId} size="lg">
      {notice && (
        <>
          <ModalHeader titleId={titleId} title={notice.title} onClose={onClose}>
            <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
              <CategoryBadge category={notice.category} />
              {notice.priority === 'High' && <UrgentBadge />}
            </div>
          </ModalHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
            {notice.deadline && (
              <div className="mb-4">
                <DeadlineChip deadline={notice.deadline} category={notice.category} now={now} />
              </div>
            )}
            <p className="text-[15px] font-medium leading-relaxed text-ink">{notice.description}</p>
            {/* Plain text only: React escapes it, and line breaks are kept with whitespace-pre-line. */}
            <div className="mt-3 whitespace-pre-line break-words text-sm leading-7 text-ink-soft">{notice.content}</div>

            {link && linkUrl && (
              <a
                href={linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-5 flex items-center justify-between gap-3 rounded-xl border border-line bg-raised px-4 py-3 transition duration-150 hover:border-brand-300 dark:hover:border-brand-500/50"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-accent-text">{link.label}</span>
                  <span className="block truncate text-xs text-ink-muted">
                    {new URL(linkUrl).hostname}
                    {!notice.isUserCreated && ' · placeholder for this demo, not a real portal'}
                  </span>
                </span>
                <ExternalLink className="h-4 w-4 shrink-0 text-ink-muted transition group-hover:text-accent-text" aria-hidden />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            )}

            <dl className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2">
              {[
                ['Department', notice.department],
                ['Posted by', notice.author],
                ['Published', formatDateTime(notice.publishedAt)],
                [
                  notice.category === 'Events' ? 'Event date' : 'Deadline',
                  notice.deadline
                    ? `${formatDateTime(notice.deadline)} (${relativeDeadline(notice.deadline, now, notice.category).toLowerCase()})`
                    : 'No deadline',
                ],
                ['Priority', notice.priority === 'High' ? 'High (urgent)' : 'Normal'],
                ['Status', `${notice.isRead ? 'Read' : 'Unread'}${notice.isStarred ? ' · Starred as important' : ''}`],
              ].map(([label, value]) => (
                <div key={label} className="bg-surface px-4 py-3">
                  <dt className="text-xs font-medium text-ink-muted">{label}</dt>
                  <dd className="mt-0.5 text-sm font-medium text-ink">{value}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-4 flex items-start gap-2 rounded-xl bg-raised px-3.5 py-3 text-xs leading-relaxed text-ink-muted">
              {notice.isUserCreated ? (
                <>
                  <UserRoundCheck className="mt-px h-4 w-4 shrink-0 text-accent-text" aria-hidden />
                  You added this notice in this browser, so you can edit or delete it.
                </>
              ) : (
                <>
                  <FlaskConical className="mt-px h-4 w-4 shrink-0 text-accent-text" aria-hidden />
                  Sample announcement for this prototype. It is fictional, not an official notice, and can’t be edited.
                </>
              )}
            </p>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-line px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => toggleStar(notice.id)}
                aria-pressed={notice.isStarred}
                className={`${btnBase} h-10 flex-1 px-4 sm:flex-none ${
                  notice.isStarred
                    ? 'border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300'
                    : btnTone.secondary
                }`}
              >
                <Star className="h-4 w-4" fill={notice.isStarred ? 'currentColor' : 'none'} aria-hidden />
                {notice.isStarred ? 'Starred' : 'Star as important'}
              </button>
              <button type="button" onClick={() => toggleRead(notice.id)} className={`${btn.secondary} flex-1 sm:flex-none`}>
                {notice.isRead ? <Mail className="h-4 w-4" aria-hidden /> : <MailOpen className="h-4 w-4" aria-hidden />}
                {notice.isRead ? 'Mark as unread' : 'Mark as read'}
              </button>
            </div>
            {notice.isUserCreated && (
              <div className="flex gap-2">
                <button type="button" onClick={() => requestDelete(notice.id)} className={`${btn.dangerOutline} flex-1 sm:flex-none`}>
                  <Trash2 className="h-4 w-4" aria-hidden />
                  Delete
                </button>
                <button type="button" onClick={() => openComposer(notice)} className={`${btn.primary} flex-1 sm:flex-none`}>
                  <Pencil className="h-4 w-4" aria-hidden />
                  Edit
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </Modal>
  );
}
