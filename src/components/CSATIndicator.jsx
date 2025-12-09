"use client";
import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Heart } from 'lucide-react';

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Dados fake para o gráfico de pizza (CSAT)
const csatData = [
  { name: 'Muito Satisfeito', value: 55, color: '#10B981' },
  { name: 'Satisfeito', value: 30, color: '#34D399' },
  { name: 'Neutro', value: 10, color: '#F59E0B' },
  { name: 'Insatisfeito', value: 4, color: '#F97316' },
  { name: 'Muito Insatisfeito', value: 1, color: '#EF4444' }
];

// Dados fake para o gráfico de linha (evolução ao longo do tempo)
const csatTimelineData = [
  { month: 'Jan', muitoSatisfeito: 50, satisfeito: 35, neutro: 12, insatisfeito: 2, muitoInsatisfeito: 1 },
  { month: 'Fev', muitoSatisfeito: 52, satisfeito: 33, neutro: 11, insatisfeito: 3, muitoInsatisfeito: 1 },
  { month: 'Mar', muitoSatisfeito: 54, satisfeito: 32, neutro: 11, insatisfeito: 2, muitoInsatisfeito: 1 },
  { month: 'Abr', muitoSatisfeito: 53, satisfeito: 31, neutro: 12, insatisfeito: 3, muitoInsatisfeito: 1 },
  { month: 'Mai', muitoSatisfeito: 55, satisfeito: 30, neutro: 11, insatisfeito: 3, muitoInsatisfeito: 1 },
  { month: 'Jun', muitoSatisfeito: 56, satisfeito: 29, neutro: 11, insatisfeito: 3, muitoInsatisfeito: 1 },
  { month: 'Jul', muitoSatisfeito: 57, satisfeito: 28, neutro: 11, insatisfeito: 3, muitoInsatisfeito: 1 },
  { month: 'Ago', muitoSatisfeito: 55, satisfeito: 30, neutro: 11, insatisfeito: 3, muitoInsatisfeito: 1 },
  { month: 'Set', muitoSatisfeito: 56, satisfeito: 29, neutro: 11, insatisfeito: 3, muitoInsatisfeito: 1 },
  { month: 'Out', muitoSatisfeito: 57, satisfeito: 28, neutro: 11, insatisfeito: 3, muitoInsatisfeito: 1 },
  { month: 'Nov', muitoSatisfeito: 58, satisfeito: 27, neutro: 11, insatisfeito: 3, muitoInsatisfeito: 1 },
  { month: 'Dez', muitoSatisfeito: 55, satisfeito: 30, neutro: 10, insatisfeito: 4, muitoInsatisfeito: 1 }
];

// Função para calcular o CSAT Score
const calculateCSAT = () => {
  const muitoSatisfeito = csatData.find(item => item.name === 'Muito Satisfeito')?.value || 0;
  const satisfeito = csatData.find(item => item.name === 'Satisfeito')?.value || 0;
  const neutro = csatData.find(item => item.name === 'Neutro')?.value || 0;
  const insatisfeito = csatData.find(item => item.name === 'Insatisfeito')?.value || 0;
  const muitoInsatisfeito = csatData.find(item => item.name === 'Muito Insatisfeito')?.value || 0;
  
  // CSAT Score: (Muito Satisfeito + Satisfeito) - (Insatisfeito + Muito Insatisfeito)
  return (muitoSatisfeito + satisfeito) - (insatisfeito + muitoInsatisfeito);
};

export default function CSATIndicator() {
  const csatScore = calculateCSAT();

  // Configuração do gráfico de linha
  const lineChartData = {
    labels: csatTimelineData.map(item => item.month),
    datasets: [
      {
        label: 'Muito Satisfeito',
        data: csatTimelineData.map(item => item.muitoSatisfeito),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Satisfeito',
        data: csatTimelineData.map(item => item.satisfeito),
        borderColor: '#34D399',
        backgroundColor: 'rgba(52, 211, 153, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: '#34D399',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Neutro',
        data: csatTimelineData.map(item => item.neutro),
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: '#F59E0B',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Insatisfeito',
        data: csatTimelineData.map(item => item.insatisfeito),
        borderColor: '#F97316',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: '#F97316',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Muito Insatisfeito',
        data: csatTimelineData.map(item => item.muitoInsatisfeito),
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: '#EF4444',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '500'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        padding: 12,
      }
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11
          }
        }
      },
      y: {
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11
          },
          callback: function(value) {
            return value + '%';
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  return (
    <>
      {/* Explicação CSAT */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
          <Heart className="w-4 h-4" />
          Sobre o CSAT (Customer Satisfaction Score)
        </h3>
        <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
          O CSAT mede a satisfação geral dos clientes com sua empresa, produto ou serviço. 
          É calculado pela diferença entre clientes satisfeitos e insatisfeitos. 
          Um CSAT alto indica que os clientes estão felizes e propensos a continuar usando seus serviços.
        </p>
      </div>

      {/* CSAT Score Card */}
      <div className="mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">CSAT Score Atual</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Customer Satisfaction Score</p>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-bold ${csatScore >= 70 ? 'text-green-600' : csatScore >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                {csatScore}
              </div>
              <div className="text-sm text-gray-500">
                {csatScore >= 70 ? 'Excelente' : csatScore >= 40 ? 'Bom' : 'Crítico'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico de Pizza */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Distribuição CSAT</h3>
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
                <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 rounded-full m-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{calculateCSAT()}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">CSAT Score</div>
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
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{item.name}</span>
                    </div>
                    <div className="text-lg font-bold" style={{ color: item.color }}>
                      {item.value}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico de Linha */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Evolução Mensal</h3>
          <div className="h-80">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>
      </div>

      {/* Insights Cards CSAT */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-md flex items-center justify-center">
                <Heart className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Alta Satisfação</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">85% dos clientes satisfeitos</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Tendência Positiva</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">+6% nos últimos 3 meses</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Total de Avaliações</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">3.421 avaliações este mês</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
