"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const NavMenu = ({ 
  currentPage = 'home', 
  user, 
  isAuthenticated, 
  logout,
  showUploadButton = false,
  onUploadClick = null 
}) => {
  const router = useRouter();

  const menuItems = [
    { 
      id: 'home', 
      label: 'Página Inicial', 
      path: '/' 
    },
    { 
      id: 'insights', 
      label: 'Insights', 
      path: '/insights' 
    },
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      path: '/dashboard' 
    },
    { 
      id: 'chat', 
      label: 'Chat', 
      path: '/chat' 
    },
    { 
      id: 'settings', 
      label: 'Configurações', 
      path: '/settings' 
    }
  ];

  const getItemClasses = (itemId) => {
    if (itemId === currentPage) {
      return "text-[#174A8B] font-semibold border-b-2 border-[#174A8B] pb-1";
    }
    return "text-gray-600 hover:text-[#174A8B] font-medium transition-colors";
  };

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <div className="flex justify-between items-center w-full">
            {/* Logo + Navigation */}
            <div className="flex items-center gap-8">
              <Image src="/logo.png" alt="Logo Chista" width={88} height={48} priority />
              
              {isAuthenticated && (
                <nav className="flex gap-6">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => router.push(item.path)}
                      className={getItemClasses(item.id)}
                    >
                      {item.label}
                    </button>
                  ))}
                </nav>
              )}
            </div>

            {/* User Area */}
            {isAuthenticated && user && (
              <div className="flex items-center gap-4">
                {/* Upload Button (apenas para insights) */}
                {showUploadButton && onUploadClick && (
                  <button
                    onClick={onUploadClick}
                    className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload
                  </button>
                )}
                
                <span className="text-sm font-medium text-[#174A8B] max-w-[10rem] truncate">
                  {user.name || user.email}
                </span>
                <Image
                  src={user.picture || "/logo.png"}
                  alt={user.name || "Avatar"}
                  width={40}
                  height={40}
                  className="rounded-full border border-blue-200"
                />
                <button
                  className="ml-2 px-4 py-2 bg-[#174A8B] text-white rounded hover:bg-blue-900 transition text-sm font-semibold"
                  onClick={() => logout({ returnTo: window.location.origin })}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavMenu;
