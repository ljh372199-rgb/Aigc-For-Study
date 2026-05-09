import { type HTMLAttributes, forwardRef, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectOptionGroup {
  label: string;
  options: SelectOption[];
}

export interface SelectProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  options?: SelectOption[];
  groups?: SelectOptionGroup[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
}

export const Select = forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      className = '',
      options = [],
      groups = [],
      value,
      onChange,
      placeholder = '请选择',
      disabled = false,
      error = false,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);

    const allOptions = groups.length > 0
      ? groups.flatMap(group => group.options)
      : options;

    const selectedOption = allOptions.find(opt => opt.value === value);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;

      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (isOpen && highlightedIndex >= 0) {
            const option = allOptions[highlightedIndex];
            if (!option.disabled) {
              onChange?.(option.value);
              setIsOpen(false);
            }
          } else {
            setIsOpen(true);
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else {
            setHighlightedIndex(prev =>
              prev < allOptions.length - 1 ? prev + 1 : prev
            );
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (isOpen) {
            setHighlightedIndex(prev => (prev > 0 ? prev - 1 : prev));
          }
          break;
        case 'Escape':
          setIsOpen(false);
          break;
      }
    };

    const handleSelect = (option: SelectOption) => {
      if (option.disabled) return;
      onChange?.(option.value);
      setIsOpen(false);
    };

    return (
      <div ref={containerRef} className={`relative ${className}`} {...props}>
        <div
          ref={ref}
          tabIndex={disabled ? -1 : 0}
          role="combobox"
          aria-expanded={isOpen}
          aria-disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          className={`
            relative flex items-center justify-between px-lg py-md
            bg-background-secondary border rounded-md
            transition-all duration-200 cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-accent-blue/50
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-border-hover'}
            ${error ? 'border-red-500' : 'border-border'}
            ${isOpen ? 'ring-2 ring-accent-blue/50 border-accent-blue' : ''}
          `}
        >
          <span className={selectedOption ? 'text-text-primary' : 'text-text-tertiary'}>
            {selectedOption?.label || placeholder}
          </span>
          <svg
            className={`w-4 h-4 text-text-tertiary transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 w-full mt-sm py-sm
                bg-background-secondary/95 backdrop-blur-xl
                border border-border rounded-md shadow-xl
                max-h-60 overflow-auto"
            >
              {groups.length > 0 ? (
                groups.map((group, groupIndex) => (
                  <div key={groupIndex}>
                    <div className="px-lg py-xs text-xs font-medium text-text-tertiary uppercase tracking-wider">
                      {group.label}
                    </div>
                    {group.options.map((option, optionIndex) => {
                      const globalIndex = allOptions.indexOf(option);
                      return (
                        <div
                          key={option.value}
                          onClick={() => handleSelect(option)}
                          onMouseEnter={() => setHighlightedIndex(globalIndex)}
                          className={`
                            px-lg py-sm cursor-pointer transition-colors duration-150
                            ${option.disabled
                              ? 'opacity-50 cursor-not-allowed text-text-tertiary'
                              : highlightedIndex === globalIndex
                                ? 'bg-accent-blue/10 text-accent-blue'
                                : 'text-text-primary hover:bg-background-tertiary'
                            }
                            ${option.value === value ? 'bg-accent-blue/5' : ''}
                          `}
                        >
                          {option.label}
                        </div>
                      );
                    })}
                  </div>
                ))
              ) : (
                options.map((option, index) => (
                  <div
                    key={option.value}
                    onClick={() => handleSelect(option)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`
                      px-lg py-sm cursor-pointer transition-colors duration-150
                      ${option.disabled
                        ? 'opacity-50 cursor-not-allowed text-text-tertiary'
                        : highlightedIndex === index
                          ? 'bg-accent-blue/10 text-accent-blue'
                          : 'text-text-primary hover:bg-background-tertiary'
                      }
                      ${option.value === value ? 'bg-accent-blue/5' : ''}
                    `}
                  >
                    {option.label}
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Select.displayName = 'Select';
