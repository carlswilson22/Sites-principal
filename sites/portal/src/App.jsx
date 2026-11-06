import React from 'react';
import Header from './components/Header';
import ModelCard from './components/ModelCard';
import Footer from './components/Footer';
import { modelsList } from './data/modelsData';
import { Code2, Cpu, Globe2, Workflow } from 'lucide-react';

export function App() {
  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Background Decorative Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/3 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[160px]" />
      </div>

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

          {/* Architecture Insights Section */}
          <section className="mt-20 p-8 rounded-3xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-2xl font-bold text-white font-heading">
                Arquitetura do Repositório Monorepo
              </h2>
              <p className="text-sm text-slate-400 mt-2">
                Projetado com separação estrita de responsabilidades para manter cada modelo 100% autônomo.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/60">
                <Workflow className="w-8 h-8 text-blue-400 mb-3" />
                <h4 className="font-semibold text-white text-sm mb-1">NPM Workspaces</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Gerenciamento compartilhado e isolado de dependências entre a raiz e cada pasta de modelo.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/60">
                <Cpu className="w-8 h-8 text-cyan-400 mb-3" />
                <h4 className="font-semibold text-white text-sm mb-1">Build Orquestrado</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Script automatizado que detecta dinamicamente subsites e compila todos para uma pasta unificada.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/60">
                <Globe2 className="w-8 h-8 text-emerald-400 mb-3" />
                <h4 className="font-semibold text-white text-sm mb-1">Roteamento GitHub Pages</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  O Hub responde na raiz e cada modelo opera em seu respectivo subcaminho relativo sem conflitos.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/60">
                <Code2 className="w-8 h-8 text-indigo-400 mb-3" />
                <h4 className="font-semibold text-white text-sm mb-1">Exportabilidade</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Cada modelo pode ser facilmente extraído ou entregue como repositório independente para clientes.
                </p>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default App;