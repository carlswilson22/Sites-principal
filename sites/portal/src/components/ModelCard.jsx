import React from 'react';
import { ExternalLink, Check, Clock, Sparkles, ShieldCheck } from 'lucide-react';

export const ModelCard = ({ model }) => {
  const isAvailable = model.status === 'available';

  // Badges estilizados por Tier
  const tierBadges = {
    'Básico': 'bg-blue-50 text-blue-700 border-blue-200',
    'Intermediário': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Completo': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  const badgeColor = tierBadges[model.tier] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 group">
      {/* Card Header / Preview Area */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100 border-b border-slate-200/80">
        {model.previewImage ? (
          <img
            src={model.previewImage}
            alt={model.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-100">
            <Clock className="w-10 h-10 text-slate-400 mb-2" />
            <p className="text-slate-500 font-medium text-xs">Modelo Planejado</p>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-4 right-4 z-10">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-sm ${badgeColor}`}>
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            {model.badge}
          </span>
        </div>

        {/* Category Pill */}
        <div className="absolute bottom-4 left-4 z-10">
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/95 text-slate-800 border border-slate-200 shadow-sm backdrop-blur-md inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>{model.category}</span>
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
        <div>
          <div className="mb-3">
            <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
              {model.title}
            </h3>
            <p className="text-xs font-semibold text-blue-600 mt-0.5">
              {model.tagline}
            </p>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed mb-5 font-normal">
            {model.description}
          </p>

          {/* Key Features */}
          <div className="space-y-2 mb-6">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Destaques Inclusos:
            </p>
            {model.features.map((feat, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="font-medium">{feat}</span>
              </div>
            ))}
          </div>

          {/* Tech Stack Tags */}
          <div className="flex flex-wrap gap-1.5 mb-6">
            {model.techStack.map((tech, idx) => (
              <span
                key={idx}
                className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-100">
          {isAvailable ? (
            <a
              href={model.path}
              className="w-full py-3.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm inline-flex items-center justify-center gap-2 transition-all duration-200 shadow-md shadow-blue-500/20 group/btn active:scale-[0.98]"
            >
              <span>Acessar Demonstração Ao Vivo</span>
              <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
            </a>
          ) : (
            <button
              disabled
              className="w-full py-3 px-5 rounded-xl bg-slate-100 text-slate-400 font-medium text-sm inline-flex items-center justify-center gap-2 cursor-not-allowed border border-slate-200"
            >
              <Clock className="w-4 h-4" />
              <span>Em Desenvolvimento</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModelCard;
