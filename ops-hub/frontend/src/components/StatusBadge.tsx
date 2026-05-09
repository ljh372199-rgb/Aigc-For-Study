import React from 'react';

type StatusType = 'success' | 'warning' | 'danger' | 'info' | 'default';

interface StatusBadgeProps {
  status: StatusType;
  children: React.ReactNode;
  size?: 'sm' | 'md';
  pulse?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  children,
  size = 'md',
  pulse = false,
}) => {
  const statusClasses: Record<StatusType, string> = {
    success: 'bg-status-success/20 text-status-success border-status-success/30',
    warning: 'bg-status-warning/20 text-status-warning border-status-warning/30',
    danger: 'bg-status-danger/20 text-status-danger border-status-danger/30',
    info: 'bg-status-info/20 text-status-info border-status-info/30',
    default: 'bg-bg-tertiary text-text-secondary border-border',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full border font-medium
        ${statusClasses[status]}
        ${sizeClasses[size]}
        ${pulse ? 'animate-pulse' : ''}
      `}
    >
      {pulse && (
        <span className={`w-1.5 h-1.5 rounded-full bg-current ${pulse ? 'animate-pulse' : ''}`} />
      )}
      {children}
    </span>
  );
};

export default StatusBadge;
