"use client";
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import Image from 'next/image';
import NavMenu from '../../components/NavMenu';

// Dados fake para o gráfico de pizza (NPS)
const npsData = [
  { name: 'Promotores', value: 65, color: '#10B981' },
  { name: 'Neutros', value: 25, color: '#F59E0B' },
  { name: 'Detratores', value: 10, color: '#EF4444' }
];

// Dados fake para o gráfico de linha (evolução ao longo do tempo)
const timelineData = [
  { month: 'Jan', detratores: 15, promotores: 60 },
  { month: 'Fev', detratores: 12, promotores: 62 },
  { month: 'Mar', detratores: 8, promotores: 68 },
  { month: 'Abr', detratores: 10, promotores: 65 },
  { month: 'Mai', detratores: 7, promotores: 70 },
  { month: 'Jun', detratores: 9, promotores: 67 },
  { month: 'Jul', detratores: 6, promotores: 72 },
  { month: 'Ago', detratores: 8, promotores: 69 },
  { month: 'Set', detratores: 5, promotores: 74 },
  { month: 'Out', detratores: 7, promotores: 71 },
  { month: 'Nov', detratores: 4, promotores: 75 },
  { month: 'Dez', detratores: 6, promotores: 73 }
];

// Função para calcular o NPS Score
const calculateNPS = () => {
  const promotores = npsData.find(item => item.name === 'Promotores')?.value || 0;
  const detratores = npsData.find(item => item.name === 'Detratores')?.value || 0;
  return promotores - detratores;
};

export default function Dashboard() {
  const { user, isAuthenticated, isLoading, loginWithRedirect, logout } = useAuth();

  // Dados carregados e PieChart funcionando corretamente

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

  const npsScore = calculateNPS();

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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard NPS</h1>
          <p className="text-gray-600 mt-2">Acompanhe os indicadores de satisfação dos seus clientes</p>
        </div>
        {/* NPS Score Card */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">NPS Score Atual</h2>
                <p className="text-sm text-gray-600">Net Promoter Score</p>
              </div>
              <div className="text-right">
                <div className={`text-4xl font-bold ${npsScore >= 50 ? 'text-green-600' : npsScore >= 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {npsScore}
                </div>
                <div className="text-sm text-gray-500">
                  {npsScore >= 50 ? 'Excelente' : npsScore >= 0 ? 'Bom' : 'Crítico'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gráfico de Pizza */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Distribuição NPS</h3>
            <div className="h-80 flex items-center justify-center">
              {/* Gráfico CSS - Fallback confiável */}
              <div className="flex flex-col items-center justify-center">
                <div className="relative w-48 h-48 rounded-full mb-4" style={{
                  background: `conic-gradient(
                    #10B981 0deg ${65 * 3.6}deg,
                    #F59E0B ${65 * 3.6}deg ${(65 + 25) * 3.6}deg,
                    #EF4444 ${(65 + 25) * 3.6}deg 360deg
                  )`,
                  filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))'
                }}>
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-full m-8">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-800">{calculateNPS()}</div>
                      <div className="text-sm text-gray-600">NPS Score</div>
                    </div>
                  </div>
                </div>
                
                {/* Legenda do gráfico CSS */}
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span>Promotores</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                    <span>Neutros</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                    <span>Detratores</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Legenda com estatísticas */}
            <div className="mt-4 grid grid-cols-3 gap-4">
              {npsData.map((item) => (
                <div key={item.name} className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                  </div>
                  <div className="text-xl font-bold" style={{ color: item.color }}>
                    {item.value}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gráfico de Linha */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Evolução Mensal</h3>
            <div className="h-80 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  width={500}
                  height={300}
                  data={timelineData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="detratores" 
                    stroke="#EF4444" 
                    strokeWidth={2}
                    name="Detratores"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="promotores" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    name="Promotores"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Insights Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-semibold text-gray-900">Tendência Positiva</h4>
                <p className="text-sm text-gray-600">+8% nos últimos 3 meses</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-semibold text-gray-900">Meta Atingida</h4>
                <p className="text-sm text-gray-600">NPS acima de 50 pontos</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-semibold text-gray-900">Total de Respostas</h4>
                <p className="text-sm text-gray-600">1.247 avaliações este mês</p>
              </div>
            </div>
          </div>
        </div>

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
