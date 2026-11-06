import React from 'react';
import Header from './components/Header';
import ModelCard from './components/ModelCard';
import Footer from './components/Footer';
import { modelsList } from './data/modelsData';
import { ShieldCheck, Check, X, RotateCw, Sparkles, SlidersHorizontal, Calculator, MessageSquareCode } from 'lucide-react';

export function App() {
  const comparisonRows = [
    { name: 'Catálogo de Seminovos Periciados (Grid)', essential: true, pro: true, enterprise: true },
    { name: 'Modal de Ficha Técnica Pericial com Galeria', essential: true, pro: true, enterprise: true },
    { name: 'Integração de Contato e Proposta via WhatsApp', essential: true, pro: true, enterprise: true },
    { name: 'Visualizador 360° Orbital Interativo', essential: true, pro: true, enterprise: true, highlight: true },
    { name: 'Simulador Financeiro (Amortização Price/SAC)', essential: false, pro: true, enterprise: true },
    { name: 'Módulo de Avaliação de Troca (Trade-In / FIPE)', essential: false, pro: true, enterprise: true },
    { name: 'Filtros Avançados de Showroom (Preço, Câmbio)', essential: false, pro: true, enterprise: true },
    { name: 'Vídeo Pericial Integrado (20 segundos)', essential: false, pro: true, enterprise: true },
    { name: 'Agendamento de Concierge / Test Drive VIP', essential: false, pro: true, enterprise: true },
    { name: 'Consultor Virtual com Inteligência Artificial', essential: false, false: false, enterprise: true, highlight: true },
    { name: 'Comparador Técnico Lado a Lado (Até 3 Carros)', essential: false, false: false, enterprise: true },
    { name: 'Dossiê Cautelar IA (Leilão, Sinistro, Pintura)', essential: false, false: false, enterprise: true },
    { name: 'Calculadora de Custo Total Anual (TCO)', essential: false, false: false, enterprise: true },
    { name: 'Sistema de Veículos Favoritos & Alertas de Preço', essential: false, false: false, enterprise: true },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white font-sans">
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Hero & Intro Section */}
        <Header />

        {/* Models Grid Showcase */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {modelsList.map((model) => (
              <ModelCard key={model.id} model={model} />
            ))}
          </div>

          {/* Comparativo de Recursos das 3 Edições */}
          <section className="mt-20 p-6 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-card">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                Matriz Comparativa Oficial
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Comparativo de Recursos por Edição
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                Veja o que cada tier oferece e escolha a configuração exata para a necessidade da sua loja.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-700">
                    <th className="py-4 px-4 font-bold text-base">Funcionalidade</th>
                    <th className="py-4 px-4 font-bold text-center text-blue-700 bg-blue-50/50 rounded-t-xl">
                      Essential (Tier 1)
                    </th>
                    <th className="py-4 px-4 font-bold text-center text-indigo-700 bg-indigo-50/50 rounded-t-xl">
                      Pro (Tier 2)
                    </th>
                    <th className="py-4 px-4 font-bold text-center text-emerald-700 bg-emerald-50/50 rounded-t-xl">
                      Enterprise (Tier 3)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {comparisonRows.map((row, idx) => (
                    <tr key={idx} className={row.highlight ? 'bg-blue-50/30' : 'hover:bg-slate-50/60 transition-colors'}>
                      <td className="py-3.5 px-4 font-medium text-slate-800 flex items-center gap-2">
                        {row.highlight && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                        <span>{row.name}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center bg-blue-50/20">
                        {row.essential ? (
                          <Check className="w-5 h-5 text-emerald-600 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-slate-300 mx-auto" />
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center bg-indigo-50/20">
                        {row.pro ? (
                          <Check className="w-5 h-5 text-emerald-600 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-slate-300 mx-auto" />
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center bg-emerald-50/20">
                        {row.enterprise ? (
                          <Check className="w-5 h-5 text-emerald-600 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-slate-300 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default App;
