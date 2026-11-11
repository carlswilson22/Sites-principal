import React from 'react';
import { Sparkles, Smartphone, CheckCircle2 } from 'lucide-react';

export const Header = () => {
  return (
    <header className="relative pt-16 pb-12 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto">
      {/* Pill Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-sm font-semibold mb-5">
        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
        <span>Modelos para concessionárias e revendas</span>
      </div>

      {/* Main Title */}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight font-heading leading-tight mb-4 text-balance">
        Escolha o <span className="text-blue-600">modelo ideal</span> para o seu negócio
      </h1>

      {/* Subtitle */}
      <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed mb-8">
        Três formas de apresentar sua loja: uma vitrine direta, um showroom editorial ou uma experiência de exploração e comparação. Escolha a estrutura que combina com o seu negócio.
      </p>

      {/* Quick Metrics Bar */}
      <div className="inline-flex flex-wrap items-center justify-center gap-6 px-6 py-3 rounded-2xl bg-white border border-slate-200/80 text-sm text-slate-600 shadow-card">
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="font-semibold text-slate-900">3 modelos de site</span>
        </div>
        <div className="h-4 w-px bg-slate-200 hidden sm:block" />
        <div className="flex items-center gap-2">
          <CheckCircle2 aria-hidden="true" className="w-4 h-4 text-blue-600" />
          <span className="font-medium text-slate-700">Demonstrações interativas</span>
        </div>
        <div className="h-4 w-px bg-slate-200 hidden sm:block" />
        <div className="flex items-center gap-2">
          <Smartphone aria-hidden="true" className="w-4 h-4 text-indigo-600" />
          <span className="font-medium text-slate-700">Adaptado ao celular</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
