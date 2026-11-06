import React from 'react';

export function Badge({ children, variant = 'default', size = 'sm', className = '', icon: Icon }) {
  const baseStyles = 'inline-flex items-center font-medium rounded-full tracking-wide';

  const sizes = {
    xs: 'text-[10px] px-2 py-0.5 gap-1',
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-sm px-3 py-1.5 gap-1.5'
  };

  const variants = {
    default: 'bg-slate-800/90 text-slate-300 border border-slate-700/60',
    blue: 'bg-blue-950/70 text-blue-300 border border-blue-500/30',
    emerald: 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/30',
    amber: 'bg-amber-950/70 text-amber-300 border border-amber-500/30',
    purple: 'bg-purple-950/70 text-purple-300 border border-purple-500/30'
  };

  return (
    <span className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}>
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      {children}
    </span>
  );
}
