/**
 * packages/merchant-core/src/components/common/MetricCard.jsx
 * Card de métrica padronizado com indicador numérico, ícone e variação.
 */
import React from 'react';

export function MetricCard({ title, value, icon: Icon, description, trend, color = 'blue' }) {
  const colorMap = {
    blue: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      text: 'text-blue-400',
      glow: 'shadow-blue-500/10'
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
      glow: 'shadow-emerald-500/10'
    },
    amber: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      text: 'text-amber-400',
      glow: 'shadow-amber-500/10'
    },
    rose: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      text: 'text-rose-400',
      glow: 'shadow-rose-500/10'
    }
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div className={`p-5 rounded-2xl bg-slate-900/60 border ${scheme.border} backdrop-blur-sm shadow-xl ${scheme.glow} flex flex-col justify-between transition-all hover:border-slate-700`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl ${scheme.bg} border ${scheme.border} flex items-center justify-center ${scheme.text}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{value}</div>
        {description && (
          <p className="text-xs text-slate-400 mt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center gap-1.5 mt-2">
            <span className={`text-xs font-semibold ${trend.positive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {trend.positive ? '+' : ''}{trend.value}%
            </span>
            <span className="text-[11px] text-slate-500">vs período anterior</span>
          </div>
        )}
      </div>
    </div>
  );
}
