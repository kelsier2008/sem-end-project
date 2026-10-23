import { useContext } from 'react';
import { NoticeContext } from './noticeContext';

/** Access the notice collection and its actions. Must be used inside <NoticeProvider>. */
export function useNotices() {
  const ctx = useContext(NoticeContext);
  if (!ctx) throw new Error('useNotices must be used inside <NoticeProvider>');
  return ctx;
}
