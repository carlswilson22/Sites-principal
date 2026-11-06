import React from 'react';
import { Scale, ArrowRight, X } from 'lucide-react';
import { Button } from '../ui/Button';

export function ComparisonFloatingBar({ comparedVehicles = [], onOpenComparator, onClear }) {
  if (!comparedVehicles || comparedVehicles.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-2xl bg-slate-900/95 border border-cyan-500/40 backdrop-blur-xl rounded-2xl p-3 sm:px-5 sm:py-3.5 shadow-2xl shadow-cyan-950/60 flex items-center justify-between gap-3 animate-fade-in">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30">
          <Scale className="w-5 h-5" />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {comparedVehicles.map(v => (
            <div key={v.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 shrink-0">
              <img src={v.imagemPrincipal} alt={v.nome} className="w-5 h-5 rounded object-cover" />
              <span className="text-xs text-white font-medium truncate max-w-[100px]">{v.nome}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onClear}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs"
          title="Limpar seleção"
        >
          <X className="w-4 h-4" />
        </button>

        <Button
          variant="primary"
          size="sm"
          icon={ArrowRight}
          onClick={onOpenComparator}
          className="py-2"
        >
          <span>Comparar ({comparedVehicles.length})</span>
        </Button>
      </div>
    </div>
  );
}
