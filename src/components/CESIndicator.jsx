"use client";
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Zap } from 'lucide-react';

// Dados fake para o CES (Customer Effort Score)
const cesData = [
  { name: 'Muito Fácil', value: 45, color: '#10B981' },
  { name: 'Fácil', value: 30, color: '#34D399' },
  { name: 'Neutro', value: 15, color: '#F59E0B' },
  { name: 'Difícil', value: 8, color: '#F97316' },
  { name: 'Muito Difícil', value: 2, color: '#EF4444' }
];

// Dados fake para o gráfico de linha do CES (evolução ao longo do tempo)
const cesTimelineData = [
  { month: 'Jan', muitoFacil: 40, facil: 35, neutro: 15, dificil: 8, muitoDificil: 2 },
  { month: 'Fev', muitoFacil: 42, facil: 33, neutro: 16, dificil: 7, muitoDificil: 2 },
  { month: 'Mar', muitoFacil: 45, facil: 30, neutro: 15, dificil: 8, muitoDificil: 2 },
  { month: 'Abr', muitoFacil: 43, facil: 32, neutro: 14, dificil: 9, muitoDificil: 2 },
  { month: 'Mai', muitoFacil: 46, facil: 29, neutro: 15, dificil: 8, muitoDificil: 2 },
  { month: 'Jun', muitoFacil: 44, facil: 31, neutro: 14, dificil: 9, muitoDificil: 2 },
  { month: 'Jul', muitoFacil: 47, facil: 28, neutro: 15, dificil: 8, muitoDificil: 2 },
  { month: 'Ago', muitoFacil: 45, facil: 30, neutro: 15, dificil: 8, muitoDificil: 2 },
  { month: 'Set', muitoFacil: 48, facil: 27, neutro: 15, dificil: 8, muitoDificil: 2 },
  { month: 'Out', muitoFacil: 46, facil: 29, neutro: 15, dificil: 8, muitoDificil: 2 },
  { month: 'Nov', muitoFacil: 49, facil: 26, neutro: 15, dificil: 8, muitoDificil: 2 },
  { month: 'Dez', muitoFacil: 45, facil: 30, neutro: 15, dificil: 8, muitoDificil: 2 }
];

// Função para calcular o CES Score
const calculateCES = () => {
  const muitoFacil = cesData.find(item => item.name === 'Muito Fácil')?.value || 0;
  const facil = cesData.find(item => item.name === 'Fácil')?.value || 0;
  const neutro = cesData.find(item => item.name === 'Neutro')?.value || 0;
  const dificil = cesData.find(item => item.name === 'Difícil')?.value || 0;
  const muitoDificil = cesData.find(item => item.name === 'Muito Difícil')?.value || 0;
  
  // CES Score: (Muito Fácil + Fácil) - (Difícil + Muito Difícil)
  return (muitoFacil + facil) - (dificil + muitoDificil);
};

export default function CESIndicator() {
  const cesScore = calculateCES();

  return (
    <>
      {/* Explicação CES */}
      <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
        <h3 className="text-sm font-semibold text-orange-900 mb-2 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Sobre o CES (Customer Effort Score)
        </h3>
        <p className="text-sm text-orange-800 leading-relaxed">
          O CES mede o esforço que os clientes precisam fazer para resolver um problema ou completar uma tarefa. 
          É calculado pela diferença entre clientes que acham "fácil" e "difícil". 
          Um CES positivo indica que a maioria dos clientes considera a experiência fácil, 
          enquanto um CES negativo sugere que a experiência precisa ser simplificada.
        </p>
      </div>

      {/* CES Score Card */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">CES Score Atual</h2>
              <p className="text-sm text-gray-600">Customer Effort Score</p>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-bold ${cesScore >= 50 ? 'text-green-600' : cesScore >= 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                {cesScore}
              </div>
              <div className="text-sm text-gray-500">
                {cesScore >= 50 ? 'Muito Fácil' : cesScore >= 0 ? 'Fácil' : 'Difícil'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico de Pizza */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Distribuição CES</h3>
          <div className="h-80 flex items-center justify-center">
            {/* Gráfico CSS - Fallback confiável */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-48 h-48 rounded-full mb-4" style={{
                background: `conic-gradient(
                  #10B981 0deg ${45 * 3.6}deg,
                  #34D399 ${45 * 3.6}deg ${(45 + 30) * 3.6}deg,
                  #F59E0B ${(45 + 30) * 3.6}deg ${(45 + 30 + 15) * 3.6}deg,
                  #F97316 ${(45 + 30 + 15) * 3.6}deg ${(45 + 30 + 15 + 8) * 3.6}deg,
                  #EF4444 ${(45 + 30 + 15 + 8) * 3.6}deg 360deg
                )`,
                filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))'
              }}>
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-full m-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800">{calculateCES()}</div>
                    <div className="text-sm text-gray-600">CES Score</div>
                  </div>
                </div>
              </div>
              
              {/* Legenda do gráfico CSS */}
              <div className="flex flex-wrap gap-2 text-sm justify-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span>Muito Fácil</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 mr-2"></div>
                  <span>Fácil</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                  <span>Neutro</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                  <span>Difícil</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <span>Muito Difícil</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Legenda com estatísticas */}
          <div className="mt-4 grid grid-cols-5 gap-2">
            {cesData.map((item) => (
              <div key={item.name} className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <div 
                    className="w-3 h-3 rounded-full mr-1" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-xs font-medium text-gray-700 truncate">{item.name}</span>
                </div>
                <div className="text-lg font-bold" style={{ color: item.color }}>
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
                data={cesTimelineData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="muitoFacil" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  name="Muito Fácil"
                />
                <Line 
                  type="monotone" 
                  dataKey="facil" 
                  stroke="#34D399" 
                  strokeWidth={2}
                  name="Fácil"
                />
                <Line 
                  type="monotone" 
                  dataKey="neutro" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  name="Neutro"
                />
                <Line 
                  type="monotone" 
                  dataKey="dificil" 
                  stroke="#F97316" 
                  strokeWidth={2}
                  name="Difícil"
                />
                <Line 
                  type="monotone" 
                  dataKey="muitoDificil" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  name="Muito Difícil"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Insights Cards CES */}
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
              <h4 className="text-lg font-semibold text-gray-900">Experiência Fácil</h4>
              <p className="text-sm text-gray-600">75% dos clientes acham fácil</p>
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
              <h4 className="text-lg font-semibold text-gray-900">Melhoria Contínua</h4>
              <p className="text-sm text-gray-600">-12% de esforço este mês</p>
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
              <h4 className="text-lg font-semibold text-gray-900">Total de Interações</h4>
              <p className="text-sm text-gray-600">892 interações este mês</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
