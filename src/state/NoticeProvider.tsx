import { useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';
import { createDemoNotices } from '../data';
import type { Notice, NoticeInput } from '../types';
import { uid } from '../utils';
import { NoticeContext, type NoticeContextValue } from './noticeContext';
import { STORAGE_KEY, loadNotices, parseCollection, saveNotices } from './storage';

type Action =
  | { type: 'add'; notice: Notice }
  | { type: 'update'; id: string; input: NoticeInput }
  | { type: 'delete'; id: string }
  | { type: 'setRead'; id: string; isRead?: boolean }
  | { type: 'toggleStar'; id: string }
  | { type: 'markAllRead'; ids?: string[] }
  | { type: 'replace'; notices: Notice[] };

function reducer(state: Notice[], action: Action): Notice[] {
  switch (action.type) {
    case 'add':
      return [action.notice, ...state];
    case 'update':
      // id, isRead, isStarred and isUserCreated are kept; demo notices are read-only.
      return state.map((n) => (n.id === action.id && n.isUserCreated ? { ...n, ...action.input } : n));
    case 'delete':
      return state.filter((n) => !(n.id === action.id && n.isUserCreated));
    case 'setRead':
      return state.map((n) => (n.id === action.id ? { ...n, isRead: action.isRead ?? !n.isRead } : n));
    case 'toggleStar':
      return state.map((n) => (n.id === action.id ? { ...n, isStarred: !n.isStarred } : n));
    case 'markAllRead': {
      const ids = action.ids && new Set(action.ids);
      return state.map((n) => (!n.isRead && (!ids || ids.has(n.id)) ? { ...n, isRead: true } : n));
    }
    case 'replace':
      return action.notices;
  }
}

export function NoticeProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(loadNotices);
  const [notices, dispatch] = useReducer(reducer, initial.notices);
  const [storageAvailable, setStorageAvailable] = useState(initial.storageAvailable);
  const [now, setNow] = useState(() => new Date());
  // Last JSON written to storage; lets us skip writes when nothing changed (including on first load).
  const lastSaved = useRef<string | null>(initial.savedJson);

  useEffect(() => {
    if (!storageAvailable) return;
    const json = JSON.stringify(notices);
    if (json === lastSaved.current) return;
    if (saveNotices(json)) lastSaved.current = json;
    else setStorageAvailable(false);
  }, [notices, storageAvailable]);

  // Keep other open tabs in sync when they change the same collection.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || e.newValue === null) return;
      const result = parseCollection(e.newValue);
      if (!result) return;
      lastSaved.current = JSON.stringify(result.notices);
      dispatch({ type: 'replace', notices: result.notices });
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Refresh "now" every minute and when the tab becomes visible, so date labels roll over at midnight.
  useEffect(() => {
    const tick = () => setNow(new Date());
    const timer = window.setInterval(tick, 60_000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', tick);
    };
  }, []);

  // Actions only use `dispatch`, so they never change identity and are safe in effect dependencies.
  const actions = useMemo(
    () => ({
      addNotice: (input: NoticeInput) => {
        const notice: Notice = { id: uid(), ...input, isRead: false, isStarred: false, isUserCreated: true };
        dispatch({ type: 'add', notice });
        return notice;
      },
      updateNotice: (id: string, input: NoticeInput) => dispatch({ type: 'update', id, input }),
      deleteNotice: (id: string) => dispatch({ type: 'delete', id }),
      toggleRead: (id: string) => dispatch({ type: 'setRead', id }),
      setRead: (id: string, isRead: boolean) => dispatch({ type: 'setRead', id, isRead }),
      toggleStar: (id: string) => dispatch({ type: 'toggleStar', id }),
      markAllRead: (ids?: string[]) => dispatch({ type: 'markAllRead', ids }),
      resetToDemo: () => dispatch({ type: 'replace', notices: createDemoNotices() }),
    }),
    [],
  );

  const value = useMemo<NoticeContextValue>(
    () => ({ notices, now, storageAvailable, storageWarning: initial.warning, ...actions }),
    [notices, now, storageAvailable, initial.warning, actions],
  );

  return <NoticeContext.Provider value={value}>{children}</NoticeContext.Provider>;
}
