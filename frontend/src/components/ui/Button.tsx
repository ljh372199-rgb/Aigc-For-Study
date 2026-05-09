import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, leftIcon, rightIcon, children, className = '', disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden';

    const variants = {
      primary: `
        bg-gradient-to-br from-white via-white to-slate-50 
        border border-slate-200/60 text-slate-900 
        hover:from-white hover:via-slate-50 hover:to-slate-100
        shadow-[0_4px_12px_rgba(196,205,214,0.06),inset_0_1px_0_rgba(255,255,255,0.9)]
        hover:shadow-[0_8px_16px_rgba(196,205,214,0.08),inset_0_1px_0_rgba(255,255,255,0.95)]
      `,
      secondary: 'bg-slate-50/80 border border-slate-200/60 text-slate-600 hover:bg-slate-100/80 hover:text-slate-800',
      ghost: 'text-slate-600 hover:text-slate-800 hover:bg-slate-50/60',
      danger: 'bg-red-50/80 text-red-600 hover:bg-red-100/80',
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm gap-2',
      md: 'px-5 py-2.5 text-base gap-2',
      lg: 'px-6 py-3 text-lg gap-3',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        <span className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent rounded-xl pointer-events-none" />
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {!loading && leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';