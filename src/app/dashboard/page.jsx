"use client";
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import DashboardLayout from '../../components/DashboardLayout';
import { TrendingUp, Zap, Heart } from 'lucide-react';
import NPSIndicator from '../../components/NPSIndicator';
import CESIndicator from '../../components/CESIndicator';
import CSATIndicator from '../../components/CSATIndicator';

export default function Dashboard() {
  const { user, isAuthenticated, isLoading, loginWithRedirect, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('nps');

  if (isLoading) {
    return <LoadingSpinner message="Carregando dashboard..." subtitle="Preparando indicadores NPS" />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Restrito</h1>
          <p className="text-gray-600 mb-6">Você precisa fazer login para acessar o dashboard.</p>
          <button 
            onClick={() => loginWithRedirect()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
          >
            Fazer Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout user={user} logout={logout}>
      {/* Page Content */}
      <div className="p-6">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Acompanhe os indicadores de satisfação e esforço dos seus clientes</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('nps')}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === 'nps'
                    ? 'border-[#174A8B] dark:border-blue-400 text-[#174A8B] dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                NPS (Net Promoter Score)
              </button>
              <button
                onClick={() => setActiveTab('ces')}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === 'ces'
                    ? 'border-[#174A8B] dark:border-blue-400 text-[#174A8B] dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Zap className="w-4 h-4" />
                CES (Customer Effort Score)
              </button>
              <button
                onClick={() => setActiveTab('csat')}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === 'csat'
                    ? 'border-[#174A8B] dark:border-blue-400 text-[#174A8B] dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Heart className="w-4 h-4" />
                CSAT (Customer Satisfaction)
              </button>
            </nav>
          </div>
        </div>

        {/* Conteúdo baseado na aba ativa */}
        {activeTab === 'nps' && <NPSIndicator />}
        {activeTab === 'ces' && <CESIndicator />}
        {activeTab === 'csat' && <CSATIndicator />}

        {/* Navigation */}
        <div className="mt-8 flex justify-center">
          <a 
            href="/insights"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
          >
            Ver Insights Detalhados
          </a>
        </div>
      </div>
    </DashboardLayout>
  );
}
