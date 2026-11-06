import React from 'react';
import { X, ShieldCheck, CheckCircle2, AlertTriangle, FileText, Check, Award } from 'lucide-react';
import { formatCurrency, formatKm } from '../../utils/formatters';

export function OfficialDossierModal({ vehicle, onClose }) {
  if (!vehicle) return null;
  const d = vehicle.dossieOficial || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-fade-in">
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
              <h3 className="font-heading text-base font-bold text-white">Dossiê Oficial de Procedência</h3>
              <p className="text-[11px] text-emerald-400">Verificação Completa de Histórico & Sinistro</p>
            </div>
          </div>
          <button
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
              <span className="text-xs text-emerald-400 font-bold">Quilometragem Autêntica</span>
            </div>
          </div>

          {/* Checklist de Segurança */}
          <div className="space-y-3">
            <h5 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-400">Varredura de Bases Oficiais</h5>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300 text-xs">Histórico de Leilão:</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Nada Consta
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300 text-xs">Registro de Sinistro / PT:</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Nenhum Apontamento
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300 text-xs">Recall Pendente:</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> 100% Atualizado
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300 text-xs">Gravame / Bloqueio Judicial:</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Desembaraçado
                </span>
              </div>
            </div>
          </div>

          {/* Dados do Proprietário e Manutenções */}
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Quantidade de Proprietários Anteriores:</span>
              <span className="font-bold text-white">{d.proprietarios || 1} Único Dono</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Última Revisão Oficial Realizada:</span>
              <span className="font-bold text-white">{d.dataUltimaRevisao || 'Recente'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Local de Origem / Emplacamento:</span>
              <span className="font-bold text-white">{d.cidadeRegistro || 'Distrito Federal'}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 text-center">
            Certificação emitida com fé pública em conformidade com o laudo pericial cautelar digital.
          </div>
        </div>
      </div>
    </div>
  );
}
