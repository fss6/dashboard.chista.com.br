"use client";
import React from 'react';

const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  action = null,
  size = 'md'
}) => {
  const sizes = {
    sm: {
      icon: 'w-12 h-12',
      title: 'text-lg',
      description: 'text-sm',
    },
    md: {
      icon: 'w-16 h-16',
      title: 'text-xl',
      description: 'text-base',
    },
    lg: {
      icon: 'w-20 h-20',
      title: 'text-2xl',
      description: 'text-lg',
    },
  };

  const currentSize = sizes[size];

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in">
      {Icon && (
        <div className={`${currentSize.icon} mb-4 text-gray-400 dark:text-gray-600 opacity-50`}>
          <Icon className="w-full h-full" strokeWidth={1.5} />
        </div>
      )}
      
      {title && (
        <h3 className={`${currentSize.title} font-semibold text-gray-900 dark:text-gray-100 mb-2`}>
          {title}
        </h3>
      )}
      
      {description && (
        <p className={`${currentSize.description} text-gray-500 dark:text-gray-400 max-w-md mb-6`}>
          {description}
        </p>
      )}
      
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
