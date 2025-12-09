"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { 
  ChevronDown,
  LogOut,
  User,
  Moon,
  Sun
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Header = ({ user, logout, showUploadButton = false, onUploadClick = null }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <header className="h-16 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 fixed top-0 right-0 left-0 z-30 flex items-center transition-colors shadow-sm">
      <div className="flex items-center justify-end px-6 w-full">
        {/* Right Section */}
        <div className="flex items-center gap-3">

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-105 active:scale-95"
            title={darkMode ? "Modo claro" : "Modo escuro"}
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-yellow-500 dark:text-yellow-400 transition-transform rotate-0 hover:rotate-45" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300 transition-transform" />
            )}
          </button>

          {/* User Menu */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Image
                    src={user.picture || "/logo.png"}
                    alt={user.name || "Avatar"}
                    width={36}
                    height={36}
                    className="rounded-full border border-gray-200 dark:border-gray-700"
                  />
                  <div className="text-left hidden md:block">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 max-w-[150px] truncate">
                      {user.name || user.email}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Usuário</p>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400 hidden md:block" />
              </button>

              {showUserMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        // Navigate to profile
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      Perfil
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout({ returnTo: window.location.origin });
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 border-t border-gray-100 dark:border-gray-700 mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
