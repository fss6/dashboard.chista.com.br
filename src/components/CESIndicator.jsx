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
import { MousePointer } from 'lucide-react';

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

// Dados fake para o gráfico de pizza (CES)
const cesData = [
  { name: 'Muito Fácil', value: 45, color: '#10B981' },
  { name: 'Fácil', value: 30, color: '#34D399' },
  { name: 'Neutro', value: 15, color: '#F59E0B' },
  { name: 'Difícil', value: 7, color: '#F97316' },
  { name: 'Muito Difícil', value: 3, color: '#EF4444' }
];

// Dados fake para o gráfico de linha (evolução ao longo do tempo)
const cesTimelineData = [
  { month: 'Jan', muitoFacil: 40, facil: 35, neutro: 18, dificil: 5, muitoDificil: 2 },
  { month: 'Fev', muitoFacil: 42, facil: 33, neutro: 17, dificil: 6, muitoDificil: 2 },
  { month: 'Mar', muitoFacil: 44, facil: 32, neutro: 16, dificil: 6, muitoDificil: 2 },
  { month: 'Abr', muitoFacil: 43, facil: 31, neutro: 17, dificil: 7, muitoDificil: 2 },
  { month: 'Mai', muitoFacil: 45, facil: 30, neutro: 16, dificil: 7, muitoDificil: 2 },
  { month: 'Jun', muitoFacil: 46, facil: 29, neutro: 16, dificil: 6, muitoDificil: 3 },
  { month: 'Jul', muitoFacil: 47, facil: 28, neutro: 15, dificil: 7, muitoDificil: 3 },
  { month: 'Ago', muitoFacil: 45, facil: 30, neutro: 16, dificil: 7, muitoDificil: 2 },
  { month: 'Set', muitoFacil: 46, facil: 29, neutro: 15, dificil: 7, muitoDificil: 3 },
  { month: 'Out', muitoFacil: 47, facil: 28, neutro: 15, dificil: 7, muitoDificil: 3 },
  { month: 'Nov', muitoFacil: 48, facil: 27, neutro: 15, dificil: 7, muitoDificil: 3 },
  { month: 'Dez', muitoFacil: 45, facil: 30, neutro: 15, dificil: 7, muitoDificil: 3 }
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

  // Configuração do gráfico de linha
  const lineChartData = {
    labels: cesTimelineData.map(item => item.month),
    datasets: [
      {
        label: 'Muito Fácil',
        data: cesTimelineData.map(item => item.muitoFacil),
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
        label: 'Fácil',
        data: cesTimelineData.map(item => item.facil),
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
        data: cesTimelineData.map(item => item.neutro),
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
        label: 'Difícil',
        data: cesTimelineData.map(item => item.dificil),
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
        label: 'Muito Difícil',
        data: cesTimelineData.map(item => item.muitoDificil),
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
      {/* Explicação CES */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <MousePointer className="w-4 h-4" />
          Sobre o CES (Customer Effort Score)
        </h3>
        <p className="text-sm text-blue-800 leading-relaxed">
          O CES mede o esforço que os clientes precisam fazer para interagir com sua empresa. 
          Quanto menor o esforço, maior a satisfação. Um CES baixo indica que os processos são 
          intuitivos e fáceis de usar, resultando em maior retenção e recomendação de clientes.
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
              <div className={`text-4xl font-bold ${cesScore >= 50 ? 'text-green-600' : cesScore >= 20 ? 'text-yellow-600' : 'text-red-600'}`}>
                {cesScore}
              </div>
              <div className="text-sm text-gray-500">
                {cesScore >= 50 ? 'Excelente' : cesScore >= 20 ? 'Bom' : 'Crítico'}
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
                  #F97316 ${(45 + 30 + 15) * 3.6}deg ${(45 + 30 + 15 + 7) * 3.6}deg,
                  #EF4444 ${(45 + 30 + 15 + 7) * 3.6}deg 360deg
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
          </div>
        </div>

        {/* Gráfico de Linha */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Evolução Mensal</h3>
          <div className="h-80">
            <Line data={lineChartData} options={lineChartOptions} />
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
              <p className="text-sm text-gray-600">75% acham fácil ou muito fácil</p>
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
              <p className="text-sm text-gray-600">+5% nos últimos 3 meses</p>
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
              <p className="text-sm text-gray-600">2.156 interações este mês</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
