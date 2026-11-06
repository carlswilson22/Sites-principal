import React from 'react';
import { GitBranch, ShieldCheck } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="mt-24 border-t border-slate-800/80 bg-slate-950/60 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
            M
          </div>
          <div>
            <p className="font-semibold text-white">Sites Modelos — Monorepo</p>
            <p className="text-xs text-slate-400">Arquitetura modular escalável para 3 modelos de sites</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <GitBranch className="w-4 h-4 text-blue-400" />
            <span>GitHub Pages CI/CD Automático</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Produção Otimizada</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;