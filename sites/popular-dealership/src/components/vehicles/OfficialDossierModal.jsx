import React from 'react';
import { X, ShieldCheck, CheckCircle2, AlertTriangle, FileText, Check, Award } from 'lucide-react';
import { formatCurrency, formatKm } from '../../utils/formatters';
import { useDialog } from '../../../../../packages/merchant-core/src/components/common/useDialog';
import { getDossierSummary } from '../../utils/dossier';

export function OfficialDossierModal({ vehicle, onClose }) {
  const dialogRef = useDialog(onClose);
  if (!vehicle) return null;
  const d = vehicle.dossieOficial || {};

  return (
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Dossiê do veículo" tabIndex={-1} onClick={event => { if (event.target === event.currentTarget) onClose(); }} className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 sm:px-6 border-b border-slate-800 bg-slate-950/80 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-white">Dossiê do veículo</h3>
              <p className="text-[11px] text-slate-300">Informações de procedência cadastradas pela loja</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Fechar dossiê do veículo"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto text-xs sm:text-sm">
          {/* Identificação do Veículo */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between items-center">
            <div>
              <h4 className="font-bold text-white">{vehicle.nome}</h4>
              <p className="text-xs text-slate-400">{vehicle.versao} • {vehicle.ano}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-mono">{formatKm(vehicle.km)}</span>
              <span className="text-xs text-slate-400">Quilometragem anunciada</span>
            </div>
          </div>

          {/* Checklist de Segurança */}
          <div className="space-y-3">
            <h5 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-400">Histórico informado</h5>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {getDossierSummary(d).map(fact => <div key={fact.label} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3">
                <span className="text-slate-300 text-xs">{fact.label}:</span>
                <span className={`text-xs font-bold flex items-center gap-1 text-right ${fact.clear === true ? 'text-emerald-400' : fact.clear === false ? 'text-amber-300' : 'text-slate-400'}`}>{fact.clear === true && <Check className="w-3.5 h-3.5 shrink-0" />}{fact.text}</span>
              </div>)}
            </div>
          </div>

          {/* Dados do Proprietário e Manutenções */}
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Quantidade de Proprietários Anteriores:</span>
              <span className="font-bold text-white">{Number.isInteger(d.proprietarios) && d.proprietarios > 0 ? d.proprietarios : 'Não informado'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Última Revisão Oficial Realizada:</span>
              <span className="font-bold text-white">{d.dataUltimaRevisao || 'Não informada'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Local de Origem / Emplacamento:</span>
              <span className="font-bold text-white">{d.cidadeRegistro || 'Não informado'}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 text-center">
            Confira o laudo e os documentos com a loja. Esta página apresenta o cadastro do anúncio, sem consulta automática a bases externas.
          </div>
        </div>
      </div>
    </div>
  );
}
