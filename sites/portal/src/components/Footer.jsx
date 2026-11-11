import React from 'react';
import { GitBranch, ShieldCheck } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="mt-24 border-t border-slate-200/90 bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-slate-500">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-slate-900">Explore os modelos</p>
            <p className="text-xs text-slate-500">Sites para concessionárias e revendas</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <GitBranch className="w-4 h-4 text-blue-600" />
            <span>GitHub Pages CI/CD Automatizado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Perícia Cautelar 100% Integrada</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
