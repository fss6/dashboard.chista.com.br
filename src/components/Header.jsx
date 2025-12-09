"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Search, 
  Bell, 
  ChevronDown,
  LogOut,
  User,
  Moon,
  Sun
} from 'lucide-react';

const Header = ({ user, logout, showUploadButton = false, onUploadClick = null }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 left-0 z-30 flex items-center">
      <div className="flex items-center justify-end px-6 w-full">
        {/* Right Section */}
        <div className="flex items-center gap-3">

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Alternar tema"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-gray-600" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {showNotifications && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Notificações</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                      <p className="text-sm text-gray-900 font-medium">Novo relatório disponível</p>
                      <p className="text-xs text-gray-500 mt-1">Há 5 minutos</p>
                    </div>
                    <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                      <p className="text-sm text-gray-900 font-medium">Análise concluída</p>
                      <p className="text-xs text-gray-500 mt-1">Há 1 hora</p>
                    </div>
                  </div>
                  <div className="px-4 py-2 border-t border-gray-100">
                    <button className="text-sm text-[#174A8B] hover:underline">
                      Ver todas
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Menu */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Image
                    src={user.picture || "/logo.png"}
                    alt={user.name || "Avatar"}
                    width={36}
                    height={36}
                    className="rounded-full border border-gray-200"
                  />
                  <div className="text-left hidden md:block">
                    <p className="text-sm font-medium text-gray-900 max-w-[150px] truncate">
                      {user.name || user.email}
                    </p>
                    <p className="text-xs text-gray-500">Usuário</p>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500 hidden md:block" />
              </button>

              {showUserMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        // Navigate to profile
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      Perfil
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout({ returnTo: window.location.origin });
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-100 mt-1"
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
