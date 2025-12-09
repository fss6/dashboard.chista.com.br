"use client";
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const DashboardLayout = ({ 
  children, 
  user, 
  logout,
  showUploadButton = false,
  onUploadClick = null 
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      {/* Sidebar */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Main Content Area */}
      <div 
        className={`transition-all duration-300 ${
          isCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        {/* Header */}
        <Header 
          user={user} 
          logout={logout}
          showUploadButton={showUploadButton}
          onUploadClick={onUploadClick}
        />

        {/* Page Content */}
        <main className="pt-16 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
