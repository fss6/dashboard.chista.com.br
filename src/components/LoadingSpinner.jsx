"use client";
import React from "react";
import Image from "next/image";
import { useTheme } from '../contexts/ThemeContext';

const LoadingSpinner = ({ 
  message = "Carregando...", 
  subtitle = "Aguarde enquanto processamos suas informações",
  showLogo = true,
  size = "default" // "small", "default", "large"
}) => {
  const { darkMode } = useTheme();
  const sizeClasses = {
    small: {
      spinner: "w-8 h-8",
      logo: { width: 20, height: 10 },
      title: "text-lg",
      subtitle: "text-xs"
    },
    default: {
      spinner: "w-16 h-16",
      logo: { width: 40, height: 20 },
      title: "text-xl",
      subtitle: "text-sm"
    },
    large: {
      spinner: "w-24 h-24",
      logo: { width: 60, height: 30 },
      title: "text-2xl",
      subtitle: "text-base"
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 dark:bg-black/60 backdrop-blur-sm">
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8 max-w-sm mx-4">
        <div className="flex flex-col items-center">
          <div className="relative">
            {/* Spinner animado */}
            <div className={`${currentSize.spinner} border-4 border-blue-200 dark:border-gray-700 border-t-[#174A8B] dark:border-t-blue-400 rounded-full animate-spin`}></div>
            {/* Logo centralizado */}
            {showLogo && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Image 
                  src={darkMode ? "/logo-dark.png" : "/logo.png"}
                  alt="Logo Chista" 
                  width={currentSize.logo.width} 
                  height={currentSize.logo.height} 
                  className="opacity-80" 
                  key={darkMode ? 'dark' : 'light'}
                />
              </div>
            )}
          </div>
          <div className="mt-6 text-center">
            <h2 className={`${currentSize.title} font-semibold text-[#174A8B] dark:text-blue-400 mb-2`}>
              {message}
            </h2>
            <p className={`${currentSize.subtitle} text-gray-600 dark:text-gray-400`}>
              {subtitle}
            </p>
          </div>
          {/* Pontos animados */}
          <div className="flex space-x-1 mt-4">
            <div className="w-2 h-2 bg-[#174A8B] dark:bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-[#174A8B] dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-[#174A8B] dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner; 