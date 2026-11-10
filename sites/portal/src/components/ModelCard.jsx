import React from 'react';
import { ExternalLink, Check, Clock } from 'lucide-react';

export const ModelCard = ({ model }) => {
  const isAvailable = model.status === 'available';
  const tierBadges = {
    'Básico': 'bg-blue-50 text-blue-800 border-blue-200',
    'Intermediário': 'bg-indigo-50 text-indigo-800 border-indigo-200',
    'Completo': 'bg-emerald-50 text-emerald-800 border-emerald-200',
  };
  const badgeColor = tierBadges[model.tier] || 'bg-slate-100 text-slate-800 border-slate-200';

  return (
    <article aria-labelledby={`model-${model.id}`} className="model-card glass-card rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 group">
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100 border-b border-slate-200/80">
        {model.previewImage ? (
          <img src={import.meta.env.BASE_URL + model.previewImage} alt={`Prévia de ${model.title}`} loading="lazy" width="640" height="360" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
            <Clock className="w-10 h-10 text-slate-400 mb-2" />
            <p className="text-slate-600 font-medium text-sm">Modelo planejado</p>
          </div>
        )}
        <span className={`absolute top-4 right-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border shadow-sm ${badgeColor}`}>
          <span className="w-2 h-2 rounded-full bg-current" aria-hidden="true" />
          {model.badge}
        </span>
      </div>

      <h2 id={`model-${model.id}`} className="mx-6 mt-6 sm:mx-7 text-2xl leading-tight font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors">{model.title}</h2>
      <p className="mx-6 mt-3 sm:mx-7 text-sm font-semibold text-blue-700 leading-relaxed">{model.tagline}</p>
      <p className="mx-6 mt-4 sm:mx-7 text-base text-slate-600 leading-relaxed">{model.description}</p>

      <div className="mx-6 mt-6 mb-6 sm:mx-7">
        <h3 className="text-sm font-bold text-slate-700 mb-3">Destaques inclusos</h3>
        <ul className="space-y-3">
          {model.features.map((feature, index) => <li key={index} className="flex items-start gap-2 text-sm leading-relaxed text-slate-700">
            <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-1" aria-hidden="true" />
            <span>{feature}</span>
          </li>)}
        </ul>
      </div>

      <div className="model-card-action mx-6 mb-6 sm:mx-7 sm:mb-7 pt-4 border-t border-slate-200">
        {isAvailable ? <a href={import.meta.env.BASE_URL + model.path} aria-label={`Acessar demonstração de ${model.title}`} className="w-full min-h-12 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base inline-flex items-center justify-center gap-2 text-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600">
          Ver demonstração <ExternalLink className="w-4 h-4 shrink-0" aria-hidden="true" />
        </a> : <button disabled className="w-full min-h-12 py-3 px-4 rounded-xl bg-slate-100 text-slate-500 font-medium text-base inline-flex items-center justify-center gap-2 border border-slate-200">
          <Clock className="w-4 h-4" /> Em desenvolvimento
        </button>}
      </div>
    </article>
  );
};

export default ModelCard;
