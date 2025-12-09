"use client";
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatsCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'positive', 
  icon: Icon,
  description = ''
}) => {
  const isPositive = changeType === 'positive';
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{value}</h3>
          
          {change && (
            <div className="flex items-center gap-1">
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <span className={`text-sm font-medium ${
                isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {change}
              </span>
              {description && (
                <span className="text-sm text-gray-500 ml-1">{description}</span>
              )}
            </div>
          )}
        </div>
        
        {Icon && (
          <div className={`p-3 rounded-lg ${
            isPositive ? 'bg-green-50' : 'bg-blue-50'
          }`}>
            <Icon className={`w-6 h-6 ${
              isPositive ? 'text-green-600' : 'text-blue-600'
            }`} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
