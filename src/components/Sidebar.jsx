"use client";
import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  Lightbulb, 
  FileText, 
  MessageSquare, 
  Settings,
  Home,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    { 
      id: 'home', 
      label: 'Página Inicial', 
      path: '/',
      icon: Home
    },
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      path: '/dashboard',
      icon: LayoutDashboard
    },
    { 
      id: 'insights', 
      label: 'Insights', 
      path: '/insights',
      icon: Lightbulb
    },
    { 
      id: 'reports', 
      label: 'Relatórios', 
      path: '/reports',
      icon: FileText
    },
    { 
      id: 'chat', 
      label: 'Chat', 
      path: '/chat',
      icon: MessageSquare
    },
    { 
      id: 'settings', 
      label: 'Configurações', 
      path: '/settings',
      icon: Settings
    }
  ];

  const isActive = (path) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <div 
      className={`fixed left-0 top-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col shadow-sm z-40 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo Section */}
      <div className="h-16 flex items-center justify-center px-4 border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed ? (
          <Image 
            src="/logo.png" 
            alt="Logo Chista" 
            width={88} 
            height={48} 
            priority 
            className="object-contain"
          />
        ) : (
          <div className="w-10 h-10 bg-[#174A8B] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">C</span>
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        )}
      </button>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => router.push(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    active
                      ? 'bg-[#174A8B] dark:bg-blue-600 text-white shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[#174A8B] dark:hover:text-blue-400'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                  title={isCollapsed ? item.label : ''}
                >
                  <Icon className={`${isCollapsed ? 'w-5 h-5' : 'w-5 h-5'} flex-shrink-0`} />
                  {!isCollapsed && (
                    <span className="font-medium text-sm">{item.label}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        {!isCollapsed && (
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            © 2025 Chista
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
