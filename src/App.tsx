import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AddNoticeModal from './components/AddNoticeModal';
import ConfirmDialog from './components/ConfirmDialog';
import Navbar from './components/Navbar';
import NoticeDetailModal from './components/NoticeDetailModal';
import Sidebar from './components/Sidebar';
import Toast, { type ToastMessage } from './components/Toast';
import { getStats } from './filters';
import DashboardPage from './pages/DashboardPage';
import DeadlinesPage from './pages/DeadlinesPage';
import NoticesPage from './pages/NoticesPage';
import SettingsPage from './pages/SettingsPage';
import { ROUTE_TITLES, navigate, useRoute, type Route } from './router';
import { useNotices } from './state/useNotices';
import { UIContext, type ConfirmOptions, type UIContextValue } from './state/ui';
import type { Notice } from './types';
import { useTheme } from './useTheme';

/** Pages where the top-bar search filters the content; elsewhere typing jumps to All Notices. */
const SEARCHABLE: Route[] = ['notices', 'important', 'unread', 'deadlines'];

export default function App() {
  const route = useRoute();
  const { theme, toggle } = useTheme();
  const { notices, now, deleteNotice } = useNotices();

  const [search, setSearch] = useState('');
  const [composer, setComposer] = useState<{ open: boolean; notice: Notice | null }>({ open: false, notice: null });
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [confirmOptions, setConfirmOptions] = useState<ConfirmOptions | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const firstRender = useRef(true);

  const stats = useMemo(() => getStats(notices, now), [notices, now]);
  // Lets requestDelete read the latest notices without rebuilding the UI context on every change.
  const noticesRef = useRef(notices);
  useEffect(() => {
    noticesRef.current = notices;
  }, [notices]);

  const notify = useCallback((message: string) => setToast({ id: Date.now(), message }), []);
  const dismissToast = useCallback(() => setToast(null), []);

  const ui = useMemo<UIContextValue>(
    () => ({
      search,
      setSearch,
      // Only one dialog is open at a time, so opening one closes the detail view first.
      openComposer: (notice) => {
        setDetailsId(null);
        setComposer({ open: true, notice: notice ?? null });
      },
      openDetails: (id) => setDetailsId(id),
      requestDelete: (id) => {
        const target = noticesRef.current.find((n) => n.id === id);
        if (!target?.isUserCreated) return;
        setDetailsId(null);
        setConfirmOptions({
          title: 'Delete this notice?',
          message: `“${target.title}” will be removed from this browser. This can’t be undone.`,
          confirmLabel: 'Delete notice',
          onConfirm: () => {
            deleteNotice(id);
            notify('Notice deleted');
          },
        });
      },
      confirm: (options) => setConfirmOptions(options),
      notify,
    }),
    [search, deleteNotice, notify],
  );

  const handleSearch = (value: string) => {
    setSearch(value);
    if (value.trim() && !SEARCHABLE.includes(route)) navigate('notices');
  };

  // On navigation: update the tab title, close the drawer, scroll up and move focus to the new page.
  useEffect(() => {
    document.title = `${ROUTE_TITLES[route]} · CampusBoard`;
    setDrawerOpen(false);
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo({ top: 0 });
    mainRef.current?.focus({ preventScroll: true });
  }, [route]);

  const anyOverlay = composer.open || !!detailsId || !!confirmOptions || drawerOpen;

  // Keyboard shortcuts: "/" focuses search, "n" opens the composer.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (anyOverlay || e.metaKey || e.ctrlKey || e.altKey || t.isContentEditable || /INPUT|TEXTAREA|SELECT/.test(t.tagName)) return;
      if (e.key === '/') {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        ui.openComposer();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [anyOverlay, ui]);

  const closeComposer = useCallback(() => setComposer({ open: false, notice: null }), []);
  const closeDetails = useCallback(() => setDetailsId(null), []);
  const closeConfirm = useCallback(() => setConfirmOptions(null), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const page = {
    dashboard: <DashboardPage />,
    notices: <NoticesPage key="all" preset="all" />,
    important: <NoticesPage key="important" preset="important" />,
    unread: <NoticesPage key="unread" preset="unread" />,
    deadlines: <DeadlinesPage />,
    settings: <SettingsPage theme={theme} onToggleTheme={toggle} />,
  }[route];

  return (
    <UIContext.Provider value={ui}>
      <button
        type="button"
        onClick={() => mainRef.current?.focus()}
        className="sr-only z-[70] rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-3"
      >
        Skip to content
      </button>

      <Sidebar route={route} stats={stats} drawerOpen={drawerOpen} onCloseDrawer={closeDrawer} onNew={() => ui.openComposer()} />

      <div className="min-h-screen md:pl-[76px] lg:pl-[17.5rem]">
        <Navbar
          ref={searchRef}
          search={search}
          onSearch={handleSearch}
          theme={theme}
          onToggleTheme={toggle}
          onNew={() => ui.openComposer()}
          onOpenMenu={() => setDrawerOpen(true)}
          menuOpen={drawerOpen}
        />
        <main
          ref={mainRef}
          id="main"
          tabIndex={-1}
          aria-label={ROUTE_TITLES[route]}
          className="mx-auto w-full max-w-[1400px] px-4 pb-16 pt-6 outline-none sm:px-6 lg:px-8 lg:pt-8"
        >
          {page}
        </main>
      </div>

      {composer.open && <AddNoticeModal notice={composer.notice} onClose={closeComposer} />}
      <NoticeDetailModal id={detailsId} onClose={closeDetails} />
      <ConfirmDialog options={confirmOptions} onClose={closeConfirm} />
      <Toast toast={toast} onDismiss={dismissToast} />
    </UIContext.Provider>
  );
}
