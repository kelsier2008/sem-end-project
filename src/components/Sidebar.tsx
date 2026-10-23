import { useEffect, useRef } from 'react';
import {
  BellDot,
  CalendarClock,
  HardDrive,
  Inbox,
  LayoutDashboard,
  Plus,
  Settings,
  Star,
  X,
  type LucideIcon,
} from 'lucide-react';
import type { Stats } from '../filters';
import { ROUTE_TITLES, href, type Route } from '../router';
import { btnBase, btnTone, iconBtn } from '../styles';
import { useDialog } from '../useDialog';
import { LogoMark, Wordmark } from './Logo';

const NAV: { route: Route; icon: LucideIcon; count?: (s: Stats) => number }[] = [
  { route: 'dashboard', icon: LayoutDashboard },
  { route: 'notices', icon: Inbox },
  { route: 'important', icon: Star, count: (s) => s.important },
  { route: 'unread', icon: BellDot, count: (s) => s.unread },
  { route: 'deadlines', icon: CalendarClock, count: (s) => s.upcoming },
  { route: 'settings', icon: Settings },
];

/**
 * `rail`: icon-only on tablets, full labels from lg up (CSS only).
 * `full`: always full labels (mobile drawer).
 */
function NavLinks({ route, stats, variant, onNavigate }: { route: Route; stats: Stats; variant: 'rail' | 'full'; onNavigate?: () => void }) {
  const rail = variant === 'rail';
  return (
    <nav aria-label="Main">
      <ul className="space-y-1">
        {NAV.map(({ route: r, icon: Icon, count }) => {
          const active = r === route;
          const n = count?.(stats) ?? 0;
          return (
            <li key={r}>
              <a
                href={href(r)}
                onClick={onNavigate}
                aria-current={active ? 'page' : undefined}
                title={rail ? ROUTE_TITLES[r] : undefined}
                className={`group relative flex h-11 items-center gap-3 rounded-xl text-sm font-medium transition duration-150 ${
                  rail ? 'justify-center lg:justify-start lg:px-3' : 'px-3'
                } ${active ? 'bg-accent-soft text-accent-text' : 'text-ink-soft hover:bg-raised hover:text-ink'}`}
              >
                {active && <span aria-hidden className="absolute -left-3 top-2.5 h-6 w-1 rounded-r-full bg-brand-500" />}
                <Icon
                  className={`h-[18px] w-[18px] shrink-0 ${active ? 'text-brand-500 dark:text-brand-300' : 'text-ink-muted group-hover:text-ink'}`}
                  aria-hidden
                />
                <span className={rail ? 'sr-only lg:not-sr-only lg:flex-1 lg:truncate' : 'flex-1 truncate'}>{ROUTE_TITLES[r]}</span>
                {n > 0 && (
                  <>
                    <span
                      className={`min-w-6 rounded-full px-1.5 py-0.5 text-center text-xs font-semibold tabular-nums ${
                        active ? 'bg-brand-500 text-white' : 'bg-raised text-ink-muted'
                      } ${rail ? 'hidden lg:inline-block' : ''}`}
                    >
                      {n}
                    </span>
                    {rail && (
                      <span aria-hidden className="absolute right-3 top-2.5 h-2 w-2 rounded-full bg-brand-500 ring-2 ring-surface lg:hidden" />
                    )}
                    {rail && <span className="sr-only lg:hidden">, {n}</span>}
                  </>
                )}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function StorageNote() {
  return (
    <div className="rounded-xl border border-line bg-raised p-3.5">
      <div className="flex items-center gap-2 text-xs font-semibold text-ink">
        <HardDrive className="h-3.5 w-3.5 text-accent-text" aria-hidden />
        Prototype
      </div>
      <p className="mt-1 text-xs leading-relaxed text-ink-muted">Notices are saved in this browser only and aren’t shared with others.</p>
    </div>
  );
}

interface Props {
  route: Route;
  stats: Stats;
  drawerOpen: boolean;
  onCloseDrawer: () => void;
  onNew: () => void;
}

export default function Sidebar({ route, stats, drawerOpen, onCloseDrawer, onNew }: Props) {
  const drawerRef = useRef<HTMLDivElement>(null);
  useDialog(drawerRef, drawerOpen, onCloseDrawer);

  // If the window grows past the mobile breakpoint, the drawer is no longer needed.
  useEffect(() => {
    if (!drawerOpen) return;
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = () => mq.matches && onCloseDrawer();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [drawerOpen, onCloseDrawer]);

  return (
    <>
      {/* Tablet & desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[76px] flex-col border-r border-line bg-surface md:flex lg:w-[17.5rem]">
        <a
          href={href('dashboard')}
          className="flex h-16 shrink-0 items-center justify-center gap-2.5 border-b border-line lg:justify-start lg:px-5"
          aria-label="CampusBoard dashboard"
        >
          <LogoMark />
          <Wordmark className="hidden lg:inline" />
        </a>
        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-5">
          <button type="button" onClick={onNew} className={`${btnBase} ${btnTone.primary} h-11 w-full lg:px-4`} aria-label="Add notice">
            <Plus className="h-[18px] w-[18px]" aria-hidden />
            <span className="hidden lg:inline">Add notice</span>
          </button>
          <NavLinks route={route} stats={stats} variant="rail" />
          <div className="mt-auto hidden lg:block">
            <StorageNote />
          </div>
        </div>
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 animate-fade-in bg-deep/45 backdrop-blur-[2px]" onClick={onCloseDrawer} aria-hidden />
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="relative flex h-full w-[min(18rem,85vw)] animate-slide-in flex-col bg-surface shadow-2xl"
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-4">
              <span className="flex items-center gap-2.5">
                <LogoMark className="h-8 w-8" />
                <Wordmark />
              </span>
              <button type="button" onClick={onCloseDrawer} aria-label="Close navigation menu" className={iconBtn}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-5">
              <NavLinks route={route} stats={stats} variant="full" onNavigate={onCloseDrawer} />
              <button
                type="button"
                onClick={() => {
                  onCloseDrawer();
                  onNew();
                }}
                className={`${btnBase} ${btnTone.primary} h-11 w-full px-4`}
              >
                <Plus className="h-[18px] w-[18px]" aria-hidden />
                Add notice
              </button>
              <div className="mt-auto">
                <StorageNote />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
