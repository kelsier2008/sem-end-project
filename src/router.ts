import { useSyncExternalStore } from 'react';

/**
 * A tiny hash router (#/notices, #/settings…). No dependency, and it works on any static host
 * such as GitHub Pages because the server only ever serves index.html.
 */
export const ROUTES = {
  dashboard: '/',
  notices: '/notices',
  important: '/important',
  unread: '/unread',
  deadlines: '/deadlines',
  settings: '/settings',
} as const;

export type Route = keyof typeof ROUTES;

export const ROUTE_TITLES: Record<Route, string> = {
  dashboard: 'Dashboard',
  notices: 'All Notices',
  important: 'Important',
  unread: 'Unread',
  deadlines: 'Upcoming Deadlines',
  settings: 'Settings',
};

function currentRoute(): Route {
  const path = window.location.hash.replace(/^#/, '') || '/';
  return (Object.keys(ROUTES) as Route[]).find((r) => ROUTES[r] === path) ?? 'dashboard';
}

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
}

export function useRoute(): Route {
  return useSyncExternalStore(subscribe, currentRoute);
}

export const href = (route: Route) => `#${ROUTES[route]}`;

export function navigate(route: Route) {
  window.location.hash = ROUTES[route];
}
