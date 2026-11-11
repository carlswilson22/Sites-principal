import { useEffect, useRef } from 'react';
import { hasOpenDialogs, isTopDialog, registerDialog } from '../../utils/dialogActivity.js';

let previousOverflow = '';

export function useDialog() {
  const ref = useRef(null);
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
    dialog.addEventListener('keydown', trapFocus);
    return () => {
      dialog.removeEventListener('keydown', trapFocus);
      const wasTop = isTopDialog(dialog);
      unregister();
      if (!hasOpenDialogs()) document.body.style.overflow = previousOverflow;
      if (wasTop && previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);
  return ref;
}
