import { type HTMLAttributes, type ReactNode } from 'react';
import { motion } from 'framer-motion';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton = ({
  width,
  height,
  variant = 'text',
  animation = 'pulse',
  className = '',
  style,
  ...props
}: SkeletonProps) => {
  const variantStyles = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  };

  const animationStyles = {
    pulse: 'bg-background-tertiary',
    wave: 'bg-gradient-to-r from-background-tertiary via-background-secondary to-background-tertiary bg-[length:200%_100%]',
    none: '',
  };

  return (
    <motion.div
      animate={
        animation === 'pulse'
          ? {
              opacity: [0.5, 1, 0.5],
            }
          : animation === 'wave'
            ? {
                backgroundPosition: ['200% 0', '-200% 0'],
              }
            : undefined
      }
      transition={
        animation === 'pulse'
          ? {
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }
          : animation === 'wave'
            ? {
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear',
              }
            : undefined
      }
      className={`
        ${variantStyles[variant]}
        ${animationStyles[animation]}
        ${className}
      `}
      style={{
        width: width,
        height: height || (variant === 'text' ? '1em' : undefined),
        ...style,
      }}
      {...props}
    />
  );
};

Skeleton.displayName = 'Skeleton';

export interface SkeletonTextProps extends HTMLAttributes<HTMLDivElement> {
  lines?: number;
  spacing?: 'sm' | 'md' | 'lg';
}

export const SkeletonText = ({
  lines = 3,
  spacing = 'md',
  className = '',
  ...props
}: SkeletonTextProps) => {
  const spacingStyles = {
    sm: 'space-y-xs',
    md: 'space-y-sm',
    lg: 'space-y-lg',
  };

  return (
    <div className={`w-full ${spacingStyles[spacing]} ${className}`} {...props}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          height={14}
          width={index === lines - 1 ? '70%' : '100%'}
        />
      ))}
    </div>
  );
};

SkeletonText.displayName = 'SkeletonText';

export interface SkeletonAvatarProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

export const SkeletonAvatar = ({
  size = 'md',
  className = '',
  ...props
}: SkeletonAvatarProps) => {
  const sizeStyles = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  return (
    <Skeleton
      variant="circular"
      className={`${sizeStyles[size]} ${className}`}
      {...props}
    />
  );
};

SkeletonAvatar.displayName = 'SkeletonAvatar';

export interface SkeletonCardProps extends HTMLAttributes<HTMLDivElement> {
  hasAvatar?: boolean;
  hasImage?: boolean;
}

export const SkeletonCard = ({
  hasAvatar = true,
  hasImage = false,
  className = '',
  ...props
}: SkeletonCardProps) => {
  return (
    <div
      className={`
        p-lg rounded-lg border border-border
        bg-background-secondary space-y-md
        ${className}
      `}
      {...props}
    >
      <div className="flex items-center gap-sm">
        {hasAvatar && <SkeletonAvatar size="md" />}
        <div className="flex-1 space-y-xs">
          <Skeleton variant="text" height={14} width="40%" />
          <Skeleton variant="text" height={12} width="25%" />
        </div>
      </div>
      {hasImage && <Skeleton variant="rectangular" height={120} />}
      <SkeletonText lines={2} />
    </div>
  );
};

SkeletonCard.displayName = 'SkeletonCard';
