import React, { useState } from 'react';
import { Search, Zap, CheckCircle2, Bot, ArrowRight, Calculator, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';

export function HeroSection({ onSearch, onNavigate }) {
  const [term, setTerm] = useState('');
  const [category, setCategory] = useState('todos');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch({ term, category });
  };

  return (
    <section className="relative pt-24 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-[#090d16] via-[#070a12] to-[#070a12]">
      {/* Luzes de fundo Tech */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-cyan-500/20 via-emerald-500/10 to-violet-500/20 blur-[100px] pointer-events-none rounded-full" />

      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
        {/* Badge Inteligente */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
          <Zap className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
          <span>Modelo 03 — Plataforma Completa com IA & Comparador</span>
        </div>

        {/* Título Principal */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black font-heading text-white tracking-tight leading-none">
          Seu Carro Novo com <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
            Inteligência & Aprovação em 15 Min
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
          Seminovos selecionados com Laudo Cautelar 100% aprovado, 1 ano de garantia, cálculo de TCO e consultoria com inteligência artificial para a melhor escolha.
        </p>

        {/* Barra de Busca Rápida Integrada */}
        <div className="max-w-3xl mx-auto p-3 sm:p-4 rounded-3xl bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Busque por modelo, marca (Tracker, Corolla Cross, HB20...)"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-400 placeholder-slate-500"
              />
            </div>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="todos">Todas Categorias</option>
              <option value="suv">SUVs</option>
              <option value="hatch">Hatches</option>
              <option value="sedan">Sedans</option>
            </select>

            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={ArrowRight}
              className="py-3 px-6 shrink-0"
            >
              Buscar Estoque
            </Button>
          </form>
        </div>

        {/* Botões Rápidos: Consultor IA e Comparador */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button
            variant="ai"
            size="md"
            icon={Bot}
            onClick={() => onNavigate && onNavigate('consultor-ia')}
          >
            Falar com Consultor IA
          </Button>

          <Button
            variant="outline"
            size="md"
            icon={Calculator}
            onClick={() => onNavigate && onNavigate('simulador')}
          >
            Simulador de Parcelas
          </Button>
        </div>

        {/* Badges de Confiança */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-300 pt-4">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/60 border border-slate-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 1 Ano de Garantia Completa
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/60 border border-slate-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Laudo Cautelar 100% Aprovado
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/60 border border-slate-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Troca com Troco no Pix
          </span>
        </div>
      </div>
    </section>
  );
}
