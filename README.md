# NoticeBoard

Class announcement and deadline hub for students, parents and class reps.
React 18 + TypeScript + Tailwind CSS 3 + lucide-react, built with Vite.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

## Features
- Search across title, content, author and category (`/` focuses search, `n` opens the composer)
- Category pills with counts, All / Starred / Unread tabs, sort by newest or upcoming deadline
- Cards with category badge, urgency tag (high pulses), relative due date, expandable text
- Star / read state and user-posted notices persisted in `localStorage`
- Accessible modal (focus trap, Esc, focus restore) with inline validation
- Light / dark theme that follows the system until you pick one

## Structure
```
src/
  App.tsx                 state, filtering, sorting, shortcuts
  types.ts  data.ts  utils.ts  useLocalStorage.ts  useTheme.ts
  components/
    Navbar.tsx  FilterBar.tsx  StatSummary.tsx
    NoticeGrid.tsx  NoticeCard.tsx  AddNoticeModal.tsx
```
