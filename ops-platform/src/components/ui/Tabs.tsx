import {
  type HTMLAttributes,
  type ReactNode,
  useState,
  useRef,
  useEffect,
} from 'react';
import { motion } from 'framer-motion';

export interface TabItem {
  key: string;
  label: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

export interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  items: TabItem[];
  defaultActiveKey?: string;
  activeKey?: string;
  onChange?: (key: string) => void;
  variant?: 'line' | 'pill';
  size?: 'sm' | 'md';
}

export const Tabs = ({
  items,
  defaultActiveKey,
  activeKey,
  onChange,
  variant = 'line',
  size = 'md',
  className = '',
  ...props
}: TabsProps) => {
  const [internalActiveKey, setInternalActiveKey] = useState(
    defaultActiveKey || items[0]?.key
  );
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabListRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const currentActiveKey = activeKey ?? internalActiveKey;

  const handleTabClick = (key: string, disabled?: boolean) => {
    if (disabled) return;
    if (!activeKey) {
      setInternalActiveKey(key);
    }
    onChange?.(key);
  };

  useEffect(() => {
    const activeTab = tabRefs.current.get(currentActiveKey);
    const tabList = tabListRef.current;
    if (activeTab && tabList && variant === 'line') {
      const tabRect = activeTab.getBoundingClientRect();
      const listRect = tabList.getBoundingClientRect();
      setIndicatorStyle({
        left: tabRect.left - listRect.left,
        width: tabRect.width,
      });
    }
  }, [currentActiveKey, variant, items]);

  const sizeStyles = {
    sm: 'text-sm py-sm',
    md: 'text-base py-md',
  };

  const activeContent = items.find(item => item.key === currentActiveKey)?.content;

  return (
    <div className={`w-full ${className}`} {...props}>
      <div
        ref={tabListRef}
        className={`
          relative flex
          ${variant === 'line' ? 'border-b border-border' : 'bg-background-tertiary rounded-lg p-xs'}
        `}
        role="tablist"
      >
        {variant === 'line' && (
          <motion.div
            className="absolute bottom-0 h-0.5 bg-accent-blue rounded-full"
            initial={false}
            animate={{ left: indicatorStyle.left, width: indicatorStyle.width }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          />
        )}

        {items.map(item => (
          <button
            key={item.key}
            ref={el => {
              if (el) tabRefs.current.set(item.key, el);
            }}
            role="tab"
            aria-selected={currentActiveKey === item.key}
            aria-controls={`panel-${item.key}`}
            disabled={item.disabled}
            onClick={() => handleTabClick(item.key, item.disabled)}
            className={`
              relative flex items-center justify-center gap-xs
              ${sizeStyles[size]}
              font-medium transition-colors duration-200
              focus:outline-none
              ${
                variant === 'line'
                  ? `
                      px-lg text-text-tertiary
                      hover:text-text-primary
                      ${
                        currentActiveKey === item.key
                          ? 'text-accent-blue'
                          : ''
                      }
                    `
                  : `
                      px-md rounded-md
                      ${
                        currentActiveKey === item.key
                          ? 'bg-background-secondary text-text-primary shadow-sm'
                          : 'text-text-tertiary hover:text-text-primary'
                      }
                    `
              }
              ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`panel-${currentActiveKey}`}
        aria-labelledby={currentActiveKey}
        className="pt-lg"
      >
        {activeContent}
      </div>
    </div>
  );
};

Tabs.displayName = 'Tabs';
