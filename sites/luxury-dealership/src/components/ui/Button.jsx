import React from 'react';

export function Button({ 
  children, 
  variant = 'gold', 
  size = 'md', 
  icon: Icon, 
  iconPosition = 'right',
  className = '', 
  disabled = false,
  href,
  target,
  rel,
  onClick,
  type = 'button',
  ...props 
}) {
  const baseStyles = 'inline-flex items-center justify-center font-heading font-semibold tracking-wide transition-all duration-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const variants = {
    gold: 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:via-amber-400 hover:to-amber-500 text-black shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 border border-amber-300/40 font-bold',
    outline: 'bg-white/[0.03] hover:bg-white/[0.08] text-amber-300 hover:text-white border border-amber-500/30 hover:border-amber-400/60 shadow-sm backdrop-blur-sm',
    dark: 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-white/10 shadow-sm backdrop-blur-sm',
    whatsapp: 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg shadow-emerald-950/60 hover:shadow-emerald-500/30 border border-emerald-400/30 font-bold'
  };

  const sizes = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5',
    md: 'text-xs sm:text-sm px-5 py-2.5 gap-2',
    lg: 'text-sm sm:text-base px-6 py-3.5 gap-2.5'
  };

  const classes = `${baseStyles} ${variants[variant] || variants.gold} ${sizes[size] || sizes.md} ${className}`;

  if (href) {
    return (
      <a href={href} target={target} rel={rel} className={classes} {...props}>
        {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
        <span>{children}</span>
        {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes} {...props}>
      {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
      <span>{children}</span>
      {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
    </button>
  );
}
