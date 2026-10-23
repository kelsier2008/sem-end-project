import { SearchX, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { btn } from '../styles';
import type { Notice } from '../types';
import EmptyState from './EmptyState';
import NoticeCard from './NoticeCard';

interface Props {
  notices: Notice[];
  /** True when search or filters are narrowing the list, so the empty state offers to clear them. */
  filtered: boolean;
  onClearFilters: () => void;
  empty: { icon: LucideIcon; title: string; message: string; action?: ReactNode };
}

/** The notice feed: a responsive card grid with helpful empty states. */
export default function NoticeGrid({ notices, filtered, onClearFilters, empty }: Props) {
  if (notices.length === 0) {
    return filtered ? (
      <EmptyState
        icon={SearchX}
        title="No notices match"
        message="Try a different search term, or clear the filters to see everything again."
        action={
          <button type="button" onClick={onClearFilters} className={btn.secondary}>
            Clear filters
          </button>
        }
      />
    ) : (
      <EmptyState {...empty} />
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
      {notices.map((n) => (
        <li key={n.id} className="flex">
          <NoticeCard notice={n} />
        </li>
      ))}
    </ul>
  );
}
