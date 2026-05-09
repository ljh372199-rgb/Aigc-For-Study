import { HTMLAttributes, forwardRef } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = '', variant = 'default', size = 'md', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full';

    const variantStyles = {
      default: 'bg-background-tertiary text-text-secondary',
      success: 'bg-accent-green/20 text-accent-green',
      warning: 'bg-accent-yellow/20 text-accent-yellow',
      error: 'bg-accent-red/20 text-accent-red',
      info: 'bg-accent-blue/20 text-accent-blue',
    };

    const sizeStyles = {
      sm: 'px-sm text-xs',
      md: 'px-md text-sm',
    };

    return (
      <span
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
