import { CATEGORIES, type Category, type FilterState, type Notice, type SortOrder } from './types';
import { calendarDaysUntil } from './utils';

export const DEFAULT_FILTERS: FilterState = {
  category: 'All',
  status: 'All',
  importantOnly: false,
  highPriorityOnly: false,
  sort: 'newest',
};

export function isDefaultFilters(f: FilterState): boolean {
  return (Object.keys(DEFAULT_FILTERS) as (keyof FilterState)[]).every((k) => f[k] === DEFAULT_FILTERS[k]);
}

/** Case-insensitive match on title, description, full content, department and author. */
export function matchesSearch(n: Notice, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [n.title, n.description, n.content, n.department, n.author].some((s) => s.toLowerCase().includes(q));
}

const time = (iso: string) => new Date(iso).getTime();

export function sortNotices(list: Notice[], sort: SortOrder, now: Date): Notice[] {
  const copy = [...list];
  if (sort === 'newest') return copy.sort((a, b) => time(b.publishedAt) - time(a.publishedAt));
  if (sort === 'oldest') return copy.sort((a, b) => time(a.publishedAt) - time(b.publishedAt));

  // Nearest upcoming deadline first, then past deadlines (most recent first), then notices without one.
  const nowMs = now.getTime();
  const rank = (n: Notice) => (!n.deadline ? 2 : time(n.deadline) >= nowMs ? 0 : 1);
  return copy.sort((a, b) => {
    const r = rank(a) - rank(b);
    if (r) return r;
    if (rank(a) === 0) return time(a.deadline!) - time(b.deadline!);
    if (rank(a) === 1) return time(b.deadline!) - time(a.deadline!);
    return time(b.publishedAt) - time(a.publishedAt);
  });
}

/** Applies every filter together, then sorts what is left. */
export function applyFilters(notices: Notice[], f: FilterState, search: string, now: Date): Notice[] {
  const matching = notices.filter(
    (n) =>
      (f.category === 'All' || n.category === f.category) &&
      (f.status === 'All' || (f.status === 'Unread' ? !n.isRead : n.isRead)) &&
      (!f.importantOnly || n.isStarred) &&
      (!f.highPriorityOnly || n.priority === 'High') &&
      matchesSearch(n, search),
  );
  return sortNotices(matching, f.sort, now);
}

export function countByCategory(notices: Notice[]): Record<Category | 'All', number> {
  const counts = { All: notices.length } as Record<Category | 'All', number>;
  CATEGORIES.forEach((c) => (counts[c] = notices.filter((n) => n.category === c).length));
  return counts;
}

export const isUpcoming = (n: Notice, now: Date) => !!n.deadline && time(n.deadline) >= now.getTime();
export const isOverdue = (n: Notice, now: Date) => !!n.deadline && time(n.deadline) < now.getTime();

/** Notices whose deadline hasn't passed, nearest first. */
export function upcomingDeadlines(notices: Notice[], now: Date): Notice[] {
  return notices.filter((n) => isUpcoming(n, now)).sort((a, b) => time(a.deadline!) - time(b.deadline!));
}

export function getStats(notices: Notice[], now: Date) {
  const upcoming = upcomingDeadlines(notices, now);
  return {
    total: notices.length,
    unread: notices.filter((n) => !n.isRead).length,
    important: notices.filter((n) => n.isStarred).length,
    upcoming: upcoming.length,
    dueToday: upcoming.filter((n) => calendarDaysUntil(n.deadline!, now) === 0).length,
    dueSoon: upcoming.filter((n) => calendarDaysUntil(n.deadline!, now) <= 3).length,
    userCreated: notices.filter((n) => n.isUserCreated).length,
    nextDeadline: upcoming[0] ?? null,
  };
}

export type Stats = ReturnType<typeof getStats>;
