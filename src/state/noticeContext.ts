import { createContext } from 'react';
import type { Notice, NoticeInput } from '../types';

export interface NoticeContextValue {
  notices: Notice[];
  /** Current time, refreshed every minute so "today" and "overdue" stay correct. */
  now: Date;
  storageAvailable: boolean;
  storageWarning: string | null;
  addNotice: (input: NoticeInput) => Notice;
  /** Only notices created in this browser can be updated. */
  updateNotice: (id: string, input: NoticeInput) => void;
  /** Only notices created in this browser can be deleted. */
  deleteNotice: (id: string) => void;
  toggleRead: (id: string) => void;
  setRead: (id: string, isRead: boolean) => void;
  toggleStar: (id: string) => void;
  markAllRead: (ids?: string[]) => void;
  resetToDemo: () => void;
}

export const NoticeContext = createContext<NoticeContextValue | null>(null);
