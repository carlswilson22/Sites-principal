import React from 'react';
import { Scale, ArrowRight, X, Car, Plus } from 'lucide-react';
import { formatCurrency, formatKm, calculateFipeDiff } from '../utils/formatters';
import { Button } from '../components/ui/Button';

export function ComparatorPage({ 
  comparedVehicles = [], 
  onRemoveFromCompare, 
  onNavigate, 
  onOpenFinancing 
}) {
  return (
    <div className="pt-24 pb-20 space-y-10">
      <div className="border-b border-slate-800 bg-gradient-to-b from-cyan-950/20 via-[#070a12] to-transparent py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-2">
            <Scale className="w-3.5 h-3.5" />
            <span>Matriz Técnica Comparativa</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Comparador de Veículos Lado a Lado
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mt-2 font-light">
            Compare especificações, consumo real, espaço interno e custo anual de manutenção para tomar a melhor decisão.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {comparedVehicles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {comparedVehicles.map((car) => {
              const fipe = calculateFipeDiff(car.preco, car.fipeReferencia);
              return (
                <div key={car.id} className="p-6 rounded-3xl bg-[#090d16] border border-cyan-500/30 flex flex-col justify-between space-y-6 shadow-xl relative">
                  <button
                    onClick={() => onRemoveFromCompare && onRemoveFromCompare(car.id)}
                    className="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors z-10"
                    title="Remover da comparação"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="space-y-3">
                    <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-slate-950 relative">
                      <img src={car.imagemPrincipal} alt={car.nome} className="w-full h-full object-cover" />
                      {fipe && (
                        <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-emerald-500/90 text-black text-[10px] font-bold">
                          {fipe.label}
                        </div>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-cyan-400 font-bold">{car.marca} • {car.ano}</span>
                      <h3 className="font-heading text-xl font-bold text-white">{car.nome}</h3>
                      <p className="text-xs text-slate-400">{car.versao}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase block">Preço à vista</span>
                      <span className="font-heading text-2xl font-black text-white">{formatCurrency(car.preco)}</span>
                      {car.parcela && (
                        <p className="text-xs text-cyan-400 font-semibold">
                          48x de {formatCurrency(car.parcela.valor)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Comparativo de Specs */}
                  <div className="space-y-2 text-xs pt-3 border-t border-slate-800 text-slate-300">
                    <div className="flex justify-between p-2 rounded-xl bg-slate-950">
                      <span className="text-slate-400">Quilometragem:</span>
                      <span className="font-bold text-white">{formatKm(car.km)}</span>
                    </div>

                    <div className="flex justify-between p-2 rounded-xl bg-slate-950">
                      <span className="text-slate-400">Motor & Potência:</span>
                      <span className="font-bold text-white">{car.potencia}</span>
                    </div>

                    <div className="flex justify-between p-2 rounded-xl bg-slate-950">
                      <span className="text-slate-400">Consumo Urbano:</span>
                      <span className="font-bold text-emerald-400">{car.fichaTecnica?.consumoUrbano || '11,5 km/l'}</span>
                    </div>

                    <div className="flex justify-between p-2 rounded-xl bg-slate-950">
                      <span className="text-slate-400">Porta-Malas:</span>
                      <span className="font-bold text-white">{car.fichaTecnica?.portaMalas || '380L'}</span>
                    </div>

                    <div className="flex justify-between p-2 rounded-xl bg-slate-950">
                      <span className="text-slate-400">TCO Anual Estimado:</span>
                      <span className="font-bold text-cyan-300">{formatCurrency(car.tcoEstimadoAnual?.total || 14000)}</span>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    icon={ArrowRight}
                    onClick={() => onOpenFinancing && onOpenFinancing(car)}
                    className="w-full"
                  >
                    Simular Financiamento
                  </Button>
                </div>
              );
            })}

            {comparedVehicles.length < 3 && (
              <div 
                onClick={() => onNavigate('estoque')}
                className="p-8 rounded-3xl bg-[#090d16]/50 border-2 border-dashed border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col items-center justify-center text-center space-y-3 cursor-pointer group min-h-[380px]"
              >
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6" />
                </div>
                <h4 className="font-heading text-base font-bold text-white">Adicionar Mais um Veículo</h4>
                <p className="text-xs text-slate-400 max-w-[200px]">
                  Você pode comparar até 3 modelos simultaneamente.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-12 rounded-3xl bg-[#090d16] border border-slate-800 text-center space-y-4">
            <Scale className="w-12 h-12 text-cyan-400 mx-auto opacity-40" />
            <h3 className="font-heading text-xl font-bold text-white">Nenhum veículo selecionado para comparar</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Navegue pelo estoque e clique no ícone da balança nos cards para adicionar veículos a esta comparação.
            </p>
            <Button
              variant="primary"
              size="md"
              icon={ArrowRight}
              onClick={() => onNavigate('estoque')}
            >
              Ir para o Estoque
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
