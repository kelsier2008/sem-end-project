import { ArrowDownUp } from 'lucide-react';
import { CATEGORIES, type Category, type QuickFilter, type SortOrder } from '../types';

interface Props {
  category: Category | 'All';
  onCategory: (c: Category | 'All') => void;
  quick: QuickFilter;
  onQuick: (q: QuickFilter) => void;
  sort: SortOrder;
  onSort: (s: SortOrder) => void;
  counts: Record<Category | 'All', number>;
}

const QUICK: QuickFilter[] = ['All', 'Starred', 'Unread'];

export default function FilterBar({ category, onCategory, quick, onQuick, sort, onSort, counts }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div role="tablist" aria-label="Quick filters" className="inline-flex w-fit rounded-lg border border-neutral-200 bg-neutral-100/60 p-0.5 dark:border-neutral-800 dark:bg-neutral-900">
          {QUICK.map((q) => (
            <button
              key={q}
              role="tab"
              aria-selected={quick === q}
              onClick={() => onQuick(q)}
              className={`rounded-md px-3 py-1 text-sm font-medium transition duration-200 ${
                quick === q
                  ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-800 dark:text-neutral-100'
                  : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            >
              {q}
            </button>
          ))}
        </div>

        <label className="relative inline-flex w-fit items-center">
          <ArrowDownUp className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-neutral-400" />
          <span className="sr-only">Sort notices</span>
          <select
            value={sort}
            onChange={(e) => onSort(e.target.value as SortOrder)}
            className="h-8 appearance-none rounded-lg border border-neutral-200 bg-white pl-8 pr-8 text-sm text-neutral-700 outline-none transition duration-200 hover:border-neutral-300 focus:ring-4 focus:ring-neutral-900/5 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-neutral-700"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23a3a3a3' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.6rem center',
            }}
          >
            <option value="newest">Newest first</option>
            <option value="deadline">Upcoming deadlines</option>
          </select>
        </label>
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {(['All', ...CATEGORIES] as const).map((c) => {
          const on = category === c;
          return (
            <button
              key={c}
              onClick={() => onCategory(c)}
              aria-pressed={on}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition duration-200 ${
                on
                  ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900'
                  : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:border-neutral-700 dark:hover:text-neutral-100'
              }`}
            >
              {c}
              <span className={`text-xs tabular-nums ${on ? 'opacity-70' : 'text-neutral-400 dark:text-neutral-500'}`}>{counts[c]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
