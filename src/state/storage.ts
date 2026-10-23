import { createDemoNotices } from '../data';
import { CATEGORIES, PRIORITIES, type Category, type Notice, type Priority } from '../types';
import { isValidISO, safeUrl } from '../utils';

/**
 * localStorage key that holds the whole notice collection as a JSON array of `Notice`.
 * Data saved here belongs to one browser on one device; it is not shared with anyone else.
 */
export const STORAGE_KEY = 'campusboard:notices';

/** Where an unreadable collection is copied before demo data replaces it, so nothing is lost silently. */
const BACKUP_KEY = 'campusboard:notices:backup';

export interface LoadResult {
  notices: Notice[];
  /** The exact JSON now in storage for these notices, or null when they still need saving. */
  savedJson: string | null;
  /** False when the browser blocks localStorage (some private modes, disabled site data). */
  storageAvailable: boolean;
  /** Human-readable problem with the saved data, if any. */
  warning: string | null;
}

const text = (v: unknown, max: number): v is string => typeof v === 'string' && v.trim().length > 0 && v.length <= max;

/** Returns a clean Notice, or null when the record is missing required fields or has invalid values. */
export function parseNotice(raw: unknown): Notice | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;

  if (
    !text(r.id, 100) ||
    !text(r.title, 200) ||
    !text(r.description, 500) ||
    !text(r.content, 10_000) ||
    !text(r.department, 100) ||
    !text(r.author, 100)
  ) {
    return null;
  }
  if (!CATEGORIES.includes(r.category as Category) || !PRIORITIES.includes(r.priority as Priority)) return null;
  if (!isValidISO(r.publishedAt)) return null;
  if (r.deadline != null && !isValidISO(r.deadline)) return null;

  const notice: Notice = {
    id: r.id,
    title: r.title,
    description: r.description,
    content: r.content,
    category: r.category as Category,
    department: r.department,
    author: r.author,
    publishedAt: r.publishedAt,
    deadline: (r.deadline as string | null | undefined) ?? null,
    priority: r.priority as Priority,
    isRead: r.isRead === true,
    isStarred: r.isStarred === true,
    isUserCreated: r.isUserCreated === true,
  };

  const link = r.actionLink as Record<string, unknown> | undefined;
  if (link && text(link.label, 80) && typeof link.url === 'string' && safeUrl(link.url)) {
    notice.actionLink = { label: link.label, url: link.url };
  }
  return notice;
}

/** Parses a saved JSON collection. Returns null when it isn't a usable array. */
export function parseCollection(json: string): { notices: Notice[]; dropped: number } | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return null;
  }
  if (!Array.isArray(parsed)) return null;

  const seen = new Set<string>();
  const notices: Notice[] = [];
  for (const item of parsed) {
    const n = parseNotice(item);
    if (n && !seen.has(n.id)) {
      seen.add(n.id);
      notices.push(n);
    }
  }
  if (parsed.length > 0 && notices.length === 0) return null;
  return { notices, dropped: parsed.length - notices.length };
}

/** Reads notices at startup. Demo data is used only when nothing usable has been saved yet. */
export function loadNotices(): LoadResult {
  let raw: string | null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return {
      notices: createDemoNotices(),
      savedJson: null,
      storageAvailable: false,
      warning: null,
    };
  }

  if (raw === null) {
    return { notices: createDemoNotices(), savedJson: null, storageAvailable: true, warning: null };
  }

  const result = parseCollection(raw);
  if (!result) {
    try {
      localStorage.setItem(BACKUP_KEY, raw);
    } catch {
      /* best effort */
    }
    return {
      notices: createDemoNotices(),
      savedJson: null,
      storageAvailable: true,
      warning: `Saved notices couldn't be read, so the demo data was restored. The unreadable data was copied to "${BACKUP_KEY}".`,
    };
  }

  const { notices, dropped } = result;
  return {
    notices,
    // When records were dropped, leave savedJson null so the cleaned list is written back once.
    savedJson: dropped ? null : JSON.stringify(notices),
    storageAvailable: true,
    warning: dropped ? `${dropped} saved notice${dropped === 1 ? ' was' : 's were'} invalid and skipped.` : null,
  };
}

/** Writes the serialised collection. Returns false if the browser refused (storage blocked or full). */
export function saveNotices(json: string): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, json);
    return true;
  } catch {
    return false;
  }
}
