import React from 'react';
import { ShieldCheck } from 'lucide-react';

/**
 * AutomatchLogo / AutoDealershipLogo
 * Logotipo canônico oficial da marca Auto-Dealership.
 */
export default function AutomatchLogo({
  size = 'md',
  theme = 'auto',
  showIcon = true,
  className = '',
  onClick
}) {
  const sizeClasses = {
    sm: {
      text: 'text-lg',
      icon: 'w-6 h-6',
      tm: 'text-[9px] -top-1',
      gap: 'gap-1.5'
    },
    md: {
      text: 'text-xl',
      icon: 'w-7 h-7',
      tm: 'text-[10px] -top-1.5',
      gap: 'gap-2'
    },
    lg: {
      text: 'text-2xl sm:text-3xl',
      icon: 'w-8 h-8 sm:w-9 sm:h-9',
      tm: 'text-xs -top-2',
      gap: 'gap-2.5'
    }
  }[size] || {
    text: 'text-xl',
    icon: 'w-7 h-7',
    tm: 'text-[10px] -top-1.5',
    gap: 'gap-2'
  };

  const autoColor = theme === 'dark' 
    ? 'text-white' 
    : theme === 'light' 
    ? 'text-slate-900' 
    : 'text-white';

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center ${sizeClasses.gap} font-sans select-none group ${onClick ? 'cursor-pointer' : ''} ${className}`}
      aria-label="Auto-Dealership Enterprise - Concessionária Inteligente de Veículos"
    >
      {showIcon && (
        <div className="relative flex items-center justify-center">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
            <ShieldCheck
              className={`${sizeClasses.icon} text-emerald-400 group-hover:scale-105 transition-all duration-300 relative z-10 shrink-0`}
            />
          </div>
        </div>
      )}
      <span className={`${sizeClasses.text} font-black tracking-tight uppercase italic leading-none inline-flex items-center`}>
        <span className={autoColor}>AUTO</span>
        <span className="text-emerald-400 group-hover:text-emerald-300 transition-colors duration-200 ml-1">DEALERSHIP</span>
        <sup className={`text-emerald-400 font-bold ${sizeClasses.tm} ml-0.5 relative`}>™</sup>
      </span>
    </div>
  );
}

export { AutomatchLogo as AutoDealershipLogo };

