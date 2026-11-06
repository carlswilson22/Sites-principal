import React from 'react';

export function Badge({ children, variant = 'cyan', size = 'sm', className = '' }) {
  const base = 'inline-flex items-center font-medium rounded-full tracking-wider uppercase';
  
  const variants = {
    cyan: 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30',
    emerald: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30',
    violet: 'bg-violet-500/10 text-violet-300 border border-violet-500/30',
    coral: 'bg-rose-500/10 text-rose-300 border border-rose-500/30',
    dark: 'bg-white/5 text-slate-300 border border-white/10'
  };

  const sizes = {
    xs: 'text-[10px] px-2 py-0.5',
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3.5 py-1.5'
  };

  return (
    <span className={`${base} ${variants[variant] || variants.cyan} ${sizes[size] || sizes.sm} ${className}`}>
      {children}
    </span>
  );
}
