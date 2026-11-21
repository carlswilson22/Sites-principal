import React, { useEffect, useRef, useState } from 'react';
import './merchantModalTransition.css';

const EXIT_MS = 180;

/** Mantém o conteúdo durante a saída sem perder os dados já removidos pelo pai. */
export function MerchantModalTransition({ open, children }) {
  const lastContent = useRef(null);
  const [present, setPresent] = useState(Boolean(open));
  const [phase, setPhase] = useState('open');
  if (open && children) lastContent.current = children;

  useEffect(() => {
    if (open) {
      setPresent(true);
      setPhase('open');
      return undefined;
    }
    if (!present) return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setPresent(false);
      lastContent.current = null;
      return undefined;
    }
    setPhase('closing');
    const timer = window.setTimeout(() => {
      setPresent(false);
      lastContent.current = null;
    }, EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [open, present]);

  if (!open && !present) return null;
  const preventClosingInteraction = event => {
    if (!open) { event.preventDefault(); event.stopPropagation(); }
  };
  return <div data-merchant-modal data-phase={open ? 'open' : phase} onClickCapture={preventClosingInteraction} onKeyDownCapture={preventClosingInteraction}>{open ? children : lastContent.current}</div>;
}
