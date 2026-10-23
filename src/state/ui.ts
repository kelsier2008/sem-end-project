import { createContext, useContext } from 'react';
import type { Notice } from '../types';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
}

/** App-wide UI actions (dialogs, toasts, search) so any page or card can trigger them. */
export interface UIContextValue {
  search: string;
  setSearch: (value: string) => void;
  /** Opens the notice form; pass a notice to edit it. */
  openComposer: (notice?: Notice) => void;
  openDetails: (id: string) => void;
  requestDelete: (id: string) => void;
  confirm: (options: ConfirmOptions) => void;
  notify: (message: string) => void;
}

export const UIContext = createContext<UIContextValue | null>(null);

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used inside <UIContext.Provider>');
  return ctx;
}
