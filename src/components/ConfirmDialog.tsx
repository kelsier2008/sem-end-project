import { useId, useRef } from 'react';
import { TriangleAlert } from 'lucide-react';
import type { ConfirmOptions } from '../state/ui';
import { btn } from '../styles';
import Modal from './Modal';

interface Props {
  options: ConfirmOptions | null;
  onClose: () => void;
}

export default function ConfirmDialog({ options, onClose }: Props) {
  const id = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <Modal
      open={!!options}
      onClose={onClose}
      role="alertdialog"
      size="sm"
      labelledBy={`${id}-title`}
      describedBy={`${id}-desc`}
      initialFocus={cancelRef}
    >
      {options && (
        <>
          <div className="flex gap-4 px-5 pb-2 pt-6 sm:px-6">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300">
              <TriangleAlert className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h2 id={`${id}-title`} className="text-base font-semibold text-ink">
                {options.title}
              </h2>
              <p id={`${id}-desc`} className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                {options.message}
              </p>
            </div>
          </div>
          <div className="flex flex-col-reverse gap-2 px-5 pb-5 pt-4 sm:flex-row sm:justify-end sm:px-6">
            <button ref={cancelRef} type="button" onClick={onClose} className={btn.secondary}>
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                options.onConfirm();
                onClose();
              }}
              className={btn.danger}
            >
              {options.confirmLabel}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
