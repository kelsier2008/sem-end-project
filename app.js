/*
 * CampusBoard: app logic. Plain JavaScript, no frameworks or build step.
 *
 * How it fits together:
 *   1. Notices live in `state.notices` and are saved to localStorage (key: campusboard:notices).
 *   2. The URL hash picks the page (#dashboard, #notices, #important, #unread, #deadlines, #preferences).
 *   3. `render()` rebuilds the sidebar counts and the current page from state.
 *   4. Clicks are handled in one place (the `click` listener near the bottom) using data-action attributes.
 *   5. Dialogs (details, add/edit form, confirm, phone menu) share one small modal system.
 */
(function () {
  'use strict';

  // ===================================================================
  // Constants
  // ===================================================================
  const STORE_KEY = 'campusboard:notices';
  const THEME_KEY = 'campusboard:theme';
  const HINT_KEY = 'campusboard:hint-dismissed';

  const CATEGORIES = ['Exams', 'Assignments', 'Events', 'Fees'];
  const CATEGORY_ICON = { Exams: 'exam', Assignments: 'clipboard', Events: 'calendarDays', Fees: 'rupee' };
  const LIMITS = { title: 120, summary: 200, body: 5000, department: 60, author: 60, linkLabel: 40, linkUrl: 500 };

  const DAY_MS = 86400000;
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const DAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Pages, in sidebar order. `count` adds a live number badge.
  const ROUTES = {
    dashboard: { label: 'Dashboard', icon: 'grid' },
    notices: { label: 'All Notices', icon: 'inbox' },
    important: { label: 'Important', icon: 'star', count: (c) => c.starred },
    unread: { label: 'Unread', icon: 'mail', count: (c) => c.unread },
    deadlines: { label: 'Upcoming Deadlines', icon: 'calendarClock', count: (c) => c.upcoming },
    preferences: { label: 'Settings', icon: 'sliders' },
  };

  // Feed pages share one layout; Important and Unread hide the filter they already apply.
  const FEEDS = {
    notices: {
      title: 'All notices',
      sub: 'Every announcement from every department, in one feed.',
      base: () => true,
      emptyIcon: 'inbox', emptyTitle: 'No notices yet', emptyText: 'Add the first one, or restore the sample notices in Settings.',
    },
    important: {
      title: 'Important',
      sub: 'Notices you’ve starred, kept in one place.',
      base: (n) => n.starred, hide: 'important',
      emptyIcon: 'star', emptyTitle: 'No important notices yet', emptyText: 'Tap the star on any notice to keep it here.',
    },
    unread: {
      title: 'Unread',
      sub: 'Notices you haven’t opened yet.',
      base: (n) => !n.read, hide: 'read',
      emptyIcon: 'checkCircle', emptyTitle: 'You’re all caught up', emptyText: 'There are no unread notices right now.',
    },
  };

  // Simple line icons (drawn in the style of the open-source Lucide set).
  const ICONS = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>',
    inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
    star: '<path d="M12 2.5l2.94 5.96 6.56.95-4.75 4.63 1.12 6.54L12 17.5l-5.87 3.08 1.12-6.54L2.5 9.41l6.56-.95z"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    mailOpen: '<path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z"/><path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10"/>',
    calendarClock: '<path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5"/><path d="M16 2v4M8 2v4M3 10h5"/><path d="M17.5 17.5 16 16.3V14"/><circle cx="16" cy="16" r="6"/>',
    calendarDays: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>',
    sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    building: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>',
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    alarm: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M5 3 2 6M22 6l-3-3M6.38 18.7 4 21M17.64 18.67 20 21"/>',
    external: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    checkCircle: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    alert: '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/>',
    trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    pencil: '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
    reset: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    arrowRight: '<path d="M5 12h14M12 5l7 7-7 7"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
    sort: '<path d="m21 16-4 4-4-4M17 20V4M3 8l4-4 4 4M7 4v16"/>',
    database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/>',
    contrast: '<circle cx="12" cy="12" r="10"/><path d="M12 18a6 6 0 0 0 0-12v12z"/>',
    keyboard: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    pin: '<path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>',
    exam: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>',
    clipboard: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
    rupee: '<path d="M6 3h12M6 8h12M6 13l8.5 8M6 13h3M9 13c6.667 0 6.667-10 0-10"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  };

  // ===================================================================
  // Small helpers
  // ===================================================================
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = (name, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[name] || ''}</svg>`;
  const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
  const pad = (n) => String(n).padStart(2, '0');
  const ms = (iso) => new Date(iso).getTime();
  const cssEsc = (s) => (window.CSS && CSS.escape ? CSS.escape(s) : String(s).replace(/["\\]/g, '\\$&'));

  function isHttpUrl(s) {
    try {
      const u = new URL(String(s));
      return (u.protocol === 'http:' || u.protocol === 'https:') && !!u.hostname;
    } catch (e) {
      return false;
    }
  }
  function hostOf(url) {
    try { return new URL(url).hostname.replace(/^www\./, ''); } catch (e) { return url; }
  }

  // ---- Dates ----
  function startOfDay(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
  // Calendar days from `from` to `to` (0 = same day, 1 = tomorrow, -1 = yesterday).
  function dayDiff(from, to) { return Math.round((startOfDay(to) - startOfDay(from)) / DAY_MS); }
  function fmtTime(d) {
    const h = d.getHours();
    return `${h % 12 || 12}:${pad(d.getMinutes())} ${h >= 12 ? 'PM' : 'AM'}`;
  }
  function fmtDate(d) {
    const yr = d.getFullYear() !== new Date().getFullYear() ? ` ${d.getFullYear()}` : '';
    return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}${yr}`;
  }
  const fmtDateTime = (d) => `${fmtDate(d)}, ${fmtTime(d)}`;
  const longDate = (d) => `${DAYS_LONG[d.getDay()]} ${d.getDate()} ${MONTHS_LONG[d.getMonth()]}`;
  function fmtPosted(iso) {
    const d = new Date(iso);
    const n = dayDiff(d, new Date());
    if (n === 0) return 'Today';
    if (n === 1) return 'Yesterday';
    if (n > 1 && n <= 7) return `${n} days ago`;
    return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  }
  const toDateInput = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const toTimeInput = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  function combineDateTime(dateStr, timeStr) {
    const dm = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr || '');
    if (!dm) return null;
    const tm = /^(\d{2}):(\d{2})/.exec(timeStr || '23:59');
    const d = new Date(+dm[1], +dm[2] - 1, +dm[3], tm ? +tm[1] : 23, tm ? +tm[2] : 59, 0, 0);
    return isNaN(d) ? null : d;
  }

  // Describes a notice's deadline. Events read as dates ("Starts in…"), others as deadlines ("Due in…").
  function deadlineInfo(n, now = new Date()) {
    if (!n.deadline) return null;
    const date = new Date(n.deadline);
    const isEvent = n.category === 'Events';
    const past = date.getTime() < now.getTime();
    const days = dayDiff(now, date);
    let rel;
    if (past) {
      const ago = days === 0 ? 'today' : days === -1 ? 'yesterday' : `${-days} days ago`;
      rel = isEvent ? `Ended ${ago}` : `Was due ${ago}`;
    } else if (days === 0) rel = isEvent ? 'Starts today' : 'Due today';
    else if (days === 1) rel = isEvent ? 'Starts tomorrow' : 'Due tomorrow';
    else rel = isEvent ? `Starts in ${days} days` : `Due in ${days} days`;
    return { date, past, days, rel };
  }

  // ===================================================================
  // Storage
  // ===================================================================
  const storage = { issue: null }; // null | 'blocked' | 'corrupt'
  let hintDismissedMemory = false;

  function readKey(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function writeKey(key, value) {
    try { localStorage.setItem(key, value); return true; } catch (e) { return false; }
  }

  // Cleans up a notice read from storage so bad data can't break the page.
  function normalize(n) {
    if (!n || typeof n !== 'object' || typeof n.id !== 'string' || typeof n.title !== 'string') return null;
    const str = (v, max) => (typeof v === 'string' ? v : '').slice(0, max);
    const date = (v) => (typeof v === 'string' && !isNaN(new Date(v).getTime()) ? v : null);
    const link = n.link && typeof n.link === 'object' && isHttpUrl(n.link.url)
      ? { label: str(n.link.label, LIMITS.linkLabel) || 'Open link', url: String(n.link.url).slice(0, LIMITS.linkUrl) }
      : null;
    return {
      id: n.id,
      title: str(n.title, LIMITS.title),
      summary: str(n.summary, LIMITS.summary),
      body: str(n.body, LIMITS.body),
      category: CATEGORIES.includes(n.category) ? n.category : 'Exams',
      priority: n.priority === 'high' ? 'high' : 'normal',
      department: str(n.department, LIMITS.department),
      author: str(n.author, LIMITS.author),
      publishedAt: date(n.publishedAt) || new Date().toISOString(),
      deadline: date(n.deadline),
      link,
      read: !!n.read,
      starred: !!n.starred,
      source: n.source === 'user' ? 'user' : 'sample',
      createdAt: date(n.createdAt) || date(n.publishedAt) || new Date().toISOString(),
    };
  }

  // Builds the sample notices with dates relative to today (see data.js).
  function makeSamples() {
    const today = new Date();
    const at = ([days, time]) => {
      const [h, m] = time.split(':').map(Number);
      return new Date(today.getFullYear(), today.getMonth(), today.getDate() + days, h, m, 0, 0).toISOString();
    };
    return (window.CAMPUSBOARD_SAMPLES || []).map((s) => normalize({
      ...s,
      source: 'sample',
      publishedAt: at(s.published),
      createdAt: at(s.published),
      deadline: s.deadline ? at(s.deadline) : null,
    })).filter(Boolean);
  }

  function loadNotices() {
    let raw;
    try {
      raw = localStorage.getItem(STORE_KEY);
    } catch (e) {
      storage.issue = 'blocked';
      return makeSamples();
    }
    if (raw === null) {
      const samples = makeSamples();
      persist(samples);
      return samples;
    }
    try {
      const data = JSON.parse(raw);
      if (!Array.isArray(data)) throw new Error('Saved notices are not a list');
      return data.map(normalize).filter(Boolean);
    } catch (e) {
      storage.issue = 'corrupt';
      return makeSamples();
    }
  }

  function persist(list = state.notices) {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(list));
      if (storage.issue === 'blocked') storage.issue = null;
    } catch (e) {
      storage.issue = 'blocked';
    }
  }

  const hintDismissed = () => hintDismissedMemory || readKey(HINT_KEY) === '1';

  // ===================================================================
  // State and derived data
  // ===================================================================
  const state = {
    notices: [],
    route: 'dashboard',
    search: '',
    filters: {}, // one filter set per feed page
    dlCategory: 'all',
    pastOpen: false,
  };

  const byId = (id) => state.notices.find((n) => n.id === id);
  const isPast = (n, now = new Date()) => !!n.deadline && ms(n.deadline) < now.getTime();
  const upcomingList = (now = new Date()) =>
    state.notices.filter((n) => n.deadline && ms(n.deadline) >= now.getTime()).sort((a, b) => ms(a.deadline) - ms(b.deadline));

  function counts() {
    return {
      unread: state.notices.filter((n) => !n.read).length,
      starred: state.notices.filter((n) => n.starred).length,
      upcoming: upcomingList().length,
    };
  }

  const SORTS = {
    newest: (a, b) => ms(b.publishedAt) - ms(a.publishedAt) || ms(b.createdAt) - ms(a.createdAt),
    oldest: (a, b) => ms(a.publishedAt) - ms(b.publishedAt) || ms(a.createdAt) - ms(b.createdAt),
    // Upcoming deadlines first (nearest first), then past ones, then notices without a deadline.
    deadline: (a, b) => {
      const now = Date.now();
      const group = (n) => (!n.deadline ? 2 : ms(n.deadline) >= now ? 0 : 1);
      const ga = group(a);
      const gb = group(b);
      if (ga !== gb) return ga - gb;
      if (ga === 0) return ms(a.deadline) - ms(b.deadline);
      if (ga === 1) return ms(b.deadline) - ms(a.deadline);
      return SORTS.newest(a, b);
    },
  };

  function matchesSearch(n, query) {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const haystack = [n.title, n.summary, n.body, n.department, n.author, n.category].join(' ').toLowerCase();
    return q.split(/\s+/).every((word) => haystack.includes(word));
  }

  function filtersFor(page) {
    if (!state.filters[page]) state.filters[page] = { category: 'all', read: 'all', importantOnly: false, highOnly: false, sort: 'newest' };
    return state.filters[page];
  }

  // ===================================================================
  // Small UI pieces (return HTML strings)
  // ===================================================================
  function starButton(n) {
    const label = n.starred ? `Remove “${n.title}” from important` : `Star “${n.title}” as important`;
    return `<button class="star-btn" data-action="toggle-star" data-id="${esc(n.id)}" aria-pressed="${n.starred}" aria-label="${esc(label)}" title="${n.starred ? 'Starred' : 'Star as important'}">${icon('star')}</button>`;
  }

  function deadlinePill(n, { strong = false, iconName = 'clock' } = {}) {
    const dl = deadlineInfo(n);
    if (!dl) return '';
    const cls = ['deadline-pill', strong ? 'strong' : '', dl.past ? 'is-past' : '', !dl.past && dl.days === 0 ? 'is-today' : ''].join(' ');
    return `<div class="${cls}">${icon(iconName, 'xs')}<span>${esc(dl.rel)} · ${esc(fmtDateTime(dl.date))}</span></div>`;
  }

  function noticeCard(n) {
    const id = esc(n.id);
    return `
      <article class="notice-card">
        <div class="badges">
          <span class="cat-badge">${esc(n.category)}</span>
          ${n.priority === 'high' ? '<span class="urgent">Urgent</span>' : ''}
          ${n.read ? '' : '<span class="unread-label"><span class="dot"></span>Unread</span>'}
          ${starButton(n)}
        </div>
        <h3 class="notice-title"><button data-action="open" data-id="${id}">${esc(n.title)}</button></h3>
        ${n.summary ? `<p class="notice-summary">${esc(n.summary)}</p>` : ''}
        ${deadlinePill(n)}
        <div class="meta">
          <span>${icon('building', 'xs')}${esc(n.department)}</span>
          <span>${icon('user', 'xs')}${esc(n.author)}</span>
          <span>${icon('clock', 'xs')}${esc(fmtPosted(n.publishedAt))}</span>
        </div>
        <div class="card-actions">
          <button class="text-btn" data-action="toggle-read" data-id="${id}">
            ${n.read ? `${icon('mail', 'xs')}Mark as unread` : `${icon('check', 'xs')}Mark as read`}
          </button>
          <span class="spacer"></span>
          <button class="text-btn strong" data-action="open" data-id="${id}" aria-label="View details: ${esc(n.title)}">View details ${icon('arrowRight', 'xs')}</button>
        </div>
      </article>`;
  }

  function noticeRow(n, meta) {
    return `
      <button class="row" data-action="open" data-id="${esc(n.id)}">
        <span class="tile">${icon(CATEGORY_ICON[n.category], 'sm')}</span>
        <span class="row-text"><span class="row-title">${esc(n.title)}</span><span class="row-meta">${esc(meta)}</span></span>
        ${n.read ? '' : '<span class="unread-dot" aria-hidden="true"></span><span class="sr-only">Unread</span>'}
      </button>`;
  }

  function deadlineRow(n, { withCategory = false, chip = false } = {}) {
    const dl = deadlineInfo(n);
    const d = dl.date;
    const meta = `${dl.rel} · ${fmtTime(d)}${withCategory ? ` · ${n.category}` : ''}`;
    return `
      <button class="row dl${dl.past ? ' is-past' : ''}" data-action="open" data-id="${esc(n.id)}">
        <span class="date-tile" aria-hidden="true"><span class="m">${MONTHS[d.getMonth()].toUpperCase()}</span><span class="d">${d.getDate()}</span></span>
        <span class="row-text"><span class="row-title">${esc(n.title)}</span><span class="row-meta">${esc(meta)}</span></span>
        ${chip ? `<span class="chip">${esc(n.category)}</span>` : ''}
      </button>`;
  }

  function sectionHeader(id, title, href, linkText) {
    return `<div class="section-header"><h2 id="${id}">${esc(title)}</h2>${href ? `<a class="section-link" href="${href}">${esc(linkText)} ${icon('arrowRight', 'xs')}</a>` : ''}</div>`;
  }

  function emptyState(iconName, title, text, action = '', big = false) {
    return `<div class="empty${big ? ' big' : ''}"><span class="tile">${icon(iconName)}</span><h3>${esc(title)}</h3><p>${esc(text)}</p>${action}</div>`;
  }

  const addButton = (cls = 'primary') => `<button class="btn ${cls}" data-action="add">${icon('plus', 'sm')}Add notice</button>`;

  function navHTML(c) {
    return Object.keys(ROUTES).map((key) => {
      const r = ROUTES[key];
      const active = state.route === key;
      const count = r.count ? r.count(c) : 0;
      return `
        <a class="nav-item${active ? ' is-active' : ''}" href="#${key}" data-nav="${key}" ${active ? 'aria-current="page"' : ''} title="${esc(r.label)}">
          ${icon(r.icon)}<span class="nav-label">${esc(r.label)}</span>
          ${count ? `<span class="nav-count"><span class="sr-only">(</span>${count}<span class="sr-only">)</span></span>` : ''}
        </a>`;
    }).join('');
  }

  // ===================================================================
  // Pages
  // ===================================================================
  function summaryText(unread, soon) {
    if (!unread && !soon) return 'You’re all caught up: no unread notices and no deadlines in the next three days.';
    const a = unread ? plural(unread, 'unread notice') : 'no unread notices';
    const b = soon ? `${plural(soon, 'deadline')} in the next three days` : 'no deadlines in the next three days';
    return `You have ${a} and ${b}.`;
  }

  function statCard(href, iconName, value, label, hint) {
    return `
      <a class="stat" href="${href}">
        <span class="tile">${icon(iconName)}</span>
        <span class="stat-value">${value}</span>
        <span class="stat-label">${esc(label)}</span>
        <span class="stat-hint">${esc(hint)}</span>
      </a>`;
  }

  function viewDashboard() {
    const now = new Date();
    const c = counts();
    const upcoming = upcomingList(now);
    const soon = upcoming.filter((n) => dayDiff(now, new Date(n.deadline)) <= 2).length;
    const high = state.notices.filter((n) => n.priority === 'high' && !isPast(n, now)).sort(SORTS.deadline).slice(0, 4);
    const latest = [...state.notices].sort(SORTS.newest).slice(0, 5);
    const mine = state.notices.filter((n) => n.source === 'user').sort((a, b) => ms(b.createdAt) - ms(a.createdAt)).slice(0, 4);
    const next = upcoming[0] ? deadlineInfo(upcoming[0], now) : null;
    const nextHint = !next ? 'Nothing coming up'
      : next.days === 0 ? 'Next one is due today'
        : next.days === 1 ? 'Next one is due tomorrow'
          : `Next one is in ${next.days} days`;
    const showHint = !hintDismissed() && state.notices.some((n) => n.source === 'sample');

    return `
      <section class="hero" aria-labelledby="hero-title">
        <p class="hero-date">${esc(longDate(now))}</p>
        <h1 id="hero-title">Stay updated. Never miss a deadline.</h1>
        <p class="hero-sub">Your campus announcements, all in one place.</p>
        <p class="hero-summary">${icon('bell', 'sm')}<span>${esc(summaryText(c.unread, soon))}</span></p>
        <div class="hero-actions">
          ${addButton()}
          <a class="btn secondary" href="#deadlines">View deadlines</a>
        </div>
      </section>

      <section class="stats" aria-label="Summary">
        ${statCard('#notices', 'inbox', state.notices.length, 'Total notices', 'Across all departments')}
        ${statCard('#unread', 'mail', c.unread, 'Unread notices', c.unread ? 'Waiting for you' : 'All caught up')}
        ${statCard('#important', 'star', c.starred, 'Important', 'Starred by you')}
        ${statCard('#deadlines', 'calendarClock', c.upcoming, 'Upcoming deadlines', nextHint)}
      </section>

      ${showHint ? `
        <div class="hint" role="note">
          ${icon('info')}
          <p>You’re viewing sample announcements. Add your own notices, or restore the samples anytime in <a href="#preferences">Settings</a>.</p>
          <button class="icon-btn sm" data-action="dismiss-hint" aria-label="Dismiss this message">${icon('x', 'sm')}</button>
        </div>` : ''}

      <div class="columns">
        <div class="col">
          <section class="section" aria-labelledby="high-title">
            ${sectionHeader('high-title', 'High-priority announcements', '#notices', 'All notices')}
            ${high.length
              ? `<div class="card-grid">${high.map(noticeCard).join('')}</div>`
              : emptyState('checkCircle', 'No high-priority notices', 'Urgent announcements will appear here.')}
          </section>
          <section class="section" aria-labelledby="latest-title">
            ${sectionHeader('latest-title', 'Latest notices', '#notices', 'View all')}
            ${latest.length
              ? `<div class="panel list-panel">${latest.map((n) => noticeRow(n, `${n.department} · ${fmtPosted(n.publishedAt)}`)).join('')}</div>`
              : emptyState('inbox', 'No notices yet', 'Add a notice or restore the samples in Settings.')}
          </section>
        </div>

        <div class="col side">
          <section class="panel widget" aria-labelledby="dl-title">
            ${sectionHeader('dl-title', 'Upcoming deadlines', '#deadlines', upcoming.length ? `See all ${upcoming.length}` : 'Open')}
            ${upcoming.length
              ? upcoming.slice(0, 5).map((n) => deadlineRow(n, { withCategory: true })).join('')
              : '<p class="widget-empty">No upcoming deadlines. Enjoy the calm.</p>'}
          </section>
          <section class="panel mine" aria-labelledby="mine-title">
            ${sectionHeader('mine-title', 'Recently added by you')}
            ${mine.length
              ? `<div class="list">${mine.map((n) => noticeRow(n, `${n.category} · ${fmtPosted(n.publishedAt)}`)).join('')}</div>`
              : emptyState('pencil', 'Nothing added yet', 'Notices you post from this browser appear here.', addButton('secondary'))}
          </section>
        </div>
      </div>`;
  }

  function viewFeed(page) {
    const cfg = FEEDS[page];
    const f = filtersFor(page);
    const base = state.notices.filter(cfg.base);

    // Apply search and every filter except category, so the chips can show counts.
    let list = base.filter((n) => matchesSearch(n, state.search));
    if (cfg.hide !== 'read' && f.read !== 'all') list = list.filter((n) => (f.read === 'read' ? n.read : !n.read));
    if (cfg.hide !== 'important' && f.importantOnly) list = list.filter((n) => n.starred);
    if (f.highOnly) list = list.filter((n) => n.priority === 'high');
    const catCount = { all: list.length };
    CATEGORIES.forEach((cat) => { catCount[cat] = list.filter((n) => n.category === cat).length; });
    if (f.category !== 'all') list = list.filter((n) => n.category === f.category);
    list.sort(SORTS[f.sort] || SORTS.newest);

    const chip = (value, label) =>
      `<button class="chip" data-action="category" data-value="${value}" aria-pressed="${f.category === value}">${esc(label)}<span class="count">${catCount[value]}</span></button>`;
    const readBtn = (value, label) =>
      `<button data-action="read-filter" data-value="${value}" aria-pressed="${f.read === value}">${label}</button>`;

    let results;
    if (list.length) {
      results = `<div class="card-grid">${list.map(noticeCard).join('')}</div>`;
    } else if (!base.length) {
      results = emptyState(cfg.emptyIcon, cfg.emptyTitle, cfg.emptyText, page === 'notices' ? addButton() : '', true);
    } else {
      results = emptyState('search', 'No notices match', 'Try a different search, or clear the filters to see everything.',
        '<button class="btn secondary" data-action="clear-filters">Clear filters</button>', true);
    }

    return `
      <div class="page-header">
        <div><h1>${esc(cfg.title)}</h1><p>${esc(cfg.sub)}</p></div>
        ${addButton()}
      </div>
      <div class="chips scroll" role="group" aria-label="Filter by category">
        ${chip('all', 'All categories')}
        ${CATEGORIES.map((cat) => chip(cat, cat)).join('')}
      </div>
      <div class="filters">
        ${cfg.hide !== 'read' ? `<div class="segmented" role="group" aria-label="Read status">${readBtn('all', 'All')}${readBtn('unread', 'Unread')}${readBtn('read', 'Read')}</div>` : ''}
        ${cfg.hide !== 'important' ? `<button class="btn secondary" data-action="toggle-filter" data-value="importantOnly" aria-pressed="${f.importantOnly}">${icon('star', 'sm star-fill')}Important only</button>` : ''}
        <button class="btn secondary" data-action="toggle-filter" data-value="highOnly" aria-pressed="${f.highOnly}">${icon('alert', 'sm')}High priority only</button>
        <label class="sort">
          <span class="sr-only">Sort notices</span>
          ${icon('sort', 'sm lead')}
          <select data-action="sort">
            <option value="newest"${f.sort === 'newest' ? ' selected' : ''}>Newest first</option>
            <option value="oldest"${f.sort === 'oldest' ? ' selected' : ''}>Oldest first</option>
            <option value="deadline"${f.sort === 'deadline' ? ' selected' : ''}>Nearest deadline</option>
          </select>
          ${icon('chevron', 'sm trail')}
        </label>
      </div>
      <p class="result-count">Showing ${plural(list.length, 'notice')}${state.search.trim() ? ` for “${esc(state.search.trim())}”` : ''}</p>
      ${results}`;
  }

  function viewDeadlines() {
    const now = new Date();
    const cat = state.dlCategory;
    const withDeadline = state.notices.filter((n) => n.deadline && matchesSearch(n, state.search) && (cat === 'all' || n.category === cat));
    const upcoming = withDeadline.filter((n) => !isPast(n, now)).sort((a, b) => ms(a.deadline) - ms(b.deadline));
    const past = withDeadline.filter((n) => isPast(n, now)).sort((a, b) => ms(b.deadline) - ms(a.deadline));
    const days = (n) => dayDiff(now, new Date(n.deadline));
    const today = upcoming.filter((n) => days(n) === 0);
    const week = upcoming.filter((n) => days(n) >= 1 && days(n) <= 7);
    const later = upcoming.filter((n) => days(n) > 7);
    const filtered = cat !== 'all' || !!state.search.trim();

    const chip = (value, label) => `<button class="chip" data-action="dl-category" data-value="${value}" aria-pressed="${cat === value}">${esc(label)}</button>`;
    const group = (title, items, isToday) => (items.length ? `
      <section class="group${isToday ? ' is-today' : ''}" aria-label="${esc(title)}">
        <div class="group-header">${isToday ? '<span class="dot"></span>' : ''}<span>${esc(title)}</span><span class="count-pill">${items.length}</span></div>
        ${items.map((n) => deadlineRow(n, { chip: true })).join('')}
      </section>` : '');

    const subtitle = upcoming.length
      ? `${plural(upcoming.length, 'upcoming deadline')} · ${today.length} due today, nearest first.`
      : 'No upcoming deadlines.';

    return `
      <div class="page-header"><div><h1>Upcoming deadlines</h1><p>${esc(subtitle)}</p></div></div>
      <div class="chips scroll" role="group" aria-label="Filter by category">
        ${chip('all', 'All categories')}${CATEGORIES.map((c) => chip(c, c)).join('')}
      </div>
      ${upcoming.length ? '' : emptyState('calendarClock', filtered ? 'No deadlines match' : 'No upcoming deadlines',
        filtered ? 'Try another category or clear your search.' : 'Notices with a deadline will show up here, nearest first.',
        filtered ? '<button class="btn secondary" data-action="clear-filters">Clear filters</button>' : '', true)}
      ${group('Due today', today, true)}
      ${group('Next 7 days', week, false)}
      ${group('Later', later, false)}
      ${past.length ? `
        <details class="group past"${state.pastOpen ? ' open' : ''}>
          <summary>Past deadlines <span class="count-pill">${past.length}</span>${icon('chevron', 'sm')}</summary>
          <div class="rows">${past.map((n) => deadlineRow(n, { chip: true })).join('')}</div>
        </details>` : ''}`;
  }

  function viewSettings() {
    const theme = currentTheme();
    const total = state.notices.length;
    const mine = state.notices.filter((n) => n.source === 'user').length;
    const starred = state.notices.filter((n) => n.starred).length;
    const status = storage.issue === 'blocked'
      ? `<p class="storage-status warn">${icon('alert', 'sm')}This browser is blocking storage, so changes will be lost when you close this tab.</p>`
      : storage.issue === 'corrupt'
        ? `<p class="storage-status warn">${icon('alert', 'sm')}Saved data couldn’t be read, so the sample notices were loaded instead.</p>`
        : `<p class="storage-status ok">${icon('checkCircle', 'sm')}Changes are saved automatically in this browser.</p>`;
    const themeBtn = (value, label) => `<button data-action="set-theme" data-value="${value}" aria-pressed="${theme === value}">${label}</button>`;
    const panel = (iconName, title, sub, body) => `
      <section class="panel settings-panel" aria-label="${esc(title)}">
        <div class="panel-header"><span class="tile">${icon(iconName)}</span><div><h2>${esc(title)}</h2><p>${esc(sub)}</p></div></div>
        ${body}
      </section>`;

    return `
      <div class="settings">
        <div class="page-header"><div><h1>Settings</h1><p>Appearance, your saved data, and how this prototype works.</p></div></div>
        ${panel('contrast', 'Appearance', 'Choose how CampusBoard looks on this device.',
          `<div class="segmented" role="group" aria-label="Theme" style="align-self:flex-start">${themeBtn('light', 'Light')}${themeBtn('dark', 'Dark')}</div>`)}
        ${panel('database', 'Your data', 'Where your notices, read status and stars are kept.', `
          ${status}
          <p class="settings-text">CampusBoard stores everything in the browser’s localStorage under the key <code>${STORE_KEY}</code>. That data belongs to this browser on this device only. It isn’t shared with classmates, other browsers or other devices.</p>
          <div class="counts">
            <div><strong>${total}</strong><span>Notices</span></div>
            <div><strong>${mine}</strong><span>Added by you</span></div>
            <div><strong>${starred}</strong><span>Starred</span></div>
          </div>
          <div class="reset-row">
            <div><strong>Reset to demo data</strong><p>Restore the original sample notices and clear your changes.</p></div>
            <button class="btn secondary" data-action="reset">${icon('reset', 'sm')}Reset data</button>
          </div>`)}
        ${panel('info', 'About this prototype', 'What CampusBoard does and doesn’t do yet.', `
          <ul class="points">
            <li>${icon('user', 'sm')}<span>No accounts or roles. You can edit and delete only notices added in this browser; sample notices are read-only.</span></li>
            <li>${icon('bell', 'sm')}<span>Not real-time. Notices you add aren’t sent to other students.</span></li>
            <li>${icon('shield', 'sm')}<span>Sample content is fictional, and its links point to example.com placeholders.</span></li>
          </ul>`)}
        ${panel('keyboard', 'Keyboard shortcuts', 'Move faster without the mouse.', `
          <div class="shortcuts">
            <div class="shortcut"><kbd class="key">/</kbd>Search notices</div>
            <div class="shortcut"><kbd class="key">N</kbd>Add a notice</div>
            <div class="shortcut"><kbd class="key">Esc</kbd>Close a dialog or menu</div>
          </div>`)}
      </div>`;
  }

  const VIEWS = {
    dashboard: viewDashboard,
    notices: () => viewFeed('notices'),
    important: () => viewFeed('important'),
    unread: () => viewFeed('unread'),
    deadlines: viewDeadlines,
    preferences: viewSettings,
  };

  // ===================================================================
  // Rendering and focus
  // ===================================================================
  const els = {};

  // Remembers which control had focus so it can be focused again after the page is rebuilt.
  function focusSelector(el) {
    if (!el || !el.dataset) return null;
    const parts = ['action', 'id', 'value', 'nav']
      .filter((k) => el.dataset[k] != null)
      .map((k) => `[data-${k}="${cssEsc(el.dataset[k])}"]`);
    if (parts.length) return parts.join('');
    return el.id ? `#${cssEsc(el.id)}` : null;
  }
  function captureFocus(root, el = document.activeElement) {
    if (!el || el === document.body || !root || !root.contains(el)) return null;
    const sel = focusSelector(el);
    if (!sel) return null;
    return { el, sel, index: Array.prototype.indexOf.call(root.querySelectorAll(sel), el) };
  }
  function restoreFocus(info, root) {
    if (!info) return false;
    let el = info.el && info.el.isConnected && !info.el.closest('[inert]') ? info.el : null;
    if (!el && info.sel) {
      const all = root.querySelectorAll(info.sel);
      el = all[info.index] || all[0] || null;
    }
    if (el) { el.focus({ preventScroll: true }); return true; }
    return false;
  }

  function render() {
    const focus = captureFocus(els.app);
    els.nav.innerHTML = navHTML(counts());
    els.view.innerHTML = VIEWS[state.route]();
    if (els.search.value !== state.search) els.search.value = state.search;
    document.title = state.route === 'dashboard' ? 'CampusBoard' : `${ROUTES[state.route].label} · CampusBoard`;
    updateThemeButton();
    restoreFocus(focus, els.app);
  }

  function refreshModals() {
    modals.forEach((m) => { if (m.refresh) m.refresh(); });
  }

  function renderAll() {
    render();
    refreshModals();
  }

  // ===================================================================
  // Routing
  // ===================================================================
  function routeFromHash() {
    const h = decodeURIComponent(location.hash.replace(/^#/, ''));
    return Object.prototype.hasOwnProperty.call(ROUTES, h) ? h : 'dashboard';
  }
  function go(route) {
    if (location.hash.replace(/^#/, '') === route) onRoute();
    else location.hash = route;
  }
  function onRoute() {
    const prev = state.route;
    state.route = routeFromHash();
    const top = modals[modals.length - 1];
    if (top && top.variant === 'drawer') closeTop({ restore: false });
    render();
    if (prev !== state.route) window.scrollTo(0, 0);
  }

  // ===================================================================
  // Theme
  // ===================================================================
  const savedTheme = () => { const t = readKey(THEME_KEY); return t === 'light' || t === 'dark' ? t : null; };
  const currentTheme = () => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
  function setTheme(theme, remember = true) {
    document.documentElement.dataset.theme = theme;
    if (remember) writeKey(THEME_KEY, theme);
    updateThemeButton();
    if (state.route === 'preferences') render();
  }
  function updateThemeButton() {
    const dark = currentTheme() === 'dark';
    document.querySelectorAll('[data-action="theme-toggle"]').forEach((b) => {
      b.innerHTML = icon(dark ? 'sun' : 'moon');
      b.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
      b.title = dark ? 'Light theme' : 'Dark theme';
    });
  }

  // ===================================================================
  // Modal system (details, form, confirm, phone menu)
  // ===================================================================
  const modals = [];
  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  const focusables = (root) => Array.from(root.querySelectorAll(FOCUSABLE)).filter((el) => el.getClientRects().length);

  function openModal({ html, variant = 'dialog', labelledBy, label, role = 'dialog', opener, dismissOnBackdrop = true, initialFocus }) {
    const wrap = document.createElement('div');
    wrap.className = `modal-backdrop ${variant}-backdrop`;
    const box = document.createElement('div');
    box.className = variant === 'drawer' ? 'drawer' : `modal${variant === 'confirm' ? ' sm' : ''}`;
    box.setAttribute('role', role);
    box.setAttribute('aria-modal', 'true');
    if (labelledBy) box.setAttribute('aria-labelledby', labelledBy);
    else if (label) box.setAttribute('aria-label', label);
    box.innerHTML = html;
    wrap.appendChild(box);

    const entry = { wrap, box, variant, dismissOnBackdrop, opener: opener || captureFocus(document.body), onRequestClose: null, refresh: null };

    // Close on a click outside the dialog (press and release both on the backdrop).
    let downOnBackdrop = false;
    wrap.addEventListener('mousedown', (e) => { downOnBackdrop = e.target === wrap; });
    wrap.addEventListener('click', (e) => {
      if (e.target === wrap && downOnBackdrop && entry.dismissOnBackdrop && modals[modals.length - 1] === entry) requestCloseTop();
    });

    const below = modals[modals.length - 1];
    if (below) below.wrap.inert = true;
    else { els.app.inert = true; document.body.classList.add('has-modal'); }
    els.modalRoot.appendChild(wrap);
    modals.push(entry);

    const target = (initialFocus && box.querySelector(initialFocus)) || focusables(box)[0];
    if (target) target.focus();
    return entry;
  }

  function closeTop({ restore = true } = {}) {
    const m = modals.pop();
    if (!m) return;
    m.wrap.remove();
    const below = modals[modals.length - 1];
    if (below) below.wrap.inert = false;
    else { els.app.inert = false; document.body.classList.remove('has-modal'); }
    if (restore && !restoreFocus(m.opener, below ? below.box : document.body)) {
      if (!below) els.view.focus({ preventScroll: true });
    }
  }

  function requestCloseTop() {
    const m = modals[modals.length - 1];
    if (!m) return;
    if (m.onRequestClose) m.onRequestClose();
    else closeTop();
  }

  function trapTab(e) {
    const m = modals[modals.length - 1];
    const list = focusables(m.box);
    if (!list.length) { e.preventDefault(); return; }
    const first = list[0];
    const last = list[list.length - 1];
    const inside = m.box.contains(document.activeElement);
    if (e.shiftKey && (document.activeElement === first || !inside)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && (document.activeElement === last || !inside)) { e.preventDefault(); first.focus(); }
  }

  // A styled replacement for window.confirm(). Resolves to true or false.
  function confirmDialog({ title, message, confirmLabel = 'Confirm', danger = false }) {
    return new Promise((resolve) => {
      const html = `
        <div class="modal-body confirm-body">
          <h2 id="confirm-title" class="modal-title">${esc(title)}</h2>
          <p id="confirm-message" class="modal-sub">${esc(message)}</p>
        </div>
        <div class="modal-footer confirm-footer">
          <span class="spacer"></span>
          <button class="btn secondary" data-confirm="no">Cancel</button>
          <button class="btn ${danger ? 'danger' : 'primary'}" data-confirm="yes">${esc(confirmLabel)}</button>
        </div>`;
      let done = false;
      const entry = openModal({ html, variant: 'confirm', role: 'alertdialog', labelledBy: 'confirm-title', initialFocus: '[data-confirm="no"]' });
      entry.box.setAttribute('aria-describedby', 'confirm-message');
      const finish = (value) => {
        if (done) return;
        done = true;
        closeTop();
        resolve(value);
      };
      entry.onRequestClose = () => finish(false);
      entry.box.addEventListener('click', (e) => {
        const b = e.target.closest('[data-confirm]');
        if (b) finish(b.dataset.confirm === 'yes');
      });
    });
  }

  // ---- Toasts ----
  function toast(message) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = `${icon('checkCircle', 'sm')}<span>${esc(message)}</span>`;
    els.toasts.appendChild(t);
    setTimeout(() => {
      t.classList.add('out');
      setTimeout(() => t.remove(), 250);
    }, 2600);
  }

  // ---- Phone menu ----
  function openDrawer(opener) {
    const html = `
      <div class="drawer-header">
        <span class="logo-mark">${icon('pin')}</span><span>CampusBoard</span>
        <span class="spacer"></span>
        <button class="icon-btn sm" data-action="close-modal" aria-label="Close menu">${icon('x')}</button>
      </div>
      <nav class="nav" aria-label="Main">${navHTML(counts())}</nav>
      ${addButton('primary block')}
      <div class="storage-note"><strong>Prototype</strong><p>Notices are saved in this browser only and aren’t shared with others.</p></div>`;
    openModal({ html, variant: 'drawer', label: 'Menu', opener: captureFocus(document.body, opener) });
  }

  // ===================================================================
  // Notice details
  // ===================================================================
  function detailsHTML(n) {
    const dl = deadlineInfo(n);
    const mine = n.source === 'user';
    const link = n.link && isHttpUrl(n.link.url) ? n.link : null;
    const id = esc(n.id);
    return `
      <div class="modal-header">
        <div class="modal-titles">
          <div class="badges">
            <span class="chip">${esc(n.category)}</span>
            ${n.priority === 'high' ? '<span class="urgent">Urgent</span>' : ''}
          </div>
          <h2 id="details-title" class="modal-title">${esc(n.title)}</h2>
        </div>
        <button class="icon-btn sm" data-action="close-modal" aria-label="Close">${icon('x')}</button>
      </div>
      <div class="modal-body">
        ${deadlinePill(n, { strong: true, iconName: 'alarm' })}
        ${n.summary ? `<p class="details-summary">${esc(n.summary)}</p>` : ''}
        <div class="details-body">${esc(n.body)}</div>
        ${link ? `
          <a class="action-link" href="${esc(link.url)}" target="_blank" rel="noopener noreferrer">
            <span><strong>${esc(link.label || 'Open link')}</strong><small>${esc(hostOf(link.url))} · opens in a new tab</small></span>
            ${icon('external', 'sm')}
          </a>` : ''}
        <dl class="details-grid">
          <div><dt>Department</dt><dd>${esc(n.department)}</dd></div>
          <div><dt>Posted by</dt><dd>${esc(n.author)}</dd></div>
          <div><dt>Published</dt><dd>${esc(fmtDateTime(new Date(n.publishedAt)))}</dd></div>
          <div><dt>Deadline</dt><dd>${dl ? `${esc(fmtDateTime(dl.date))} (${esc(dl.rel.toLowerCase())})` : 'No deadline'}</dd></div>
          <div><dt>Priority</dt><dd>${n.priority === 'high' ? 'High (urgent)' : 'Normal'}</dd></div>
          <div><dt>Status</dt><dd>${n.read ? 'Read' : 'Unread'}${n.starred ? ' · Starred' : ''}</dd></div>
        </dl>
        <p class="source-note">${icon('info', 'sm')}<span>${mine
          ? 'You added this notice in this browser. Only you can see it, edit it or delete it.'
          : 'Sample announcement for this prototype. It is fictional and can’t be edited.'}</span></p>
      </div>
      <div class="modal-footer">
        <button class="btn secondary" data-action="toggle-star" data-id="${id}" aria-pressed="${n.starred}">${icon('star', 'sm star-fill')}${n.starred ? 'Starred' : 'Star as important'}</button>
        <button class="btn secondary" data-action="toggle-read" data-id="${id}">${n.read ? `${icon('mail', 'sm')}Mark as unread` : `${icon('mailOpen', 'sm')}Mark as read`}</button>
        <span class="spacer"></span>
        ${mine ? `
          <button class="btn secondary" data-action="delete" data-id="${id}">${icon('trash', 'sm')}Delete</button>
          <button class="btn primary" data-action="edit" data-id="${id}">${icon('pencil', 'sm')}Edit</button>` : ''}
      </div>`;
  }

  function openDetails(id, opener) {
    const n = byId(id);
    if (!n) return;
    // Opening a notice marks it as read.
    if (!n.read) {
      n.read = true;
      persist();
      render();
    }
    const entry = openModal({ html: detailsHTML(n), labelledBy: 'details-title', opener, initialFocus: '[data-action="close-modal"]' });
    entry.noticeId = id;
    entry.refresh = () => {
      const current = byId(id);
      if (!current) return;
      const focus = captureFocus(entry.box);
      entry.box.innerHTML = detailsHTML(current);
      restoreFocus(focus, entry.box);
    };
  }

  async function deleteNotice(id) {
    const n = byId(id);
    if (!n || n.source !== 'user') return;
    const ok = await confirmDialog({
      title: 'Delete this notice?',
      message: `“${n.title}” will be removed from this browser. This can’t be undone.`,
      confirmLabel: 'Delete notice',
      danger: true,
    });
    if (!ok) return;
    state.notices = state.notices.filter((x) => x.id !== id);
    persist();
    render();
    const top = modals[modals.length - 1];
    if (top && top.noticeId === id) closeTop();
    toast('Notice deleted');
  }

  // ===================================================================
  // Add / edit form
  // ===================================================================
  const FIELD_IDS = {
    title: 'f-title', summary: 'f-summary', body: 'f-body', category: 'f-category',
    department: 'f-department', author: 'f-author', publishDate: 'f-publish', deadlineDate: 'f-deadline-date', linkUrl: 'f-link-url',
  };
  const FIELD_LABELS = {
    title: 'Title', summary: 'Short summary', body: 'Full notice', category: 'Category',
    department: 'Department', author: 'Posted by', publishDate: 'Publishing date', deadlineDate: 'Deadline', linkUrl: 'Link address',
  };

  function formHTML(n) {
    const editing = !!n;
    const dl = n && n.deadline ? new Date(n.deadline) : null;
    const v = {
      title: n ? n.title : '',
      summary: n ? n.summary : '',
      body: n ? n.body : '',
      category: n ? n.category : 'Assignments',
      priority: n ? n.priority : 'normal',
      department: n ? n.department : '',
      author: n ? n.author : '',
      publishDate: toDateInput(n ? new Date(n.publishedAt) : new Date()),
      deadlineDate: dl ? toDateInput(dl) : '',
      deadlineTime: dl ? toTimeInput(dl) : '',
      linkLabel: n && n.link ? n.link.label : '',
      linkUrl: n && n.link ? n.link.url : '',
    };
    const describedBy = (key, hint) => `aria-describedby="err-${key}${hint ? ` hint-${key}` : ''}"`;
    const labelRow = (key, label, { counter, optional } = {}) => `
      <div class="label-row">
        <label for="${FIELD_IDS[key] || `f-${key}`}">${label}</label>
        ${optional ? '<span class="optional">Optional</span>' : ''}
        ${counter ? `<span class="counter" data-counter="${key}" aria-hidden="true"></span>` : ''}
      </div>`;
    const error = (key) => `<p class="field-error" id="err-${key}" hidden></p>`;
    const text = (key, label, placeholder, extra = '') => `
      <div class="field">
        ${labelRow(key, label)}
        <input class="input" id="${FIELD_IDS[key]}" name="${key}" type="text" maxlength="${LIMITS[key]}" placeholder="${esc(placeholder)}" value="${esc(v[key])}" autocomplete="off" aria-required="true" ${describedBy(key)} ${extra}>
        ${error(key)}
      </div>`;

    return `
      <div class="modal-header">
        <div class="modal-titles">
          <h2 id="form-title" class="modal-title">${editing ? 'Edit notice' : 'Add a notice'}</h2>
          <p class="modal-sub">${editing ? 'Update the notice you added. Changes are saved in this browser.' : 'Share an announcement or deadline with your class.'}</p>
        </div>
        <button type="button" class="icon-btn sm" data-action="close-modal" aria-label="Close">${icon('x')}</button>
      </div>

      <form id="notice-form" class="modal-body form" novalidate>
        <div class="form-errors" id="form-errors" tabindex="-1" hidden></div>

        <div class="field">
          ${labelRow('title', 'Title', { counter: true })}
          <input class="input" id="f-title" name="title" type="text" maxlength="${LIMITS.title}" placeholder="e.g. Physics lab report submission" value="${esc(v.title)}" autocomplete="off" aria-required="true" ${describedBy('title')}>
          ${error('title')}
        </div>

        <div class="field">
          ${labelRow('summary', 'Short summary', { counter: true })}
          <textarea class="input" id="f-summary" name="summary" rows="2" maxlength="${LIMITS.summary}" placeholder="One or two sentences students should see first." aria-required="true" ${describedBy('summary', true)}>${esc(v.summary)}</textarea>
          <p class="field-hint" id="hint-summary">Shown on the notice card.</p>
          ${error('summary')}
        </div>

        <div class="field">
          ${labelRow('body', 'Full notice', { counter: true })}
          <textarea class="input" id="f-body" name="body" rows="6" maxlength="${LIMITS.body}" placeholder="All the details: what, where, requirements, contact…" aria-required="true" ${describedBy('body')}>${esc(v.body)}</textarea>
          ${error('body')}
        </div>

        <div class="form-row">
          <div class="field">
            ${labelRow('category', 'Category')}
            <div class="select-wrap">
              <select class="input" id="f-category" name="category" ${describedBy('category')}>
                ${CATEGORIES.map((c) => `<option value="${c}"${v.category === c ? ' selected' : ''}>${c}</option>`).join('')}
              </select>
              ${icon('chevron', 'sm')}
            </div>
            ${error('category')}
          </div>
          <div class="field">
            <span class="group-label" id="priority-label">Priority</span>
            <div class="segmented full" role="radiogroup" aria-labelledby="priority-label">
              <label><input type="radio" name="priority" value="high"${v.priority === 'high' ? ' checked' : ''}>High (urgent)</label>
              <label><input type="radio" name="priority" value="normal"${v.priority !== 'high' ? ' checked' : ''}>Normal</label>
            </div>
          </div>
        </div>

        <div class="form-row">
          ${text('department', 'Department', 'e.g. Computer Engineering')}
          ${text('author', 'Posted by', 'e.g. Class Representative')}
        </div>

        <div class="form-row">
          <div class="field">
            ${labelRow('publishDate', 'Publishing date')}
            <input class="input" id="f-publish" name="publishDate" type="date" value="${esc(v.publishDate)}" aria-required="true" ${describedBy('publishDate')}>
            ${error('publishDate')}
          </div>
          <div class="field">
            ${labelRow('deadlineDate', 'Deadline', { optional: true })}
            <div class="dt-row">
              <input class="input" id="f-deadline-date" name="deadlineDate" type="date" value="${esc(v.deadlineDate)}" ${describedBy('deadlineDate', true)}>
              <input class="input" id="f-deadline-time" name="deadlineTime" type="time" value="${esc(v.deadlineTime)}" aria-label="Deadline time (optional)">
            </div>
            <p class="field-hint" id="hint-deadlineDate">Time defaults to 11:59 PM if left empty.</p>
            ${error('deadlineDate')}
          </div>
        </div>

        <div class="link-group" role="group" aria-labelledby="link-legend">
          <div class="label-row"><span class="group-label" id="link-legend">Action link</span><span class="optional">Optional</span></div>
          <div class="form-row">
            <div class="field">
              <div class="label-row"><label for="f-link-label">Button label</label></div>
              <input class="input" id="f-link-label" name="linkLabel" type="text" maxlength="${LIMITS.linkLabel}" placeholder="e.g. Submission form" value="${esc(v.linkLabel)}" autocomplete="off">
            </div>
            <div class="field">
              ${labelRow('linkUrl', 'Link address')}
              <input class="input" id="f-link-url" name="linkUrl" type="url" inputmode="url" maxlength="${LIMITS.linkUrl}" placeholder="https://" value="${esc(v.linkUrl)}" autocomplete="off" ${describedBy('linkUrl')}>
              ${error('linkUrl')}
            </div>
          </div>
        </div>
      </form>

      <div class="modal-footer">
        <span class="footer-note">${icon('database', 'xs')}Saved only in this browser</span>
        <span class="spacer"></span>
        <button type="button" class="btn secondary" data-action="close-modal">Cancel</button>
        <button type="submit" form="notice-form" class="btn primary">${editing ? 'Save changes' : 'Publish notice'}</button>
      </div>`;
  }

  function readForm(form) {
    const val = (name) => (form.elements[name] ? String(form.elements[name].value) : '');
    let linkUrl = val('linkUrl').trim();
    if (/^https?:\/\/$/i.test(linkUrl)) linkUrl = ''; // just the placeholder prefix
    return {
      title: val('title').trim(),
      summary: val('summary').trim(),
      body: val('body').trim(),
      category: val('category'),
      priority: val('priority') === 'high' ? 'high' : 'normal',
      department: val('department').trim(),
      author: val('author').trim(),
      publishDate: val('publishDate'),
      deadlineDate: val('deadlineDate'),
      deadlineTime: val('deadlineTime'),
      linkLabel: val('linkLabel').trim(),
      linkUrl,
    };
  }

  function validate(v, original) {
    const e = {};
    if (v.title.length < 3) e.title = 'Enter a title of at least 3 characters.';
    if (v.summary.length < 10) e.summary = 'Write a summary of at least 10 characters.';
    if (v.body.length < 20) e.body = 'Write the full notice, at least 20 characters.';
    if (!CATEGORIES.includes(v.category)) e.category = 'Choose a category.';
    if (!v.department) e.department = 'Enter the department.';
    if (!v.author) e.author = 'Enter who is posting this notice.';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v.publishDate)) e.publishDate = 'Choose a publishing date.';
    if (!v.deadlineDate && v.deadlineTime) {
      e.deadlineDate = 'Add a date for this deadline, or clear the time.';
    } else if (v.deadlineDate) {
      const dl = combineDateTime(v.deadlineDate, v.deadlineTime);
      const unchanged = original && original.deadline && dl && ms(original.deadline) === dl.getTime();
      if (!dl) e.deadlineDate = 'Enter a valid date.';
      else if (!e.publishDate && v.deadlineDate < v.publishDate) e.deadlineDate = 'The deadline can’t be before the publishing date.';
      else if (dl.getTime() < Date.now() && !unchanged) e.deadlineDate = 'This deadline has already passed. Pick a later date or time.';
    }
    if (v.linkUrl && !isHttpUrl(v.linkUrl)) e.linkUrl = 'Enter a full link that starts with http:// or https://';
    else if (!v.linkUrl && v.linkLabel) e.linkUrl = 'Add the link address, or clear the button label.';
    return e;
  }

  function showErrors(form, errors, { focusFirst, editing }) {
    Object.keys(FIELD_IDS).forEach((key) => {
      const input = form.querySelector(`#${FIELD_IDS[key]}`);
      const msg = form.querySelector(`#err-${key}`);
      if (!input || !msg) return;
      if (errors[key]) {
        input.setAttribute('aria-invalid', 'true');
        msg.textContent = errors[key];
        msg.hidden = false;
      } else {
        input.removeAttribute('aria-invalid');
        msg.textContent = '';
        msg.hidden = true;
      }
    });
    const banner = form.querySelector('#form-errors');
    const keys = Object.keys(FIELD_IDS).filter((k) => errors[k]);
    if (!keys.length) {
      banner.hidden = true;
      banner.innerHTML = '';
      return;
    }
    banner.hidden = false;
    banner.innerHTML = `
      <strong>Please fix ${plural(keys.length, 'field')} before ${editing ? 'saving' : 'publishing'}.</strong>
      <ul>${keys.map((k) => `<li><button type="button" class="link-btn" data-action="focus-field" data-value="${FIELD_IDS[k]}">${FIELD_LABELS[k]}</button>: ${esc(errors[k])}</li>`).join('')}</ul>`;
    if (focusFirst) form.querySelector(`#${FIELD_IDS[keys[0]]}`).focus();
  }

  function updateCounters(form) {
    form.querySelectorAll('[data-counter]').forEach((el) => {
      const key = el.dataset.counter;
      const len = form.elements[key].value.length;
      el.textContent = `${len}/${LIMITS[key]}`;
      el.classList.toggle('near', len >= LIMITS[key] * 0.9);
    });
  }

  function buildNotice(v, original) {
    const now = new Date();
    let publishedAt;
    if (original && toDateInput(new Date(original.publishedAt)) === v.publishDate) {
      publishedAt = original.publishedAt; // date unchanged: keep the original time
    } else {
      const [y, m, d] = v.publishDate.split('-').map(Number);
      publishedAt = new Date(y, m - 1, d, now.getHours(), now.getMinutes()).toISOString();
    }
    const deadline = v.deadlineDate ? combineDateTime(v.deadlineDate, v.deadlineTime).toISOString() : null;
    return {
      id: original ? original.id : `u-${now.getTime().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      title: v.title,
      summary: v.summary,
      body: v.body,
      category: v.category,
      priority: v.priority,
      department: v.department,
      author: v.author,
      publishedAt,
      deadline,
      link: v.linkUrl ? { label: v.linkLabel || 'Open link', url: v.linkUrl } : null,
      read: original ? original.read : true, // you've seen your own notice
      starred: original ? original.starred : false,
      source: 'user',
      createdAt: original ? original.createdAt : now.toISOString(),
    };
  }

  // `opts.returnTo`: when editing from the details dialog, reopen it afterwards.
  function openForm(notice = null, opener = null, opts = {}) {
    if (notice && notice.source !== 'user') return;
    if (modals.some((m) => m.variant === 'form')) return;
    const top = modals[modals.length - 1];
    if (top && top.variant === 'drawer') {
      opener = top.opener;
      closeTop({ restore: false });
    }
    if (modals.length) return; // don't stack the form on another dialog

    const editing = !!notice;
    const entry = openModal({
      html: formHTML(notice),
      variant: 'form',
      labelledBy: 'form-title',
      dismissOnBackdrop: false, // clicking outside never throws away typing
      opener: opener || captureFocus(document.body),
      initialFocus: '#f-title',
    });
    const form = entry.box.querySelector('#notice-form');
    const snapshot = () => JSON.stringify(readForm(form));
    const initial = snapshot();
    let submitted = false;

    const leave = () => {
      closeTop({ restore: !opts.returnTo });
      if (opts.returnTo && byId(opts.returnTo.id)) openDetails(opts.returnTo.id, opts.returnTo.opener);
    };

    entry.onRequestClose = async () => {
      if (snapshot() !== initial) {
        const ok = await confirmDialog({
          title: editing ? 'Discard your changes?' : 'Discard this notice?',
          message: editing ? 'Your edits haven’t been saved.' : 'What you’ve typed so far will be lost.',
          confirmLabel: 'Discard',
          danger: true,
        });
        if (!ok) return;
      }
      leave();
    };

    updateCounters(form);
    form.addEventListener('input', () => {
      updateCounters(form);
      if (submitted) showErrors(form, validate(readForm(form), notice), { focusFirst: false, editing });
    });
    // Enter in a single-line field never submits by accident.
    form.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.tagName === 'INPUT') e.preventDefault();
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      submitted = true;
      const values = readForm(form);
      const errors = validate(values, notice);
      if (Object.keys(errors).length) {
        showErrors(form, errors, { focusFirst: true, editing });
        return;
      }
      const saved = buildNotice(values, notice);
      if (editing) Object.assign(notice, saved);
      else state.notices.unshift(saved);
      persist();
      render();
      leave();
      toast(editing ? 'Changes saved' : 'Notice published');
    });
  }

  function editFromDetails(id) {
    const top = modals[modals.length - 1];
    const opener = top ? top.opener : null;
    closeTop({ restore: false });
    openForm(byId(id), null, { returnTo: { id, opener } });
  }

  // ===================================================================
  // Other actions
  // ===================================================================
  function toggleRead(id) {
    const n = byId(id);
    if (!n) return;
    n.read = !n.read;
    persist();
    renderAll();
    toast(n.read ? 'Marked as read' : 'Marked as unread');
  }

  function toggleStar(id) {
    const n = byId(id);
    if (!n) return;
    n.starred = !n.starred;
    persist();
    renderAll();
    toast(n.starred ? 'Starred as important' : 'Removed from important');
  }

  function clearFilters() {
    state.search = '';
    els.search.value = '';
    if (FEEDS[state.route]) state.filters[state.route] = null;
    if (state.route === 'deadlines') state.dlCategory = 'all';
    render();
  }

  async function resetData() {
    const ok = await confirmDialog({
      title: 'Reset to demo data?',
      message: 'This replaces every notice, read status and star with the original samples. Notices you added will be deleted.',
      confirmLabel: 'Reset data',
      danger: true,
    });
    if (!ok) return;
    state.notices = makeSamples();
    if (storage.issue === 'corrupt') storage.issue = null;
    persist();
    hintDismissedMemory = false;
    try { localStorage.removeItem(HINT_KEY); } catch (e) { /* storage blocked */ }
    state.filters = {};
    state.dlCategory = 'all';
    render();
    toast('Sample notices restored');
  }

  // ===================================================================
  // Events
  // ===================================================================
  function onClick(e) {
    // A link inside the phone menu closes the menu, then goes to the page.
    const drawerLink = e.target.closest('.drawer .nav-item');
    if (drawerLink) {
      e.preventDefault();
      closeTop();
      go(drawerLink.dataset.nav);
      return;
    }
    const t = e.target.closest('[data-action]');
    if (!t) return;
    const { action, id, value } = t.dataset;
    switch (action) {
      case 'open': openDetails(id, captureFocus(document.body, t)); break;
      case 'toggle-read': toggleRead(id); break;
      case 'toggle-star': toggleStar(id); break;
      case 'add': openForm(null, captureFocus(document.body, t)); break;
      case 'edit': editFromDetails(id); break;
      case 'delete': deleteNotice(id); break;
      case 'close-modal': requestCloseTop(); break;
      case 'menu': openDrawer(t); break;
      case 'category': filtersFor(state.route).category = value; render(); break;
      case 'read-filter': filtersFor(state.route).read = value; render(); break;
      case 'toggle-filter': { const f = filtersFor(state.route); f[value] = !f[value]; render(); break; }
      case 'clear-filters': clearFilters(); break;
      case 'dl-category': state.dlCategory = value; render(); break;
      case 'dismiss-hint':
        hintDismissedMemory = true;
        writeKey(HINT_KEY, '1');
        render();
        els.view.focus({ preventScroll: true });
        break;
      case 'theme-toggle': setTheme(currentTheme() === 'dark' ? 'light' : 'dark'); break;
      case 'set-theme': setTheme(value); break;
      case 'reset': resetData(); break;
      case 'focus-field': { const el = document.getElementById(value); if (el) el.focus(); break; }
      case 'skip': els.view.focus(); break;
      default: break;
    }
  }

  const isTyping = (el) => el && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable);

  function onKeydown(e) {
    if (e.key === 'Escape') {
      if (modals.length) { e.preventDefault(); requestCloseTop(); }
      return;
    }
    if (modals.length) {
      if (e.key === 'Tab') trapTab(e);
      return;
    }
    if (isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === '/') {
      e.preventDefault();
      els.search.focus();
      els.search.select();
    } else if (e.key === 'n' || e.key === 'N') {
      e.preventDefault();
      openForm();
    }
  }

  function onSearchInput() {
    state.search = els.search.value;
    // Searching from the dashboard or settings jumps to the full feed.
    if (state.search.trim() && (state.route === 'dashboard' || state.route === 'preferences')) go('notices');
    else render();
  }

  // Keep relative labels ("Due in 2 days") fresh every minute and after midnight.
  function tick() {
    const active = document.activeElement;
    if (active && active.tagName === 'SELECT' && els.view.contains(active)) return; // don't close an open menu
    renderAll();
  }

  // ===================================================================
  // Start
  // ===================================================================
  function init() {
    els.app = document.getElementById('app');
    els.nav = document.getElementById('sidebar-nav');
    els.view = document.getElementById('view');
    els.search = document.getElementById('search');
    els.modalRoot = document.getElementById('modal-root');
    els.toasts = document.getElementById('toasts');

    document.querySelectorAll('[data-icon]').forEach((el) => { el.innerHTML = icon(el.dataset.icon, el.dataset.iconClass || ''); });

    state.notices = loadNotices();
    state.route = routeFromHash();

    // Follow the system theme until the person picks Light or Dark.
    if (window.matchMedia) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const follow = (e) => { if (!savedTheme()) setTheme(e.matches ? 'dark' : 'light', false); };
      if (mq.addEventListener) mq.addEventListener('change', follow);
    }

    render();

    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKeydown);
    document.addEventListener('change', (e) => {
      if (e.target.matches('select[data-action="sort"]')) {
        filtersFor(state.route).sort = e.target.value;
        render();
      }
    });
    // Remember whether "Past deadlines" is open across re-renders.
    document.addEventListener('toggle', (e) => {
      if (e.target.matches && e.target.matches('details.past')) state.pastOpen = e.target.open;
    }, true);
    els.search.addEventListener('input', onSearchInput);
    els.search.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape' || modals.length) return;
      e.stopPropagation();
      if (els.search.value) {
        els.search.value = '';
        onSearchInput();
      } else {
        els.search.blur();
      }
    });
    window.addEventListener('hashchange', onRoute);
    // Another tab changed the notices: reload them.
    window.addEventListener('storage', (e) => {
      if (e.key === STORE_KEY) {
        state.notices = loadNotices();
        renderAll();
      }
    });
    setInterval(tick, 60000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
  }

  init();
})();
