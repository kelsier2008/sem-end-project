import { useMemo, useState } from 'react';
import { CheckCheck, CircleCheck, Inbox, Plus, Star } from 'lucide-react';
import FilterBar from '../components/FilterBar';
import NoticeGrid from '../components/NoticeGrid';
import PageHeader from '../components/PageHeader';
import { DEFAULT_FILTERS, applyFilters, countByCategory, isDefaultFilters } from '../filters';
import { href } from '../router';
import { useNotices } from '../state/useNotices';
import { useUI } from '../state/ui';
import { btn } from '../styles';
import type { FilterState } from '../types';

export type NoticesPreset = 'all' | 'important' | 'unread';

const META: Record<NoticesPreset, { title: string; subtitle: string }> = {
  all: { title: 'All notices', subtitle: 'Every announcement from every department, in one feed.' },
  important: { title: 'Important', subtitle: 'Notices you starred so they’re easy to find again.' },
  unread: { title: 'Unread', subtitle: 'Catch up on announcements you haven’t opened yet.' },
};

/** Feed page used for All Notices, Important and Unread; each preset fixes part of the filtering. */
export default function NoticesPage({ preset }: { preset: NoticesPreset }) {
  const { notices, now, markAllRead } = useNotices();
  const { search, setSearch, openComposer } = useUI();
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const base = useMemo(
    () => notices.filter((n) => (preset === 'important' ? n.isStarred : preset === 'unread' ? !n.isRead : true)),
    [notices, preset],
  );
  const visible = useMemo(() => applyFilters(base, filters, search, now), [base, filters, search, now]);
  const counts = useMemo(() => countByCategory(base), [base]);
  const hasActiveFilters = search.trim() !== '' || !isDefaultFilters(filters);
  const clear = () => {
    setFilters(DEFAULT_FILTERS);
    setSearch('');
  };

  const empty = {
    all: {
      icon: Inbox,
      title: 'No notices yet',
      message: 'Post the first announcement for your class.',
      action: (
        <button type="button" onClick={() => openComposer()} className={btn.primary}>
          <Plus className="h-4 w-4" aria-hidden />
          Add notice
        </button>
      ),
    },
    important: {
      icon: Star,
      title: 'No important notices',
      message: 'Tap the star on any notice to keep it here for quick access.',
      action: (
        <a href={href('notices')} className={btn.secondary}>
          Browse all notices
        </a>
      ),
    },
    unread: {
      icon: CircleCheck,
      title: 'You’re all caught up',
      message: 'There are no unread notices. New announcements will appear here.',
      action: (
        <a href={href('notices')} className={btn.secondary}>
          Browse all notices
        </a>
      ),
    },
  }[preset];

  return (
    <div className="space-y-6">
      <PageHeader
        title={META[preset].title}
        subtitle={META[preset].subtitle}
        actions={
          preset === 'unread' && base.length > 0 ? (
            <button type="button" onClick={() => markAllRead(visible.map((n) => n.id))} className={btn.secondary}>
              <CheckCheck className="h-4 w-4" aria-hidden />
              {hasActiveFilters ? 'Mark these as read' : 'Mark all as read'}
            </button>
          ) : preset === 'all' ? (
            <button type="button" onClick={() => openComposer()} className={btn.primary}>
              <Plus className="h-4 w-4" aria-hidden />
              Add notice
            </button>
          ) : undefined
        }
      />

      {base.length > 0 && (
        <FilterBar
          filters={filters}
          onChange={(patch) => setFilters((f) => ({ ...f, ...patch }))}
          counts={counts}
          resultCount={visible.length}
          totalCount={base.length}
          hasActiveFilters={hasActiveFilters}
          onClear={clear}
          hideStatus={preset === 'unread'}
          hideImportant={preset === 'important'}
        />
      )}

      <NoticeGrid notices={visible} filtered={base.length > 0 && hasActiveFilters} onClearFilters={clear} empty={empty} />
    </div>
  );
}
