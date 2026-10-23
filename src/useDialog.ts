import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Accessible dialog behaviour: moves focus inside, traps Tab, closes on Escape,
 * locks page scroll, and returns focus to whatever was focused before opening.
 */
export function useDialog(
  ref: RefObject<HTMLElement>,
  open: boolean,
  onClose: () => void,
  initialFocus?: RefObject<HTMLElement>,
) {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const restore = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusables = () =>
      Array.from(ref.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).filter((el) => el.offsetParent !== null);

    // The dialog is already in the DOM when this effect runs, so focus can move immediately.
    (initialFocus?.current ?? focusables()[0] ?? ref.current)?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const els = focusables();
      if (!els.length) return e.preventDefault();
      const first = els[0];
      const last = els[els.length - 1];
      const inside = ref.current?.contains(document.activeElement);
      if (e.shiftKey && (document.activeElement === first || !inside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (document.activeElement === last || !inside)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      if (restore && document.contains(restore)) restore.focus();
    };
  }, [open, ref, initialFocus]);
}
