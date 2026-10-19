import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
const KEY = 'noticeboard:theme';
const media = window.matchMedia('(prefers-color-scheme: dark)');

function stored(): Theme | null {
  try {
    const t = localStorage.getItem(KEY);
    return t === 'light' || t === 'dark' ? t : null;
  } catch {
    return null;
  }
}

/** Follows the system preference until the user picks a theme explicitly. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => stored() ?? (media.matches ? 'dark' : 'light'));

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    const onChange = (e: MediaQueryListEvent) => {
      if (!stored()) setTheme(e.matches ? 'dark' : 'light');
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const toggle = () =>
    setTheme((t) => {
      const next = t === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(KEY, next);
      } catch {
        /* ignore */
      }
      return next;
    });

  return { theme, toggle };
}
