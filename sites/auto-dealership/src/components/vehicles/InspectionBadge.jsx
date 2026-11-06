import React from 'react';
import { ShieldCheck } from 'lucide-react';

export function InspectionBadge({ text = "Laudo Cautelar 100% Aprovado", compact = false, className = "" }) {
  if (compact) {
    return (
      <div 
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/85 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-950 backdrop-blur-md ${className}`}
        title="Veículo periciado e certificado com laudo cautelar aprovado"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span>{text}</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-950/80 text-emerald-200 border border-emerald-500/40 shadow-lg shadow-emerald-950/40 backdrop-blur-md ${className}`}>
      <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
      </div>
      <div>
        <p className="font-bold text-emerald-300 leading-tight">{text}</p>
        <p className="text-[10px] text-emerald-400/80 font-normal">Estrutura & Câmbio Certificados</p>
      </div>
    </div>
  );
}
