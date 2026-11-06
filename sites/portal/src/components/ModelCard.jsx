import React from 'react';
import { ExternalLink, Check, Clock, Construction, Sparkles } from 'lucide-react';

export const ModelCard = ({ model }) => {
  const isAvailable = model.status === 'available';
  const isInDevelopment = model.status === 'in_development';

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 group">
      {/* Card Header / Preview Area */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900 border-b border-slate-800">
        {model.previewImage ? (
          <img
            src={model.previewImage}
            alt={model.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
            {isInDevelopment ? (
              <Construction className="w-12 h-12 text-amber-400 mb-3 animate-bounce" />
            ) : (
              <Clock className="w-12 h-12 text-slate-500 mb-3" />
            )}
            <p className="text-slate-400 font-medium text-sm">
              {isInDevelopment ? 'Espaço Modular Pronto para Desenvolvimento' : 'Modelo Planejado para Expansão'}
            </p>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-4 right-4 z-10">
          {isAvailable && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {model.badge}
            </span>
          )}
          {isInDevelopment && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              {model.badge}
            </span>
          )}
          {model.status === 'planned' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-700/40 text-slate-400 border border-slate-600/30 backdrop-blur-md">
              {model.badge}
            </span>
          )}
        </div>

        {/* Category Pill */}
        <div className="absolute bottom-4 left-4 z-10">
          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-900/80 text-blue-300 border border-slate-700 backdrop-blur-md">
            {model.category}
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
        <div>
          <div className="mb-4">
            <h3 className="text-2xl font-bold text-white font-heading group-hover:text-blue-400 transition-colors">
              {model.title}
            </h3>
            <p className="text-sm font-medium text-slate-400 mt-1">
              {model.tagline}
            </p>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed mb-6 font-light">
            {model.description}
          </p>

          {/* Key Features */}
          <div className="space-y-2 mb-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Destaques do Projeto:
            </p>
            {model.features.map((feat, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{feat}</span>
              </div>
            ))}
          </div>

          {/* Tech Stack Tags */}
          <div className="flex flex-wrap gap-1.5 mb-6">
            {model.techStack.map((tech, idx) => (
              <span
                key={idx}
                className="text-[11px] px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-800/80">
          {isAvailable ? (
            <a
              href={model.path}
              className="w-full py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm inline-flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-blue-600/25 group/btn"
            >
              <span>Acessar Demonstração Ao Vivo</span>
              <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
            </a>
          ) : (
            <button
              disabled
              className="w-full py-3 px-5 rounded-xl bg-slate-800/80 text-slate-400 font-medium text-sm inline-flex items-center justify-center gap-2 cursor-not-allowed border border-slate-700/50"
            >
              <Clock className="w-4 h-4" />
              <span>{isInDevelopment ? 'Em Desenvolvimento' : 'Planejado'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModelCard;