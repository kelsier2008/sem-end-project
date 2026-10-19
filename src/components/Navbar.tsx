import { forwardRef } from 'react';
import { Megaphone, Moon, Plus, Search, Sun, X } from 'lucide-react';

interface Props {
  search: string;
  onSearch: (v: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onNew: () => void;
}

const Navbar = forwardRef<HTMLInputElement, Props>(function Navbar(
  { search, onSearch, theme, onToggleTheme, onNew },
  searchRef,
) {
  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/80 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/80">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6">
        <div className="flex shrink-0 items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
            <Megaphone className="h-4 w-4" />
          </div>
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-semibold tracking-tight">NoticeBoard</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Announcements & deadlines</p>
          </div>
        </div>

        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            ref={searchRef}
            type="search"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search notices…"
            aria-label="Search notices"
            className="h-9 w-full rounded-lg border border-neutral-200 bg-neutral-50 pl-9 pr-16 text-sm outline-none transition duration-200 placeholder:text-neutral-400 focus:border-neutral-300 focus:bg-white focus:ring-4 focus:ring-neutral-900/5 dark:border-neutral-800 dark:bg-neutral-900 dark:focus:border-neutral-700 dark:focus:bg-neutral-900 dark:focus:ring-white/5 [&::-webkit-search-cancel-button]:hidden"
          />
          {search ? (
            <button
              onClick={() => onSearch('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-neutral-200 bg-white px-1.5 text-[10px] font-medium text-neutral-400 sm:block dark:border-neutral-700 dark:bg-neutral-800">
              /
            </kbd>
          )}
        </div>

        <button
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-neutral-200 text-neutral-600 transition duration-200 hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-100"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <button
          onClick={onNew}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-neutral-900 px-3 text-sm font-medium text-white shadow-sm transition duration-200 hover:bg-neutral-700 active:scale-[0.98] dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Notice</span>
        </button>
      </div>
    </header>
  );
});

export default Navbar;
