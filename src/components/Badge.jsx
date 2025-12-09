"use client";
import React from 'react';

const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'md',
  icon = null,
  pulse = false 
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
    primary: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 ring-1 ring-blue-500/20',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 ring-1 ring-green-500/20',
    warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 ring-1 ring-yellow-500/20',
    error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 ring-1 ring-red-500/20',
    info: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 ring-1 ring-cyan-500/20',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  };

  return (
    <span 
      className={`
        inline-flex items-center gap-1 rounded-full font-medium transition-all
        ${variants[variant]} 
        ${sizes[size]}
        ${pulse ? 'animate-pulse' : ''}
      `}
    >
      {icon && <span className="w-3.5 h-3.5">{icon}</span>}
      {children}
    </span>
  );
};

export default Badge;
