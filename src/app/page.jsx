"use client";
import Image from "next/image";
import React from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../contexts/AuthContext";
import { ArrowRight, Shield, Zap, BarChart3, Users } from "lucide-react";
import NavMenu from "../components/NavMenu";

export default function Home() {
  const { user, isLoading, error, loginWithRedirect, logout, isAuthenticated, chistaApiToken } = useAuth();
  
  console.log("user do Auth0:", user);

  if (isLoading) return <LoadingSpinner message="Carregando..." subtitle="Inicializando aplicação" />;
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="text-center p-8">
        <div className="text-red-600 text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-red-800 mb-2">Erro de Autenticação</h1>
        <p className="text-red-600">{error.message}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      {isAuthenticated ? (
        <NavMenu 
          currentPage="home" 
          user={user}
          isAuthenticated={isAuthenticated}
          logout={logout}
        />
      ) : (
        <header className="w-full bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-4 flex justify-center">
              <Image src="/logo.png" alt="Logo Chista" width={88} height={48} priority />
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!isAuthenticated ? (
          // Landing Page para usuários não autenticados
          <div className="text-center">
            {/* Hero Section */}
            <div className="mb-16">
              <h1 className="text-4xl sm:text-6xl font-bold text-[#174A8B] mb-6">
                Bem-vindo ao
                <span className="block text-blue-600">Dashboard Chista</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Gerencie seus batches, monitore processos e acompanhe o progresso de suas operações 
                com uma interface moderna e intuitiva.
              </p>
              
              {/* CTA Button */}
              <button 
                onClick={() => loginWithRedirect()}
                className="group bg-[#174A8B] hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center mx-auto space-x-2"
              >
                <span>Entrar no Dashboard</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <BarChart3 className="w-6 h-6 text-[#174A8B]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Monitoramento</h3>
                <p className="text-gray-600">Acompanhe o progresso dos seus batches em tempo real</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Zap className="w-6 h-6 text-[#174A8B]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance</h3>
                <p className="text-gray-600">Interface otimizada para máxima velocidade e eficiência</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Shield className="w-6 h-6 text-[#174A8B]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Segurança</h3>
                <p className="text-gray-600">Autenticação segura e dados protegidos</p>
              </div>
            </div>
          </div>
        ) : (
          // Dashboard para usuários autenticados
          <div className="max-w-4xl mx-auto">
            {/* Welcome Section */}
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-[#174A8B]" />
              </div>
              <h1 className="text-3xl font-bold text-[#174A8B] mb-4">
                Bem-vindo, {user.name || user.email}!
              </h1>
              <p className="text-gray-600 mb-8">
                Você está logado e pronto para visualizar seus insights.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 hover:shadow-md transition-all duration-300 hover:border-blue-300">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                  <BarChart3 className="w-5 h-5 text-[#174A8B] mr-2" />
                  Ver Insights
                </h3>
                <p className="text-gray-600 mb-4">Explore insights extraídos dos seus áudios de negócio</p>
                <button 
                  onClick={() => window.location.href = '/insights'}
                  className="bg-[#174A8B] hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Acessar Insights
                </button>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 hover:shadow-md transition-all duration-300 hover:border-blue-300">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                  <BarChart3 className="w-5 h-5 text-green-600 mr-2" />
                  Dashboard NPS
                </h3>
                <p className="text-gray-600 mb-4">Acompanhe indicadores de satisfação dos clientes</p>
                <button 
                  onClick={() => window.location.href = '/dashboard'}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Ver Dashboard
                </button>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 hover:shadow-md transition-all duration-300 hover:border-blue-300">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                  <Shield className="w-5 h-5 text-[#174A8B] mr-2" />
                  Informações da Conta
                </h3>
                <p className="text-gray-600 mb-4">Visualize detalhes da sua autenticação</p>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Token de API:</p>
                  <p className="text-sm font-mono text-gray-700 break-all">
                    {chistaApiToken ? `${chistaApiToken.substring(0, 20)}...` : 'Não encontrado'}
                    {chistaApiToken}
                  </p>
                </div>
              </div>
            </div>

            {/* Logout Section */}
            <div className="text-center">
              <button 
                onClick={() => logout({ returnTo: window.location.origin })}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Sair da Conta
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-blue-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p>&copy; 2025 Chista Dashboard. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 