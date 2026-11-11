import { useEffect, useRef } from 'react';
import { hasOpenDialogs, isTopDialog, registerDialog } from '../../utils/dialogActivity.js';

let previousOverflow = '';

export function useDialog(onClose) {
  const ref = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const previousFocus = document.activeElement;
    if (!hasOpenDialogs()) previousOverflow = document.body.style.overflow;
    const unregister = registerDialog(dialog);
    const focusable = () => [...dialog.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]')]
      .filter(element => element.getClientRects().length > 0);
    document.body.style.overflow = 'hidden';
    (dialog.querySelector('button:not([disabled])') || dialog).focus({ preventScroll: true });
    const trapFocus = event => {
      if (event.key !== 'Tab' || !isTopDialog(dialog)) return;
      const items = focusable();
      const first = items[0];
      const last = items.at(-1);
      if (!first) { event.preventDefault(); dialog.focus(); return; }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog)) {
        event.preventDefault(); first.focus();
      }
    };
    const closeOnEscape = event => {
      if (event.key === 'Escape' && isTopDialog(dialog) && closeRef.current) {
        event.preventDefault();
        event.stopImmediatePropagation();
        closeRef.current();
      }
    };
    dialog.addEventListener('keydown', trapFocus);
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      dialog.removeEventListener('keydown', trapFocus);
      window.removeEventListener('keydown', closeOnEscape);
      const wasTop = isTopDialog(dialog);
      unregister();
      if (!hasOpenDialogs()) document.body.style.overflow = previousOverflow;
      if (wasTop && previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);
  return ref;
}
