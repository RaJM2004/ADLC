import React from 'react';

interface StatusChipProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, size = 'md' }) => {
  const norm = (status || '').toLowerCase().replace(/_/g, ' ');

  const getColors = () => {
    switch (norm) {
      case 'completed':
      case 'approved':
      case 'active':
      case 'healthy':
      case 'operational':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'running':
      case 'review':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'awaiting review':
      case 'pending':
      case 'paused':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'failed':
      case 'rejected':
      case 'blocked':
      case 'high':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'draft':
      default:
        return 'bg-blue-50/70 text-blue-700 border-blue-200/80';
    }
  };

  const pad = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-bold capitalize rounded-full border ${pad} ${getColors()}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {norm}
    </span>
  );
};
