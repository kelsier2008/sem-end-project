import { useRef, type ReactNode, type RefObject } from 'react';
import { X } from 'lucide-react';
import { iconBtn } from '../styles';
import { useDialog } from '../useDialog';

const SIZES = { sm: 'sm:max-w-md', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl' };

interface Props {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  describedBy?: string;
  role?: 'dialog' | 'alertdialog';
  size?: keyof typeof SIZES;
  /** Forms keep this false so a stray click outside can't throw away typed text. */
  closeOnBackdrop?: boolean;
  initialFocus?: RefObject<HTMLElement>;
  children: ReactNode;
}

export default function Modal({
  open,
  onClose,
  labelledBy,
  describedBy,
  role = 'dialog',
  size = 'md',
  closeOnBackdrop = true,
  initialFocus,
  children,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useDialog(ref, open, onClose, initialFocus);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div
        className="absolute inset-0 animate-fade-in bg-deep/45 backdrop-blur-[2px]"
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden
      />
      <div
        ref={ref}
        role={role}
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        tabIndex={-1}
        className={`dialog-max-h relative flex w-full animate-scale-in flex-col overflow-hidden rounded-t-2xl border border-line bg-surface shadow-2xl outline-none sm:rounded-2xl ${SIZES[size]}`}
      >
        {children}
      </div>
    </div>
  );
}

export function ModalHeader({
  titleId,
  title,
  subtitle,
  onClose,
  children,
}: {
  titleId: string;
  title: ReactNode;
  subtitle?: ReactNode;
  onClose: () => void;
  children?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
      <div className="min-w-0">
        {children}
        <h2 id={titleId} className="text-lg font-semibold leading-snug tracking-tight text-ink">
          {title}
        </h2>
        {subtitle && <p className="mt-0.5 text-sm text-ink-muted">{subtitle}</p>}
      </div>
      <button type="button" onClick={onClose} aria-label="Close dialog" className={`${iconBtn} -mr-2 -mt-1`}>
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}
