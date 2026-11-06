import React from 'react';
import { X, Check, ArrowRight, Zap, Gauge, Fuel, ShoppingBag, ShieldCheck, DollarSign } from 'lucide-react';
import { formatCurrency, formatKm, calculateFipeDiff } from '../../utils/formatters';
import { Button } from '../ui/Button';

export function VehicleComparatorModal({ vehicles = [], onClose, onOpenFinancing }) {
  if (!vehicles || vehicles.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-5xl bg-slate-900 border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:px-8 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h3 className="font-heading text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span>Comparador Inteligente de Veículos</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/30">
                {vehicles.length} {vehicles.length === 1 ? 'veículo' : 'veículos'}
              </span>
            </h3>
            <p className="text-xs text-slate-400">Análise técnica lado a lado de especificações, consumo e custos</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Matriz Comparativa com Scroll */}
        <div className="p-5 sm:p-8 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {vehicles.map((car) => {
              const fipe = calculateFipeDiff(car.preco, car.fipeReferencia);
              return (
                <div key={car.id} className="p-5 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-5 shadow-lg">
                  {/* Foto e Nome */}
                  <div className="space-y-3">
                    <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-slate-900 relative">
                      <img src={car.imagemPrincipal} alt={car.nome} className="w-full h-full object-cover" />
                      {fipe && (
                        <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-emerald-950/90 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                          {fipe.label}
                        </div>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-cyan-400 font-bold">{car.marca} • {car.ano}</span>
                      <h4 className="font-heading text-lg font-bold text-white">{car.nome}</h4>
                      <p className="text-xs text-slate-400 line-clamp-1">{car.versao}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase block">Preço à vista</span>
                      <span className="font-heading text-2xl font-black text-white">{formatCurrency(car.preco)}</span>
                      {car.parcela && (
                        <p className="text-xs text-cyan-400 font-medium">
                          Entrada + 48x {formatCurrency(car.parcela.valor)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Tabela de Specs Comparativas */}
                  <div className="space-y-2 text-xs pt-3 border-t border-slate-800 text-slate-300">
                    <div className="flex justify-between p-2 rounded-xl bg-slate-900/60">
                      <span className="text-slate-400">Quilometragem:</span>
                      <span className="font-bold text-white">{formatKm(car.km)}</span>
                    </div>

                    <div className="flex justify-between p-2 rounded-xl bg-slate-900/60">
                      <span className="text-slate-400">Motor & Potência:</span>
                      <span className="font-bold text-white">{car.potencia}</span>
                    </div>

                    <div className="flex justify-between p-2 rounded-xl bg-slate-900/60">
                      <span className="text-slate-400">Câmbio:</span>
                      <span className="font-bold text-white truncate max-w-[120px]">{car.cambio}</span>
                    </div>

                    <div className="flex justify-between p-2 rounded-xl bg-slate-900/60">
                      <span className="text-slate-400">Consumo Urbano:</span>
                      <span className="font-bold text-emerald-400">{car.fichaTecnica?.consumoUrbano || '11,5 km/l'}</span>
                    </div>

                    <div className="flex justify-between p-2 rounded-xl bg-slate-900/60">
                      <span className="text-slate-400">Porta-Malas:</span>
                      <span className="font-bold text-white">{car.fichaTecnica?.portaMalas || '380L'}</span>
                    </div>

                    <div className="flex justify-between p-2 rounded-xl bg-slate-900/60">
                      <span className="text-slate-400">Previsão TCO Anual:</span>
                      <span className="font-bold text-cyan-300">{formatCurrency(car.tcoEstimadoAnual?.total || 14000)}</span>
                    </div>
                  </div>

                  {/* Ação */}
                  <Button
                    variant="primary"
                    size="sm"
                    icon={ArrowRight}
                    onClick={() => {
                      onClose();
                      if (onOpenFinancing) onOpenFinancing(car);
                    }}
                    className="w-full"
                  >
                    Simular Financiamento
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
