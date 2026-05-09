import { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-primary disabled:opacity-50 disabled:cursor-not-allowed';

    const variantStyles = {
      primary: 'bg-accent-blue text-white hover:bg-accent-blue/90 focus:ring-accent-blue',
      secondary: 'bg-background-tertiary text-text-primary hover:bg-background-secondary border border-border hover:border-border-hover focus:ring-accent-blue',
      outline: 'bg-transparent border border-border text-text-primary hover:bg-background-secondary hover:border-border-hover focus:ring-accent-blue',
      ghost: 'bg-transparent text-text-primary hover:bg-background-secondary focus:ring-accent-blue',
    };

    const sizeStyles = {
      sm: 'px-sm py-xs text-sm rounded-sm',
      md: 'px-lg py-md text-base rounded-md',
      lg: 'px-xl py-lg text-lg rounded-md',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
