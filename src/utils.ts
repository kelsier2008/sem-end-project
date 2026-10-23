import type { Category } from './types';

const DAY = 86_400_000;

/** Midnight at the start of the local calendar day containing `d`. */
function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export function isValidISO(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && !Number.isNaN(Date.parse(value));
}

/**
 * Whole local calendar days from `now` to `iso` (0 = today, 1 = tomorrow, negative = earlier).
 * Compares local midnights, so it never drifts by a day because of time zones or DST.
 */
export function calendarDaysUntil(iso: string, now: Date): number {
  return Math.round((startOfDay(new Date(iso)) - startOfDay(now)) / DAY);
}

export type DeadlineState = 'overdue' | 'today' | 'soon' | 'later';

export function deadlineState(iso: string, now: Date): DeadlineState {
  if (new Date(iso).getTime() < now.getTime()) return 'overdue';
  const days = calendarDaysUntil(iso, now);
  if (days === 0) return 'today';
  if (days <= 3) return 'soon';
  return 'later';
}

/** "Due tomorrow", "Starts in 4 days", "Overdue by 2 days"… Events read as dates, not deadlines. */
export function relativeDeadline(iso: string, now: Date, category: Category): string {
  const days = calendarDaysUntil(iso, now);
  const isEvent = category === 'Events';

  if (new Date(iso).getTime() < now.getTime()) {
    if (days === 0) return isEvent ? 'Earlier today' : 'Closed today';
    const ago = -days;
    if (isEvent) return ago === 1 ? 'Yesterday' : `${ago} days ago`;
    return ago === 1 ? 'Overdue by 1 day' : `Overdue by ${ago} days`;
  }

  const verb = isEvent ? 'Starts' : 'Due';
  if (days === 0) return `${verb} today`;
  if (days === 1) return `${verb} tomorrow`;
  return `${verb} in ${days} days`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

/** "Today", "Yesterday", "3 days ago", then a plain date. */
export function formatPosted(iso: string, now: Date): string {
  const days = -calendarDaysUntil(iso, now);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return formatDate(iso);
}

const pad = (n: number) => String(n).padStart(2, '0');

/** YYYY-MM-DD for the local day of `d`, as used by <input type="date">. */
export function toDateInput(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** HH:MM for the local time of `d`, as used by <input type="time">. */
export function toTimeInput(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Combines local date and time inputs into an ISO timestamp, or null if either is invalid. */
export function fromLocalInputs(date: string, time: string): string | null {
  const dm = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const tm = /^(\d{2}):(\d{2})$/.exec(time);
  if (!dm || !tm) return null;
  const [y, m, d] = [Number(dm[1]), Number(dm[2]) - 1, Number(dm[3])];
  const result = new Date(y, m, d, Number(tm[1]), Number(tm[2]));
  // Rejects impossible dates such as 2026-02-31, which Date would silently roll over.
  if (result.getFullYear() !== y || result.getMonth() !== m || result.getDate() !== d) return null;
  return result.toISOString();
}

/** Returns the URL only if it is a well-formed http(s) link; anything else (javascript:, data:…) is rejected. */
export function safeUrl(url: string): string | null {
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.href : null;
  } catch {
    return null;
  }
}

export function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

export function uid(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
