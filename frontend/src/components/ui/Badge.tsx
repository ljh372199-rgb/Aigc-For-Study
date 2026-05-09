import type { HTMLAttributes } from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'primary' | 'secondary';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ variant = 'default', className = '', children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-[#334155] text-[#94a3b8]',
    success: 'bg-[#10b981]/20 text-[#10b981]',
    warning: 'bg-[#f59e0b]/20 text-[#f59e0b]',
    error: 'bg-[#ef4444]/20 text-[#ef4444]',
    primary: 'bg-[#6366f1]/20 text-[#6366f1]',
    secondary: 'bg-slate-200/60 text-slate-600',
  };
  
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
