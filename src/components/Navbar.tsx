import { forwardRef } from 'react';
import { Menu, Moon, Plus, Search, Sun, X } from 'lucide-react';
import { href } from '../router';
import { btnBase, btnTone, iconBtn, iconBtnBase } from '../styles';
import { LogoMark, Wordmark } from './Logo';

interface Props {
  search: string;
  onSearch: (v: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onNew: () => void;
  onOpenMenu: () => void;
  menuOpen: boolean;
}

/** Top bar: global search, theme toggle and the Add notice action. */
const Navbar = forwardRef<HTMLInputElement, Props>(function Navbar(
  { search, onSearch, theme, onToggleTheme, onNew, onOpenMenu, menuOpen },
  searchRef,
) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-canvas/85 backdrop-blur-md">
      <div className="flex h-16 items-center gap-2 px-4 sm:gap-3 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Open navigation menu"
          aria-expanded={menuOpen}
          className={`${iconBtn} -ml-1.5 md:hidden`}
        >
          <Menu className="h-5 w-5" />
        </button>
        <a href={href('dashboard')} className="flex shrink-0 items-center gap-2 rounded-xl md:hidden" aria-label="CampusBoard dashboard">
          <LogoMark className="h-8 w-8" />
          <Wordmark className="hidden sm:inline" />
        </a>

        <div role="search" className="relative min-w-0 flex-1 md:max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden />
          <input
            ref={searchRef}
            type="search"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search notices"
            aria-label="Search notices by title, text, department or author"
            className="h-10 w-full rounded-xl border border-line bg-surface pl-9 pr-10 text-sm text-ink outline-none transition duration-150 placeholder:text-ink-muted/80 hover:border-line-strong focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15 [&::-webkit-search-cancel-button]:hidden"
          />
          {search ? (
            <button
              type="button"
              onClick={() => onSearch('')}
              aria-label="Clear search"
              className="absolute right-1.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-ink-muted transition hover:bg-raised hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded-md border border-line bg-raised px-1.5 py-0.5 text-[11px] font-medium text-ink-muted sm:block">
              /
            </kbd>
          )}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            title={theme === 'dark' ? 'Light theme' : 'Dark theme'}
            className={`${iconBtnBase} h-10 w-10 border border-line bg-surface text-ink-muted hover:bg-raised hover:text-ink`}
          >
            {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          </button>
          <button type="button" onClick={onNew} className={`${btnBase} ${btnTone.primary} h-10 w-10 sm:w-auto sm:px-4`} aria-label="Add notice">
            <Plus className="h-[18px] w-[18px]" aria-hidden />
            <span className="hidden sm:inline">Add notice</span>
          </button>
        </div>
      </div>
    </header>
  );
});

export default Navbar;
