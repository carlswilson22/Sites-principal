import React, { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { useVehicleAdSection } from './VehicleAdSections';

const themes = {
  blue: 'border-blue-400 bg-blue-600 text-white',
  amber: 'border-amber-400 bg-amber-400 text-slate-950',
  cyan: 'border-cyan-400 bg-cyan-400 text-slate-950',
};

export function VehicleAdTools({ tools, theme = 'blue' }) {
  const id = useId();
  const sectionRef = useRef(null);
  const previousActive = useRef(null);
  const [active, setActive, otherSectionOpen] = useVehicleAdSection('tool');
  const [visited, setVisited] = useState(() => new Set());

  const toggle = toolId => {
    setActive(previous => previous === toolId ? null : toolId);
    setVisited(previous => new Set([...previous, toolId]));
  };

  useEffect(() => {
    const previous = previousActive.current;
    previousActive.current = active;
    if (!active && !previous) return;
    if (!active && otherSectionOpen) return;

    const frame = window.requestAnimationFrame(() => {
      const scroller = sectionRef.current?.closest('[data-vehicle-ad-scroll]');
      const target = document.getElementById(`${id}-${active || previous}-${active ? 'panel' : 'button'}`);
      if (!scroller || !target) return;
      if (active) target.querySelector('[data-close-ad-tool]')?.focus({ preventScroll: true });
      else document.getElementById(`${id}-${previous}-button`)?.focus({ preventScroll: true });
      const top = Math.max(0, scroller.scrollTop + target.getBoundingClientRect().top - scroller.getBoundingClientRect().top - scroller.clientTop - 12);
      const behavior = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ? 'auto' : 'smooth';
      if (typeof scroller.scrollTo === 'function') scroller.scrollTo({ top, behavior });
      else scroller.scrollTop = top;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [active, id, otherSectionOpen]);

  return <section ref={sectionRef} data-vehicle-tools aria-label="Ferramentas do anúncio" className="min-w-0">
    <div data-ad-tool-controls className="space-y-2">
      {tools.map(tool => <div key={tool.id} className="min-w-0 overflow-hidden rounded-xl border border-slate-700 bg-slate-950/40">
        <button
        key={tool.id}
        id={`${id}-${tool.id}-button`}
        type="button"
        data-ad-tool={tool.id}
        data-feature={tool.feature}
        aria-expanded={active === tool.id}
        aria-controls={`${id}-${tool.id}-panel`}
        onClick={() => toggle(tool.id)}
        className={`min-h-11 w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white ${active === tool.id ? themes[theme] : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
      >
        <tool.icon aria-hidden="true" className="w-4 h-4 shrink-0" />
        <span className="min-w-0 flex-1">{tool.label}</span>
        <ChevronDown aria-hidden="true" className={`w-4 h-4 shrink-0 transition-transform ${active === tool.id ? 'rotate-180' : ''}`} />
      </button>
      <div
      id={`${id}-${tool.id}-panel`}
      role="region"
      aria-labelledby={`${id}-${tool.id}-button`}
      hidden={active !== tool.id}
      className="p-3 sm:p-4"
    >
      {(active === tool.id || (tool.keepMounted && visited.has(tool.id))) && <>
        <div className="sticky top-0 z-10 mb-3 flex items-center justify-between gap-3 rounded-xl bg-slate-950 px-2 py-1">
          <h3 className="min-w-0 text-sm font-semibold text-white">{tool.label}</h3>
          <button type="button" data-close-ad-tool={tool.id} aria-label={`Fechar ${tool.label}`} onClick={() => setActive(null)} className="min-h-11 shrink-0 inline-flex items-center gap-2 rounded-lg px-3 text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
            <X aria-hidden="true" className="w-4 h-4" />Fechar
          </button>
        </div>
        {tool.content}
      </>}
      </div>
    </div>)}
    </div>
  </section>;
}
