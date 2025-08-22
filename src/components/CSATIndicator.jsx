"use client";
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Heart } from 'lucide-react';

// Dados fake para o CSAT (Customer Satisfaction Score)
const csatData = [
  { name: 'Muito Satisfeito', value: 55, color: '#10B981' },
  { name: 'Satisfeito', value: 30, color: '#34D399' },
  { name: 'Neutro', value: 10, color: '#F59E0B' },
  { name: 'Insatisfeito', value: 4, color: '#F97316' },
  { name: 'Muito Insatisfeito', value: 1, color: '#EF4444' }
];

// Dados fake para o gráfico de linha do CSAT (evolução ao longo do tempo)
const csatTimelineData = [
  { month: 'Jan', muitoSatisfeito: 52, satisfeito: 32, neutro: 11, insatisfeito: 4, muitoInsatisfeito: 1 },
  { month: 'Fev', muitoSatisfeito: 53, satisfeito: 31, neutro: 11, insatisfeito: 4, muitoInsatisfeito: 1 },
  { month: 'Mar', muitoSatisfeito: 54, satisfeito: 30, neutro: 11, insatisfeito: 4, muitoInsatisfeito: 1 },
  { month: 'Abr', muitoSatisfeito: 53, satisfeito: 31, neutro: 11, insatisfeito: 4, muitoInsatisfeito: 1 },
  { month: 'Mai', muitoSatisfeito: 55, satisfeito: 29, neutro: 11, insatisfeito: 4, muitoInsatisfeito: 1 },
  { month: 'Jun', muitoSatisfeito: 54, satisfeito: 30, neutro: 11, insatisfeito: 4, muitoInsatisfeito: 1 },
  { month: 'Jul', muitoSatisfeito: 56, satisfeito: 28, neutro: 11, insatisfeito: 4, muitoInsatisfeito: 1 },
  { month: 'Ago', muitoSatisfeito: 55, satisfeito: 29, neutro: 11, insatisfeito: 4, muitoInsatisfeito: 1 },
  { month: 'Set', muitoSatisfeito: 57, satisfeito: 27, neutro: 11, insatisfeito: 4, muitoInsatisfeito: 1 },
  { month: 'Out', muitoSatisfeito: 56, satisfeito: 28, neutro: 11, insatisfeito: 4, muitoInsatisfeito: 1 },
  { month: 'Nov', muitoSatisfeito: 58, satisfeito: 26, neutro: 11, insatisfeito: 4, muitoInsatisfeito: 1 },
  { month: 'Dez', muitoSatisfeito: 55, satisfeito: 30, neutro: 10, insatisfeito: 4, muitoInsatisfeito: 1 }
];

// Função para calcular o CSAT Score
const calculateCSAT = () => {
  const muitoSatisfeito = csatData.find(item => item.name === 'Muito Satisfeito')?.value || 0;
  const satisfeito = csatData.find(item => item.name === 'Satisfeito')?.value || 0;
  const neutro = csatData.find(item => item.name === 'Neutro')?.value || 0;
  const insatisfeito = csatData.find(item => item.name === 'Insatisfeito')?.value || 0;
  const muitoInsatisfeito = csatData.find(item => item.name === 'Muito Insatisfeito')?.value || 0;
  
  // CSAT Score: (Muito Satisfeito + Satisfeito) / Total * 100
  const total = muitoSatisfeito + satisfeito + neutro + insatisfeito + muitoInsatisfeito;
  return Math.round(((muitoSatisfeito + satisfeito) / total) * 100);
};

export default function CSATIndicator() {
  const csatScore = calculateCSAT();

  return (
    <>
      {/* Explicação CSAT */}
      <div className="mb-6 p-4 bg-pink-50 border border-pink-200 rounded-lg">
        <h3 className="text-sm font-semibold text-pink-900 mb-2 flex items-center gap-2">
          <Heart className="w-4 h-4" />
          Sobre o CSAT (Customer Satisfaction Score)
        </h3>
        <p className="text-sm text-pink-800 leading-relaxed">
          O CSAT mede o nível de satisfação dos clientes com sua experiência. 
          É calculado pela porcentagem de clientes que se declaram "satisfeitos" ou "muito satisfeitos" 
          em uma escala de 1 a 5. Um CSAT acima de 80% é considerado excelente, 
          indicando alta satisfação e qualidade do serviço.
        </p>
      </div>

      {/* CSAT Score Card */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">CSAT Score Atual</h2>
              <p className="text-sm text-gray-600">Customer Satisfaction Score</p>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-bold ${csatScore >= 80 ? 'text-green-600' : csatScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                {csatScore}%
              </div>
              <div className="text-sm text-gray-500">
                {csatScore >= 80 ? 'Excelente' : csatScore >= 60 ? 'Bom' : 'Crítico'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico de Pizza */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Distribuição CSAT</h3>
          <div className="h-80 flex items-center justify-center">
            {/* Gráfico CSS - Fallback confiável */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-48 h-48 rounded-full mb-4" style={{
                background: `conic-gradient(
                  #10B981 0deg ${55 * 3.6}deg,
                  #34D399 ${55 * 3.6}deg ${(55 + 30) * 3.6}deg,
                  #F59E0B ${(55 + 30) * 3.6}deg ${(55 + 30 + 10) * 3.6}deg,
                  #F97316 ${(55 + 30 + 10) * 3.6}deg ${(55 + 30 + 10 + 4) * 3.6}deg,
                  #EF4444 ${(55 + 30 + 10 + 4) * 3.6}deg 360deg
                )`,
                filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))'
              }}>
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-full m-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800">{calculateCSAT()}%</div>
                    <div className="text-sm text-gray-600">CSAT Score</div>
                  </div>
                </div>
              </div>
              
              {/* Legenda do gráfico CSS */}
              <div className="flex flex-wrap gap-2 text-sm justify-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span>Muito Satisfeito</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 mr-2"></div>
                  <span>Satisfeito</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                  <span>Neutro</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                  <span>Insatisfeito</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <span>Muito Insatisfeito</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Legenda com estatísticas */}
          <div className="mt-4 grid grid-cols-5 gap-2">
            {csatData.map((item) => (
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
                data={csatTimelineData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="muitoSatisfeito" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  name="Muito Satisfeito"
                />
                <Line 
                  type="monotone" 
                  dataKey="satisfeito" 
                  stroke="#34D399" 
                  strokeWidth={2}
                  name="Satisfeito"
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
                  dataKey="insatisfeito" 
                  stroke="#F97316" 
                  strokeWidth={2}
                  name="Insatisfeito"
                />
                <Line 
                  type="monotone" 
                  dataKey="muitoInsatisfeito" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  name="Muito Insatisfeito"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Insights Cards CSAT */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                <Heart className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <h4 className="text-lg font-semibold text-gray-900">Alta Satisfação</h4>
              <p className="text-sm text-gray-600">85% dos clientes satisfeitos</p>
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
              <h4 className="text-lg font-semibold text-gray-900">Tendência Positiva</h4>
              <p className="text-sm text-gray-600">+6% nos últimos 3 meses</p>
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
              <h4 className="text-lg font-semibold text-gray-900">Total de Avaliações</h4>
              <p className="text-sm text-gray-600">1.247 avaliações este mês</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
