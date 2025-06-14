import React from 'react';

interface ProBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ProBadge({ size = 'md', className = '' }: ProBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span 
      className={`bg-purple-100 text-purple-700 rounded-full font-medium ${sizeClasses[size]} ${className}`}
    >
      PRO
    </span>
  );
} 