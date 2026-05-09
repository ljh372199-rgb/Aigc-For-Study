import { type HTMLAttributes, type ReactNode, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface TooltipProps extends HTMLAttributes<HTMLDivElement> {
  content: ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  disabled?: boolean;
}

export const Tooltip = ({
  content,
  children,
  position = 'top',
  delay = 300,
  disabled = false,
  className = '',
  ...props
}: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    if (disabled) return;
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  };

  const positionStyles = {
    top: {
      container: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
      arrow: 'top-full left-1/2 -translate-x-1/2 border-t-background-secondary border-l-transparent border-r-transparent border-b-transparent',
    },
    bottom: {
      container: 'top-full left-1/2 -translate-x-1/2 mt-2',
      arrow: 'bottom-full left-1/2 -translate-x-1/2 border-b-background-secondary border-l-transparent border-r-transparent border-t-transparent',
    },
    left: {
      container: 'right-full top-1/2 -translate-y-1/2 mr-2',
      arrow: 'left-full top-1/2 -translate-y-1/2 border-l-background-secondary border-t-transparent border-b-transparent border-r-transparent',
    },
    right: {
      container: 'left-full top-1/2 -translate-y-1/2 ml-2',
      arrow: 'right-full top-1/2 -translate-y-1/2 border-r-background-secondary border-t-transparent border-b-transparent border-l-transparent',
    },
  };

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      {...props}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`
              absolute z-50 ${positionStyles[position].container}
              pointer-events-none
            `}
            role="tooltip"
          >
            <div
              className="
                px-sm py-xs text-sm
                bg-background-secondary/95 backdrop-blur-xl
                border border-border rounded-md
                shadow-lg shadow-black/10
                text-text-primary whitespace-nowrap
              "
            >
              {content}
            </div>
            <div
              className={`
                absolute w-0 h-0
                border-4 border-solid
                ${positionStyles[position].arrow}
              `}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

Tooltip.displayName = 'Tooltip';
