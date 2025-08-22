"use client";
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import Image from 'next/image';
import NavMenu from '../../components/NavMenu';
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <NavMenu 
        currentPage="dashboard" 
        user={user}
        isAuthenticated={isAuthenticated}
        logout={logout}
      />

      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Acompanhe os indicadores de satisfação e esforço dos seus clientes</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('nps')}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === 'nps'
                    ? 'border-[#174A8B] text-[#174A8B]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                NPS (Net Promoter Score)
              </button>
              <button
                onClick={() => setActiveTab('ces')}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === 'ces'
                    ? 'border-[#174A8B] text-[#174A8B]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Zap className="w-4 h-4" />
                CES (Customer Effort Score)
              </button>
              <button
                onClick={() => setActiveTab('csat')}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === 'csat'
                    ? 'border-[#174A8B] text-[#174A8B]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
    </div>
  );
}
