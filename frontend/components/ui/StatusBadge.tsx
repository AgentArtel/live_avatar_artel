/**
 * StatusBadge Component
 * 
 * Displays generation job status with color coding.
 */

'use client';

import React from 'react';

type Status = 'pending' | 'processing' | 'completed' | 'failed';

interface StatusBadgeProps {
  status: Status;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    pending: {
      label: 'Pending',
      className: 'bg-yellow-100 text-yellow-800',
    },
    processing: {
      label: 'Processing',
      className: 'bg-blue-100 text-blue-800',
    },
    completed: {
      label: 'Completed',
      className: 'bg-green-100 text-green-800',
    },
    failed: {
      label: 'Failed',
      className: 'bg-red-100 text-red-800',
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${config.className}
      `}
    >
      {config.label}
    </span>
  );
}

