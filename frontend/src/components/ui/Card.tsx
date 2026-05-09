import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: string;
  onClick?: () => void;
}

export function Card({ children, className = '', variant, onClick, ...props }: CardProps) {
  return (
    <div 
      className={`bg-white ring-1 ring-zinc-200/60 rounded-xl ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}