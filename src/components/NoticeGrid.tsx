import { Inbox, SearchX } from 'lucide-react';
import type { Notice } from '../types';
import NoticeCard from './NoticeCard';

interface Props {
  notices: Notice[];
  filtered: boolean;
  onClearFilters: () => void;
  onToggleStar: (id: string) => void;
  onToggleRead: (id: string) => void;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  isDeletable: (id: string) => boolean;
}

export default function NoticeGrid({ notices, filtered, onClearFilters, isDeletable, onDelete, ...handlers }: Props) {
  if (notices.length === 0) {
    const Icon = filtered ? SearchX : Inbox;
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 px-6 py-16 text-center dark:border-neutral-700">
        <div className="grid h-11 w-11 place-items-center rounded-full bg-neutral-100 dark:bg-neutral-800">
          <Icon className="h-5 w-5 text-neutral-500" />
        </div>
        <h3 className="mt-4 text-sm font-semibold">{filtered ? 'No matching notices' : 'No notices yet'}</h3>
        <p className="mt-1 max-w-xs text-sm text-neutral-500 dark:text-neutral-400">
          {filtered ? 'Try a different search or clear your filters.' : 'Post the first announcement for your class.'}
        </p>
        {filtered && (
          <button
            onClick={onClearFilters}
            className="mt-4 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm font-medium transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            Clear filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {notices.map((n) => (
        <NoticeCard key={n.id} notice={n} onDelete={isDeletable(n.id) ? onDelete : undefined} {...handlers} />
      ))}
    </div>
  );
}
