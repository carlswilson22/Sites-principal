import React from 'react';
import { ShieldCheck, Sparkles, Smartphone, CheckCircle2 } from 'lucide-react';

export const Header = () => {
  return (
    <header className="relative pt-16 pb-12 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto">
      {/* Brand Logo Header */}
      <div className="flex items-center justify-center mb-6">
        <div className="inline-flex items-center gap-2.5 font-sans select-none px-4 py-2 rounded-2xl bg-white border border-slate-200/90 shadow-card">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
          </div>
          <span className="text-2xl sm:text-3xl font-black tracking-tight uppercase italic leading-none inline-flex items-center">
            <span className="text-slate-900">AUTO</span>
            <span className="text-blue-600 ml-1.5">DEALERSHIP</span>
            <sup className="text-blue-500 font-bold text-xs -top-2 ml-0.5 relative">™</sup>
          </span>
        </div>
      </div>

      {/* Pill Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-sm font-semibold mb-5">
        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
        <span>Edições para concessionárias e revendas</span>
      </div>

      {/* Main Title */}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight font-heading leading-tight mb-4 text-balance">
        Escolha a edição ideal do <span className="text-blue-600 whitespace-nowrap">Auto-Dealership</span> para o seu negócio
      </h1>

      {/* Subtitle */}
      <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed mb-8">
        Compare as três edições e encontre os recursos que sua loja precisa: catálogo de veículos, atendimento, negociação e gestão em um só lugar.
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
