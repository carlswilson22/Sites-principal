import React from 'react';
import { ShieldCheck } from 'lucide-react';

export function StoreLogo({ name, size = 'md', theme = 'dark', showIcon = true, className = '', onClick }) {
  return <span onClick={onClick} aria-label={name} className={`inline-flex items-center gap-2 font-bold tracking-tight ${size === 'sm' ? 'text-base sm:text-lg' : 'text-xl sm:text-2xl'} ${theme === 'light' ? 'text-slate-900' : 'text-white'} ${className}`}>
    {showIcon && <ShieldCheck aria-hidden="true" className="w-7 h-7 text-blue-400 shrink-0" />}<span>{name}</span>
  </span>;
}
