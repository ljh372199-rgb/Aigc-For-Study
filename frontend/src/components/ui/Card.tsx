import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

type CardVariant = 'default' | 'interactive' | 'highlighted';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  glow?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', glow = false, className = '', children, ...props }, ref) => {
    const baseStyles = 'rounded-2xl p-6 transition-all duration-300 relative overflow-hidden';
    
    const variants = {
      default: 'ceramic hover:shadow-xl',
      interactive: 'ceramic cursor-pointer hover:border-white/20 hover:-translate-y-1',
      highlighted: 'ceramic border-2 border-transparent bg-gradient-to-r from-[#6366f1]/20 to-[#818cf8]/20 hover:shadow-2xl',
    };
    
    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${glow ? 'animate-pulse-glow' : ''} ${className}`}
        {...props}
      >
        {/* 顶部光泽高光 */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
