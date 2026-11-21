import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

const DURATION = 260;

export function SidebarSection({ title, open, onToggle, children }) {
  const [present, setPresent] = useState(open);
  const [expanded, setExpanded] = useState(open);
  const contentRef = useRef(null);

  useEffect(() => {
    const content = contentRef.current;
    if (content) {
      if (open) content.removeAttribute('inert');
      else content.setAttribute('inert', '');
    }
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (reduced) { setPresent(open); setExpanded(open); return undefined; }
    if (open) {
      setPresent(true);
      let nextFrame;
      const frame = window.requestAnimationFrame(() => { nextFrame = window.requestAnimationFrame(() => setExpanded(true)); });
      return () => { window.cancelAnimationFrame(frame); if (nextFrame != null) window.cancelAnimationFrame(nextFrame); };
    }
    setExpanded(false);
    const timer = window.setTimeout(() => setPresent(false), DURATION);
    return () => window.clearTimeout(timer);
  }, [open]);

  return <details open={present} data-sidebar-section data-expanded={expanded ? 'true' : 'false'} className="group">
    <summary onClick={event => { event.preventDefault(); onToggle(!open); }} aria-expanded={open} className="merchant-sidebar-summary min-h-10 px-3 flex cursor-pointer items-center justify-between gap-2 rounded-lg text-xs font-semibold uppercase tracking-wide text-slate-500 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600">{title}<ChevronDown aria-hidden="true" className="h-4 w-4 merchant-sidebar-chevron" /></summary>
    <div ref={contentRef} aria-hidden={!open} className="merchant-sidebar-section-content"><div className="merchant-sidebar-section-inner"><div className="space-y-1 pt-1">{children}</div></div></div>
  </details>;
}
