import React from 'react';

export function Badge({ children, variant = 'gold', size = 'sm', className = '' }) {
  const base = 'inline-flex items-center font-medium rounded-full tracking-wider uppercase';
  
  const variants = {
    gold: 'bg-amber-500/10 text-amber-300 border border-amber-500/30',
    emerald: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30',
    blue: 'bg-blue-500/10 text-blue-300 border border-blue-500/30',
    dark: 'bg-white/5 text-slate-300 border border-white/10'
  };

  const sizes = {
    xs: 'text-[10px] px-2 py-0.5',
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3.5 py-1.5'
  };

  return (
    <span className={`${base} ${variants[variant] || variants.gold} ${sizes[size] || sizes.sm} ${className}`}>
      {children}
    </span>
  );
}
