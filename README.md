# CampusBoard

Stay updated. Never miss a deadline. CampusBoard puts every campus announcement and deadline in one place.

**Live app:** https://kelsier2008.github.io/sem-end-project/

## What it does

- Dashboard with today's summary, stat cards, high-priority notices, latest notices and upcoming deadlines
- Notice feed with search, category chips, read/unread, important and high-priority filters, and sorting
- Notice details: mark as read or unread, star as important, open the action link
- Upcoming deadlines grouped into due today, next 7 days and later
- Add, edit and delete your own notices through a validated form
- Light and dark theme, keyboard shortcuts (`/` search, `N` add, `Esc` close), works on phones

Notices are saved in your browser (localStorage key `campusboard:notices`), so they are not shared with other people or devices. Sample notices are fictional.

## Files

| File | What it does |
| --- | --- |
| `index.html` | Page frame: sidebar, top bar, and the main area the app fills |
| `styles.css` | All styling, light and dark colours, tablet and phone layouts |
| `data.js` | The 13 sample notices, dated relative to today |
| `app.js` | All app logic: saving, pages, popups, the form and its checks |

## Run it

No build step. Open `index.html` in a browser, or serve the folder with any static server, e.g. `python3 -m http.server`.
