import React, { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';

const themes = {
  blue: 'border-blue-400 bg-blue-600 text-white',
  amber: 'border-amber-400 bg-amber-400 text-slate-950',
  cyan: 'border-cyan-400 bg-cyan-400 text-slate-950',
};

export function VehicleAdTools({ tools, theme = 'blue' }) {
  const id = useId();
  const [active, setActive] = useState(null);
  const [visited, setVisited] = useState(() => new Set());

  const toggle = toolId => {
    setActive(previous => previous === toolId ? null : toolId);
    setVisited(previous => new Set([...previous, toolId]));
  };

  return <section data-vehicle-tools aria-label="Ferramentas do anúncio" className="space-y-4">
    <div className="flex flex-wrap gap-2">
      {tools.map(tool => <button
        key={tool.id}
        id={`${id}-${tool.id}-button`}
        type="button"
        data-ad-tool={tool.id}
        data-feature={tool.feature}
        aria-expanded={active === tool.id}
        aria-controls={`${id}-${tool.id}-panel`}
        onClick={() => toggle(tool.id)}
        className={`min-h-11 max-w-full inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${active === tool.id ? themes[theme] : 'border-slate-700 bg-slate-950/60 text-slate-300 hover:bg-slate-800 hover:text-white'}`}
      >
        <tool.icon aria-hidden="true" className="w-4 h-4 shrink-0" />
        <span>{tool.label}</span>
        <ChevronDown aria-hidden="true" className={`w-4 h-4 shrink-0 transition-transform ${active === tool.id ? 'rotate-180' : ''}`} />
      </button>)}
    </div>
    {tools.map(tool => <div
      key={tool.id}
      id={`${id}-${tool.id}-panel`}
      role="region"
      aria-labelledby={`${id}-${tool.id}-button`}
      hidden={active !== tool.id}
    >
      {(active === tool.id || (tool.keepMounted && visited.has(tool.id))) && tool.content}
    </div>)}
  </section>;
}
