import { type HTMLAttributes } from 'react';
import { motion } from 'framer-motion';

export interface LoadingProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export const Loading = ({
  size = 'md',
  fullScreen = false,
  className = '',
  ...props
}: LoadingProps) => {
  const sizeStyles = {
    sm: {
      spinner: 'w-4 h-4',
      border: 'border-2',
    },
    md: {
      spinner: 'w-8 h-8',
      border: 'border-2',
    },
    lg: {
      spinner: 'w-12 h-12',
      border: 'border-3',
    },
  };

  const spinner = (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      }}
      className={`
        ${sizeStyles[size].spinner}
        rounded-full
        border-2 border-background-tertiary
        border-t-accent-blue
      `}
    />
  );

  if (fullScreen) {
    return (
      <div
        className={`
          fixed inset-0 z-50
          flex items-center justify-center
          bg-background-primary/50 backdrop-blur-sm
          ${className}
        `}
        {...props}
      >
        <div
          className="
            p-lg rounded-xl
            bg-background-secondary/80 backdrop-blur-xl
            border border-border
            shadow-xl shadow-black/10
          "
        >
          {spinner}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center ${className}`}
      {...props}
    >
      <div
        className="
          p-md rounded-lg
          bg-background-secondary/50 backdrop-blur-sm
        "
      >
        {spinner}
      </div>
    </div>
  );
};

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

export const Spinner = ({
  size = 'md',
  className = '',
  ...props
}: SpinnerProps) => {
  const sizeStyles = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      }}
      className={`
        ${sizeStyles[size]}
        rounded-full
        border-background-tertiary
        border-t-accent-blue
        ${className}
      `}
      {...props}
    />
  );
};

Spinner.displayName = 'Spinner';
Loading.displayName = 'Loading';
