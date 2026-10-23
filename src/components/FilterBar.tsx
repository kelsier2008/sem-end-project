import { ArrowDownUp, Star, X, Zap } from 'lucide-react';
import { CATEGORIES, type Category, type FilterState, type SortOrder, type StatusFilter } from '../types';
import { plural } from '../utils';

interface Props {
  filters: FilterState;
  onChange: (patch: Partial<FilterState>) => void;
  counts: Record<Category | 'All', number>;
  resultCount: number;
  totalCount: number;
  hasActiveFilters: boolean;
  onClear: () => void;
  /** Hide controls that a page already fixes (e.g. the Unread page fixes the status). */
  hideStatus?: boolean;
  hideImportant?: boolean;
}

const STATUSES: StatusFilter[] = ['All', 'Unread', 'Read'];

const SORTS: { value: SortOrder; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'deadline', label: 'Nearest deadline' },
];

const toggleCls = (on: boolean) =>
  `inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-sm font-medium transition duration-150 ${
    on
      ? 'border-brand-300 bg-accent-soft text-accent-text dark:border-brand-500/40'
      : 'border-line bg-surface text-ink-soft hover:border-line-strong hover:text-ink'
  }`;

export default function FilterBar({
  filters,
  onChange,
  counts,
  resultCount,
  totalCount,
  hasActiveFilters,
  onClear,
  hideStatus,
  hideImportant,
}: Props) {
  return (
    <section aria-label="Filter and sort notices" className="space-y-3">
      <div role="group" aria-label="Category" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        {(['All', ...CATEGORIES] as const).map((c) => {
          const on = filters.category === c;
          return (
            <button
              key={c}
              type="button"
              onClick={() => onChange({ category: c })}
              aria-pressed={on}
              className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition duration-150 ${
                on
                  ? 'border-deep bg-deep text-white dark:border-brand-400 dark:bg-brand-500'
                  : 'border-line bg-surface text-ink-soft hover:border-line-strong hover:text-ink'
              }`}
            >
              {c === 'All' ? 'All categories' : c}
              <span className={`text-xs tabular-nums ${on ? 'text-white/70' : 'text-ink-muted'}`}>{counts[c]}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {!hideStatus && (
            <div role="group" aria-label="Read status" className="inline-flex rounded-xl border border-line bg-raised p-0.5">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onChange({ status: s })}
                  aria-pressed={filters.status === s}
                  className={`h-8 rounded-[10px] px-3 text-sm font-medium transition duration-150 ${
                    filters.status === s ? 'bg-surface text-ink shadow-card' : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          {!hideImportant && (
            <button
              type="button"
              aria-pressed={filters.importantOnly}
              onClick={() => onChange({ importantOnly: !filters.importantOnly })}
              className={toggleCls(filters.importantOnly)}
            >
              <Star className="h-4 w-4" fill={filters.importantOnly ? 'currentColor' : 'none'} aria-hidden />
              Important only
            </button>
          )}
          <button
            type="button"
            aria-pressed={filters.highPriorityOnly}
            onClick={() => onChange({ highPriorityOnly: !filters.highPriorityOnly })}
            className={toggleCls(filters.highPriorityOnly)}
          >
            <Zap className="h-4 w-4" fill={filters.highPriorityOnly ? 'currentColor' : 'none'} aria-hidden />
            High priority only
          </button>
        </div>

        <label className="relative flex items-center sm:w-auto">
          <span className="sr-only">Sort notices</span>
          <ArrowDownUp className="pointer-events-none absolute left-3 h-4 w-4 text-ink-muted" aria-hidden />
          <select
            value={filters.sort}
            onChange={(e) => onChange({ sort: e.target.value as SortOrder })}
            className="h-9 w-full appearance-none rounded-xl border border-line bg-surface pl-9 pr-9 text-sm font-medium text-ink outline-none transition duration-150 hover:border-line-strong focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15 sm:w-auto"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%238a83a0' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.75rem center',
            }}
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex min-h-9 items-center justify-between gap-3 text-sm">
        <p aria-live="polite" className="text-ink-muted">
          {resultCount === totalCount ? (
            <>Showing {plural(totalCount, 'notice')}</>
          ) : (
            <>
              Showing <span className="font-semibold text-ink">{resultCount}</span> of {plural(totalCount, 'notice')}
            </>
          )}
        </p>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex h-9 items-center gap-1 rounded-xl px-2.5 font-medium text-accent-text transition duration-150 hover:bg-accent-soft"
          >
            <X className="h-4 w-4" aria-hidden />
            Clear filters
          </button>
        )}
      </div>
    </section>
  );
}
