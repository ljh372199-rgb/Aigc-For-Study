import { type HTMLAttributes, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Select } from './Select';

export interface PaginationProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  current: number;
  pageSize: number;
  total: number;
  onChange?: (page: number, pageSize: number) => void;
  pageSizeOptions?: number[];
  showQuickJumper?: boolean;
  showTotal?: boolean;
}

export const Pagination = ({
  current,
  pageSize,
  total,
  onChange,
  pageSizeOptions = [10, 20, 50, 100],
  showQuickJumper = false,
  showTotal = true,
  className = '',
  ...props
}: PaginationProps) => {
  const [inputValue, setInputValue] = useState(String(current));

  const totalPages = useMemo(() => {
    return Math.ceil(total / pageSize);
  }, [total, pageSize]);

  const pageNumbers = useMemo(() => {
    const pages: (number | 'ellipsis')[] = [];
    const delta = 2;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (current > delta + 2) {
        pages.push('ellipsis');
      }

      const start = Math.max(2, current - delta);
      const end = Math.min(totalPages - 1, current + delta);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (current < totalPages - delta - 1) {
        pages.push('ellipsis');
      }

      pages.push(totalPages);
    }

    return pages;
  }, [current, totalPages]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === current) return;
    onChange?.(page, pageSize);
  };

  const handlePageSizeChange = (value: string) => {
    const newPageSize = parseInt(value, 10);
    const newTotalPages = Math.ceil(total / newPageSize);
    const newCurrent = Math.min(current, newTotalPages);
    onChange?.(newCurrent, newPageSize);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const page = parseInt(inputValue, 10);
      if (!isNaN(page) && page >= 1 && page <= totalPages) {
        handlePageChange(page);
      } else {
        setInputValue(String(current));
      }
    }
  };

  return (
    <div
      className={`flex items-center justify-between gap-lg ${className}`}
      {...props}
    >
      <div className="flex items-center gap-md">
        {showTotal && (
          <span className="text-sm text-text-tertiary whitespace-nowrap">
            共 {total} 条
          </span>
        )}

        <div className="flex items-center gap-xs">
          <span className="text-sm text-text-tertiary whitespace-nowrap">每页</span>
          <Select
            value={String(pageSize)}
            onChange={handlePageSizeChange}
            options={pageSizeOptions.map(size => ({
              value: String(size),
              label: String(size),
            }))}
            className="w-20"
          />
          <span className="text-sm text-text-tertiary whitespace-nowrap">条</span>
        </div>
      </div>

      <div className="flex items-center gap-xs">
        <button
          onClick={() => handlePageChange(current - 1)}
          disabled={current === 1}
          className={`
            p-xs rounded-md transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-accent-blue/50
            ${
              current === 1
                ? 'opacity-50 cursor-not-allowed text-text-tertiary'
                : 'text-text-primary hover:bg-background-tertiary'
            }
          `}
          aria-label="上一页"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {pageNumbers.map((page, index) =>
          page === 'ellipsis' ? (
            <span
              key={`ellipsis-${index}`}
              className="px-xs text-text-tertiary"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`
                min-w-8 h-8 px-xs rounded-md text-sm font-medium
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-accent-blue/50
                ${
                  current === page
                    ? 'bg-accent-blue text-white'
                    : 'text-text-primary hover:bg-background-tertiary'
                }
              `}
            >
              {page}
            </button>
          )
        )}

        <button
          onClick={() => handlePageChange(current + 1)}
          disabled={current === totalPages}
          className={`
            p-xs rounded-md transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-accent-blue/50
            ${
              current === totalPages
                ? 'opacity-50 cursor-not-allowed text-text-tertiary'
                : 'text-text-primary hover:bg-background-tertiary'
            }
          `}
          aria-label="下一页"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {showQuickJumper && (
        <div className="flex items-center gap-xs">
          <span className="text-sm text-text-tertiary whitespace-nowrap">跳至</span>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleInputSubmit}
            className="
              w-14 h-8 px-sm rounded-md
              bg-background-secondary border border-border
              text-text-primary text-sm text-center
              focus:outline-none focus:ring-2 focus:ring-accent-blue/50
              focus:border-accent-blue
              transition-colors duration-200
            "
          />
          <span className="text-sm text-text-tertiary whitespace-nowrap">
            页
          </span>
        </div>
      )}
    </div>
  );
};

Pagination.displayName = 'Pagination';
