import { type HTMLAttributes, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Button } from './Button';

export interface EmptyProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export const Empty = ({
  icon,
  title = '暂无数据',
  description,
  action,
  secondaryAction,
  className = '',
  ...props
}: EmptyProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        flex flex-col items-center justify-center py-xl px-lg
        text-center
        ${className}
      `}
      {...props}
    >
      {icon ? (
        <div className="mb-lg text-text-tertiary">{icon}</div>
      ) : (
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="mb-lg"
        >
          <svg
            className="w-16 h-16 text-text-tertiary/50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </motion.div>
      )}

      <h3 className="text-lg font-medium text-text-primary mb-xs">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-text-tertiary max-w-sm mb-lg">
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="flex items-center gap-sm mt-sm">
          {action && (
            <Button onClick={action.onClick} size="sm">
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button onClick={secondaryAction.onClick} variant="outline" size="sm">
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
};

Empty.displayName = 'Empty';
