import React, { useEffect, useRef, useState } from 'react';

const EXIT_MS = 240;

/** Mantém o diálogo montado até o fim da saída, preservando seus dados e foco. */
export function ModalTransition({ open, children, kind }) {
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
  return <div {...{ [`data-${kind}-modal`]: '' }} data-phase={open ? 'open' : phase} onClickCapture={preventClosingInteraction} onKeyDownCapture={preventClosingInteraction}>{open ? children : lastContent.current}</div>;
}
