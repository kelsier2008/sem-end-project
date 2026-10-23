# CampusBoard

**Stay updated. Never miss a deadline.**
Every important campus update, organized in one place.

College notices are scattered across WhatsApp groups, notice boards, emails and the college app.
CampusBoard collects them in one dashboard where students, class representatives and parents can
find notices, track deadlines, mark things as read and star what matters.

React 18 + TypeScript + Tailwind CSS 3 + lucide-react, built with Vite. No other dependencies.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-checks, then builds to dist/
```

> This is a client-side prototype. Data lives in your browser's `localStorage`; it is not shared
> with other people or devices, and there are no accounts or roles.

## Features

- **Dashboard**: live stats (total, unread, important, upcoming deadlines), high-priority notices,
  latest notices, the next deadlines and notices you added
- **Views**: All Notices, Important (starred), Unread, Upcoming Deadlines, Settings
- **Search** across title, summary, full text, department and author (`/` to focus)
- **Filters that combine**: category, read status, important only, high priority only
- **Sorting**: newest, oldest, or nearest upcoming deadline
- **Add, edit and delete** your own notices with validation (dates, deadline order, safe links); `n` opens the form
- **Detail view** with full text, metadata and an optional external link
- **Deadlines page** grouped into due today / next 7 days / later, with past deadlines kept separately
- Light and dark themes, responsive from phones to wide screens, keyboard and screen-reader friendly

## Data and storage

| Key | Contents |
| --- | --- |
| `campusboard:notices` | The full notice collection (JSON array of `Notice`) |
| `campusboard:notices:backup` | A copy of saved data that couldn't be read, kept before demo data replaces it |
| `campusboard:hide-demo-hint` | Whether the "sample announcements" message was dismissed |
| `noticeboard:theme` | `light` or `dark` once you pick a theme (otherwise the system theme is used) |

On first load, 13 fictional sample notices are created relative to today's date. After that the saved
collection is used as is. Saved records are validated on load and invalid ones are skipped.
**Settings → Reset data** restores the samples.

Each `Notice` follows the schema in [`src/types.ts`](src/types.ts): `id`, `title`, `description`,
`content`, `category` (`Exams | Assignments | Events | Fees`), `department`, `author`,
`publishedAt` and `deadline` (ISO 8601, deadline may be `null`), `priority` (`High | Normal`),
`isRead`, `isStarred`, `isUserCreated` and an optional `actionLink { label, url }`.

## Structure

```
src/
  App.tsx                 layout, routing, dialogs, toasts, keyboard shortcuts
  router.ts               tiny hash router (#/notices…), works on any static host
  filters.ts              search, filters, sorting and dashboard stats
  types.ts  data.ts  utils.ts  styles.ts
  useDialog.ts  useLocalStorage.ts  useTheme.ts
  state/
    NoticeProvider.tsx    reducer, persistence, cross-tab sync, clock
    useNotices.ts         hook for notices and actions
    storage.ts            load / validate / save (campusboard:notices)
    noticeContext.ts  ui.ts
  pages/
    DashboardPage.tsx  NoticesPage.tsx  DeadlinesPage.tsx  SettingsPage.tsx
  components/
    Sidebar.tsx  Navbar.tsx (top bar)  FilterBar.tsx  StatSummary.tsx
    NoticeGrid.tsx  NoticeCard.tsx  NoticeRow.tsx  NoticeBadges.tsx  UpcomingDeadlines.tsx
    AddNoticeModal.tsx (add & edit)  NoticeDetailModal.tsx  ConfirmDialog.tsx
    Modal.tsx  Toast.tsx  EmptyState.tsx  PageHeader.tsx  Logo.tsx
```
