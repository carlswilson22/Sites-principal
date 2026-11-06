import React, { useState } from 'react';
import { Search, ShieldCheck, ArrowDown } from 'lucide-react';
import { Button } from '../ui/Button';

export function HeroSection({ onSearch, categories }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({ term: searchTerm, category: selectedCategory });
    }
    const estoqueEl = document.getElementById('estoque');
    if (estoqueEl) {
      estoqueEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center pt-28 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Background Glows & Aesthetics */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-blue-600/15 via-emerald-500/10 to-indigo-600/15 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.15),rgba(255,255,255,0))] pointer-events-none" />

      {/* Grid Pattern Sutil */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
        {/* Badge Flutuante de Credibilidade */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-blue-500/30 text-blue-300 text-xs sm:text-sm font-semibold backdrop-blur-md shadow-lg shadow-blue-950/40 animate-fade-in">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Showroom Certificado com Perícia Cautelar Digital</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>

        {/* Título Principal de Alto Impacto */}
        <div className="space-y-4">
          <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1]">
            Encontre o seu próximo carro com{' '}
            <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-emerald-400 bg-clip-text text-transparent">
              garantia e procedência total
            </span>.
          </h1>
          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
            Mais de 100 veículos seminovos rigorosamente avaliados, 100% aprovados em laudo cautelar e prontos para rodar.
          </p>
        </div>

        {/* Barra de Busca Rápida Integrada */}
        <div className="max-w-3xl mx-auto">
          <form 
            onSubmit={handleSearchSubmit}
            className="p-2 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-2xl shadow-black/60 backdrop-blur-xl flex flex-col sm:flex-row gap-2"
          >
            {/* Input de Busca */}
            <div className="flex-1 flex items-center px-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
              <input
                type="text"
                placeholder="Qual modelo você procura? (ex: Tracker, Corolla, Polo...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
              />
            </div>

            {/* Select de Categoria */}
            <div className="sm:w-48 px-3 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="todos" className="bg-slate-900 text-white">Todas Categorias</option>
                <option value="suv" className="bg-slate-900 text-white">SUVs</option>
                <option value="sedan" className="bg-slate-900 text-white">Sedans</option>
                <option value="hatch" className="bg-slate-900 text-white">Hatches</option>
                <option value="pickup" className="bg-slate-900 text-white">Picapes</option>
                <option value="esportivo" className="bg-slate-900 text-white">Esportivos</option>
              </select>
            </div>

            {/* Botão de Envio */}
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={Search}
              className="sm:w-36 py-3"
            >
              Buscar
            </Button>
          </form>
        </div>

        {/* Badges de Confiança em Linha */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-slate-300">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
            <span>Laudo Cautelar 100% Aprovado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
            <span>1 Ano de Garantia Completa</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400"></div>
            <span>Troca com Troco & Financiamento</span>
          </div>
        </div>

        {/* Indicador de Rolagem */}
        <div className="pt-4">
          <a
            href="#estoque"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <span>Ver nosso estoque completo</span>
            <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
          </a>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
