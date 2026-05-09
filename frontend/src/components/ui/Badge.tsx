import type { ReactNode } from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'primary' | 'error';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variants = {
    default: 'bg-zinc-100 text-zinc-600',
    success: 'bg-green-50 text-green-600',
    warning: 'bg-amber-50 text-amber-600',
    danger: 'bg-red-50 text-red-600',
    primary: 'bg-zinc-100 text-zinc-600',
    error: 'bg-red-50 text-red-600',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-sm font-medium rounded-full ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}