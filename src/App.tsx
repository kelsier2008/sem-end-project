import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AddNoticeModal from './components/AddNoticeModal';
import FilterBar from './components/FilterBar';
import Navbar from './components/Navbar';
import NoticeGrid from './components/NoticeGrid';
import StatSummary from './components/StatSummary';
import { seedNotices } from './data';
import { CATEGORIES, type Category, type Notice, type QuickFilter, type SortOrder } from './types';
import { useLocalStorage } from './useLocalStorage';
import { useTheme } from './useTheme';
import { daysUntil } from './utils';

type Flags = Record<string, { isStarred?: boolean; isRead?: boolean }>;

export default function App() {
  const { theme, toggle } = useTheme();
  // Seed notices are static; only user-posted notices and per-notice flags are persisted.
  const [custom, setCustom] = useLocalStorage<Notice[]>('noticeboard:custom', []);
  const [flags, setFlags] = useLocalStorage<Flags>('noticeboard:flags', {});

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<Category | 'All'>('All');
  const [quick, setQuick] = useState<QuickFilter>('All');
  const [sort, setSort] = useState<SortOrder>('newest');
  const [modalOpen, setModalOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const notices = useMemo<Notice[]>(
    () => [...custom, ...seedNotices].map((n) => ({ ...n, ...flags[n.id] })),
    [custom, flags],
  );
  const customIds = useMemo(() => new Set(custom.map((n) => n.id)), [custom]);

  const setFlag = useCallback(
    (id: string, key: 'isStarred' | 'isRead', value?: boolean) =>
      setFlags((f) => {
        const current = f[id]?.[key] ?? notices.find((n) => n.id === id)?.[key] ?? false;
        return { ...f, [id]: { ...f[id], [key]: value ?? !current } };
      }),
    [setFlags, notices],
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = notices.filter(
      (n) =>
        (category === 'All' || n.category === category) &&
        (quick === 'All' || (quick === 'Starred' ? n.isStarred : !n.isRead)) &&
        (!q || [n.title, n.content, n.author, n.category].some((s) => s.toLowerCase().includes(q))),
    );
    return list.sort((a, b) => {
      if (sort === 'newest') return b.date.localeCompare(a.date);
      // Upcoming deadlines first, then past deadlines, then notices without one.
      const rank = (n: Notice) => (!n.dueDate ? 2 : daysUntil(n.dueDate) < 0 ? 1 : 0);
      const r = rank(a) - rank(b);
      if (r) return r;
      if (rank(a) === 0) return a.dueDate!.localeCompare(b.dueDate!);
      if (rank(a) === 1) return b.dueDate!.localeCompare(a.dueDate!);
      return b.date.localeCompare(a.date);
    });
  }, [notices, search, category, quick, sort]);

  const counts = useMemo(() => {
    const c = { All: notices.length } as Record<Category | 'All', number>;
    CATEGORIES.forEach((k) => (c[k] = notices.filter((n) => n.category === k).length));
    return c;
  }, [notices]);

  const stats = useMemo(() => {
    const open = (n: Notice) => !n.dueDate || daysUntil(n.dueDate) >= 0;
    return {
      active: notices.filter(open).length,
      unread: notices.filter((n) => !n.isRead).length,
      pendingAssignments: notices.filter((n) => n.category === 'Assignments' && n.dueDate && daysUntil(n.dueDate) >= 0).length,
      upcomingExams: notices.filter((n) => n.category === 'Exams' && n.dueDate && daysUntil(n.dueDate) >= 0).length,
    };
  }, [notices]);

  // Keyboard shortcuts: "/" focuses search, "n" opens the composer.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (modalOpen || e.metaKey || e.ctrlKey || e.altKey || /INPUT|TEXTAREA|SELECT/.test(t.tagName)) return;
      if (e.key === '/') {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setModalOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalOpen]);

  const closeModal = useCallback(() => setModalOpen(false), []);
  const filtered = !!search.trim() || category !== 'All' || quick !== 'All';

  return (
    <div className="min-h-screen">
      <Navbar ref={searchRef} search={search} onSearch={setSearch} theme={theme} onToggleTheme={toggle} onNew={() => setModalOpen(true)} />

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Class notices</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Everything students, parents and class reps need to know — in one place.
          </p>
        </div>

        <StatSummary {...stats} />

        <FilterBar category={category} onCategory={setCategory} quick={quick} onQuick={setQuick} sort={sort} onSort={setSort} counts={counts} />

        <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
          <span aria-live="polite">
            {visible.length} {visible.length === 1 ? 'notice' : 'notices'}
          </span>
          {stats.unread > 0 && (
            <button
              onClick={() => setFlags((f) => Object.fromEntries(notices.map((n) => [n.id, { ...f[n.id], isRead: true }])))}
              className="font-medium transition hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              Mark all as read
            </button>
          )}
        </div>

        <NoticeGrid
          notices={visible}
          filtered={filtered}
          onClearFilters={() => {
            setSearch('');
            setCategory('All');
            setQuick('All');
          }}
          onToggleStar={(id) => setFlag(id, 'isStarred')}
          onToggleRead={(id) => setFlag(id, 'isRead')}
          onMarkRead={(id) => setFlag(id, 'isRead', true)}
          isDeletable={(id) => customIds.has(id)}
          onDelete={(id) => setCustom((c) => c.filter((n) => n.id !== id))}
        />
      </main>

      <AddNoticeModal open={modalOpen} onClose={closeModal} onSubmit={(n) => setCustom((c) => [n, ...c])} />
    </div>
  );
}
