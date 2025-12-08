"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import NavMenu from '../../components/NavMenu';
import { fetchInsights, fetchThemes, useLoadingState } from '../../lib/api';
import { FileText, Calendar, TrendingUp, Zap, Heart, BarChart3, Download, Filter, ExternalLink } from 'lucide-react';
import LocalizedDate from '../../components/LocalizedDate';

export default function ReportsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, loginWithRedirect, logout, chistaApiToken } = useAuth();
  const [insights, setInsights] = useState([]);
  const [themes, setThemes] = useState([]);
  const [error, setError] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [selectedTheme, setSelectedTheme] = useState('');

  // Carregar dados iniciais
  useEffect(() => {
    if (isAuthenticated && chistaApiToken) {
      loadData();
    }
  }, [isAuthenticated, chistaApiToken]);

  const loadData = async () => {
    setDataLoading(true);
    setError(null);
    try {
      const [insightsData, themesData] = await Promise.all([
        fetchInsights(chistaApiToken),
        fetchThemes(chistaApiToken)
      ]);
      setInsights(insightsData || []);
      setThemes(themesData || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setDataLoading(false);
    }
  };

  // Filtrar insights por data e tema
  const filteredInsights = insights.filter((insight) => {
    // Filtro por data
    if (dateRange.startDate || dateRange.endDate) {
      const insightDate = new Date(insight.created_at);
      
      if (dateRange.startDate) {
        const startDate = new Date(dateRange.startDate);
        startDate.setHours(0, 0, 0, 0);
        if (insightDate < startDate) return false;
      }
      
      if (dateRange.endDate) {
        const endDate = new Date(dateRange.endDate);
        endDate.setHours(23, 59, 59, 999);
        if (insightDate > endDate) return false;
      }
    }
    
    // Filtro por tema
    if (selectedTheme) {
      return insight.theme_id === parseInt(selectedTheme);
    }
    
    return true;
  });

  // Calcular estatísticas
  const calculateStats = () => {
    if (filteredInsights.length === 0) {
      return {
        total: 0,
        averageNPS: 0,
        averageCES: 0,
        averageCSAT: 0,
        npsCount: 0,
        cesCount: 0,
        csatCount: 0,
        byTheme: {},
        byStatus: {}
      };
    }

    let npsSum = 0;
    let cesSum = 0;
    let csatSum = 0;
    let npsCount = 0;
    let cesCount = 0;
    let csatCount = 0;
    const byTheme = {};
    const byStatus = {};

    filteredInsights.forEach((insight) => {
      // NPS
      if (insight.insight?.nps !== null && insight.insight?.nps !== undefined) {
        npsSum += insight.insight.nps;
        npsCount++;
      }

      // CES
      if (insight.insight?.ces !== null && insight.insight?.ces !== undefined) {
        cesSum += insight.insight.ces;
        cesCount++;
      }

      // CSAT
      if (insight.insight?.csat !== null && insight.insight?.csat !== undefined) {
        csatSum += insight.insight.csat;
        csatCount++;
      }

      // Por tema
      const themeName = themes.find(t => t.id === insight.theme_id)?.name || 'Sem tema';
      byTheme[themeName] = (byTheme[themeName] || 0) + 1;

      // Por status
      const status = insight.status || 'unknown';
      byStatus[status] = (byStatus[status] || 0) + 1;
    });

    return {
      total: filteredInsights.length,
      averageNPS: npsCount > 0 ? (npsSum / npsCount).toFixed(2) : 0,
      averageCES: cesCount > 0 ? (cesSum / cesCount).toFixed(2) : 0,
      averageCSAT: csatCount > 0 ? (csatSum / csatCount).toFixed(2) : 0,
      npsCount,
      cesCount,
      csatCount,
      byTheme,
      byStatus
    };
  };

  const stats = calculateStats();

  // Calcular rankings (top 3 e bottom 3 de cada indicador)
  const calculateRankings = () => {
    const rankings = {
      nps: { top: [], bottom: [] },
      ces: { top: [], bottom: [] },
      csat: { top: [], bottom: [] }
    };

    // Filtrar insights com valores válidos para cada indicador
    const npsInsights = filteredInsights
      .filter(i => i.insight?.nps !== null && i.insight?.nps !== undefined)
      .map(i => ({ ...i, value: i.insight.nps, max: 10 }))
      .sort((a, b) => b.value - a.value);

    const cesInsights = filteredInsights
      .filter(i => i.insight?.ces !== null && i.insight?.ces !== undefined)
      .map(i => ({ ...i, value: i.insight.ces, max: 7 }))
      .sort((a, b) => b.value - a.value);

    const csatInsights = filteredInsights
      .filter(i => i.insight?.csat !== null && i.insight?.csat !== undefined)
      .map(i => ({ ...i, value: i.insight.csat, max: 5 }))
      .sort((a, b) => b.value - a.value);

    // Top 3 e Bottom 3 para NPS
    rankings.nps.top = npsInsights.slice(0, 3);
    rankings.nps.bottom = npsInsights.slice(-3).reverse();

    // Top 3 e Bottom 3 para CES
    rankings.ces.top = cesInsights.slice(0, 3);
    rankings.ces.bottom = cesInsights.slice(-3).reverse();

    // Top 3 e Bottom 3 para CSAT
    rankings.csat.top = csatInsights.slice(0, 3);
    rankings.csat.bottom = csatInsights.slice(-3).reverse();

    return rankings;
  };

  const rankings = calculateRankings();

  // Função para limpar filtros
  const clearFilters = () => {
    setDateRange({ startDate: '', endDate: '' });
    setSelectedTheme('');
  };

  // Função para definir range rápido (últimos 7, 30, 90 dias)
  const setQuickRange = (days) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    setDateRange({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });
  };

  // Hook para gerenciar estado de loading
  const { shouldShowLoading, message, subtitle } = useLoadingState(
    isLoading,
    dataLoading,
    !!insights,
    !!error
  );

  if (shouldShowLoading) {
    return <LoadingSpinner message={message} subtitle={subtitle} />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Restrito</h1>
          <p className="text-gray-600 mb-6">Você precisa fazer login para acessar os relatórios.</p>
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
      <NavMenu 
        currentPage="reports" 
        user={user}
        isAuthenticated={isAuthenticated}
        logout={logout}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-8 h-8 text-[#174A8B]" />
            <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
          </div>
          <p className="text-gray-600">Compilado de dados e estatísticas dos insights</p>
        </div>

        {/* Filtros */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Data Inicial */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Inicial
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#174A8B] focus:border-transparent"
              />
            </div>

            {/* Data Final */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Final
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#174A8B] focus:border-transparent"
              />
            </div>

            {/* Tema */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tema
              </label>
              <select
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#174A8B] focus:border-transparent"
              >
                <option value="">Todos os temas</option>
                {themes.map((theme) => (
                  <option key={theme.id} value={theme.id}>
                    {theme.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Botões de Range Rápido */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-sm text-gray-600 self-center mr-2">Períodos rápidos:</span>
            <button
              onClick={() => setQuickRange(7)}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Últimos 7 dias
            </button>
            <button
              onClick={() => setQuickRange(30)}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Últimos 30 dias
            </button>
            <button
              onClick={() => setQuickRange(90)}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Últimos 90 dias
            </button>
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
            >
              Limpar Filtros
            </button>
          </div>

          {/* Info do filtro ativo */}
          {(dateRange.startDate || dateRange.endDate || selectedTheme) && (
            <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
              <span className="font-medium">Filtros ativos:</span>
              {dateRange.startDate && (
                <span className="ml-2">
                  De <LocalizedDate date={dateRange.startDate} />
                </span>
              )}
              {dateRange.endDate && (
                <span className="ml-2">
                  até <LocalizedDate date={dateRange.endDate} />
                </span>
              )}
              {selectedTheme && (
                <span className="ml-2">
                  • Tema: {themes.find(t => t.id === parseInt(selectedTheme))?.name}
                </span>
              )}
              <span className="ml-2 font-semibold">
                ({filteredInsights.length} de {insights.length} insights)
              </span>
            </div>
          )}
        </div>

        {/* Estatísticas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total de Insights */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Insights</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <FileText className="w-12 h-12 text-[#174A8B] opacity-20" />
            </div>
          </div>

          {/* Média NPS */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Média NPS</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.averageNPS > 0 ? `${stats.averageNPS}/10` : '-'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.npsCount} {stats.npsCount === 1 ? 'insight' : 'insights'}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </div>

          {/* Média CES */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Média CES</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.averageCES > 0 ? `${stats.averageCES}/7` : '-'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.cesCount} {stats.cesCount === 1 ? 'insight' : 'insights'}
                </p>
              </div>
              <Zap className="w-12 h-12 text-yellow-500 opacity-20" />
            </div>
          </div>

          {/* Média CSAT */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Média CSAT</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.averageCSAT > 0 ? `${stats.averageCSAT}/5` : '-'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.csatCount} {stats.csatCount === 1 ? 'insight' : 'insights'}
                </p>
              </div>
              <Heart className="w-12 h-12 text-red-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Distribuição por Tema */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-[#174A8B]" />
            Distribuição por Tema
          </h2>
          {Object.keys(stats.byTheme).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(stats.byTheme)
                .sort(([, a], [, b]) => b - a)
                .map(([theme, count]) => (
                  <div key={theme} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{theme}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-48 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#174A8B] h-2 rounded-full"
                          style={{ width: `${(count / stats.total) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Nenhum dado disponível para o período selecionado</p>
          )}
        </div>

        {/* Distribuição por Status */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-[#174A8B]" />
            Distribuição por Status
          </h2>
          {Object.keys(stats.byStatus).length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(stats.byStatus).map(([status, count]) => (
                <div key={status} className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-600 mb-1 capitalize">
                    {status.replace('_', ' ')}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Nenhum dado disponível para o período selecionado</p>
          )}
        </div>

        {/* Ranking de Indicadores */}
        <div className="space-y-8">
          {/* NPS Ranking */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
              Ranking NPS (Net Promoter Score)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top 3 */}
              <div>
                <h3 className="text-sm font-semibold text-green-700 mb-4 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Top 3 Melhores
                </h3>
                {rankings.nps.top.length > 0 ? (
                  <div className="space-y-3">
                    {rankings.nps.top.map((insight, index) => (
                      <div 
                        key={insight.id} 
                        onClick={() => router.push(`/insights/${insight.id}`)}
                        className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200 cursor-pointer hover:bg-green-100 hover:border-green-300 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex items-center justify-center w-8 h-8 bg-green-500 text-white rounded-full font-bold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-900">
                                Insight #{insight.id}
                              </p>
                              <ExternalLink className="w-3 h-3 text-gray-400" />
                            </div>
                            <p className="text-xs text-gray-500">
                              {themes.find(t => t.id === insight.theme_id)?.name || 'Sem tema'} •{' '}
                              {insight.created_at && <LocalizedDate date={insight.created_at} />}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-700">
                            {insight.value}/{insight.max}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Nenhum dado NPS disponível</p>
                )}
              </div>

              {/* Bottom 3 */}
              <div>
                <h3 className="text-sm font-semibold text-red-700 mb-4 flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  Top 3 Piores
                </h3>
                {rankings.nps.bottom.length > 0 ? (
                  <div className="space-y-3">
                    {rankings.nps.bottom.map((insight, index) => (
                      <div 
                        key={insight.id} 
                        onClick={() => router.push(`/insights/${insight.id}`)}
                        className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200 cursor-pointer hover:bg-red-100 hover:border-red-300 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex items-center justify-center w-8 h-8 bg-red-500 text-white rounded-full font-bold text-sm">
                            {rankings.nps.bottom.length - index}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-900">
                                Insight #{insight.id}
                              </p>
                              <ExternalLink className="w-3 h-3 text-gray-400" />
                            </div>
                            <p className="text-xs text-gray-500">
                              {themes.find(t => t.id === insight.theme_id)?.name || 'Sem tema'} •{' '}
                              {insight.created_at && <LocalizedDate date={insight.created_at} />}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-red-700">
                            {insight.value}/{insight.max}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Nenhum dado NPS disponível</p>
                )}
              </div>
            </div>
          </div>

          {/* CES Ranking */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-yellow-500" />
              Ranking CES (Customer Effort Score)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top 3 */}
              <div>
                <h3 className="text-sm font-semibold text-green-700 mb-4 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Top 3 Melhores
                </h3>
                {rankings.ces.top.length > 0 ? (
                  <div className="space-y-3">
                    {rankings.ces.top.map((insight, index) => (
                      <div 
                        key={insight.id} 
                        onClick={() => router.push(`/insights/${insight.id}`)}
                        className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200 cursor-pointer hover:bg-green-100 hover:border-green-300 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex items-center justify-center w-8 h-8 bg-green-500 text-white rounded-full font-bold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-900">
                                Insight #{insight.id}
                              </p>
                              <ExternalLink className="w-3 h-3 text-gray-400" />
                            </div>
                            <p className="text-xs text-gray-500">
                              {themes.find(t => t.id === insight.theme_id)?.name || 'Sem tema'} •{' '}
                              {insight.created_at && <LocalizedDate date={insight.created_at} />}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-700">
                            {insight.value}/{insight.max}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Nenhum dado CES disponível</p>
                )}
              </div>

              {/* Bottom 3 */}
              <div>
                <h3 className="text-sm font-semibold text-red-700 mb-4 flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  Top 3 Piores
                </h3>
                {rankings.ces.bottom.length > 0 ? (
                  <div className="space-y-3">
                    {rankings.ces.bottom.map((insight, index) => (
                      <div 
                        key={insight.id} 
                        onClick={() => router.push(`/insights/${insight.id}`)}
                        className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200 cursor-pointer hover:bg-red-100 hover:border-red-300 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex items-center justify-center w-8 h-8 bg-red-500 text-white rounded-full font-bold text-sm">
                            {rankings.ces.bottom.length - index}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-900">
                                Insight #{insight.id}
                              </p>
                              <ExternalLink className="w-3 h-3 text-gray-400" />
                            </div>
                            <p className="text-xs text-gray-500">
                              {themes.find(t => t.id === insight.theme_id)?.name || 'Sem tema'} •{' '}
                              {insight.created_at && <LocalizedDate date={insight.created_at} />}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-red-700">
                            {insight.value}/{insight.max}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Nenhum dado CES disponível</p>
                )}
              </div>
            </div>
          </div>

          {/* CSAT Ranking */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Heart className="w-5 h-5 mr-2 text-red-500" />
              Ranking CSAT (Customer Satisfaction)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top 3 */}
              <div>
                <h3 className="text-sm font-semibold text-green-700 mb-4 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Top 3 Melhores
                </h3>
                {rankings.csat.top.length > 0 ? (
                  <div className="space-y-3">
                    {rankings.csat.top.map((insight, index) => (
                      <div 
                        key={insight.id} 
                        onClick={() => router.push(`/insights/${insight.id}`)}
                        className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200 cursor-pointer hover:bg-green-100 hover:border-green-300 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex items-center justify-center w-8 h-8 bg-green-500 text-white rounded-full font-bold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-900">
                                Insight #{insight.id}
                              </p>
                              <ExternalLink className="w-3 h-3 text-gray-400" />
                            </div>
                            <p className="text-xs text-gray-500">
                              {themes.find(t => t.id === insight.theme_id)?.name || 'Sem tema'} •{' '}
                              {insight.created_at && <LocalizedDate date={insight.created_at} />}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-700">
                            {insight.value}/{insight.max}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Nenhum dado CSAT disponível</p>
                )}
              </div>

              {/* Bottom 3 */}
              <div>
                <h3 className="text-sm font-semibold text-red-700 mb-4 flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  Top 3 Piores
                </h3>
                {rankings.csat.bottom.length > 0 ? (
                  <div className="space-y-3">
                    {rankings.csat.bottom.map((insight, index) => (
                      <div 
                        key={insight.id} 
                        onClick={() => router.push(`/insights/${insight.id}`)}
                        className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200 cursor-pointer hover:bg-red-100 hover:border-red-300 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex items-center justify-center w-8 h-8 bg-red-500 text-white rounded-full font-bold text-sm">
                            {rankings.csat.bottom.length - index}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-900">
                                Insight #{insight.id}
                              </p>
                              <ExternalLink className="w-3 h-3 text-gray-400" />
                            </div>
                            <p className="text-xs text-gray-500">
                              {themes.find(t => t.id === insight.theme_id)?.name || 'Sem tema'} •{' '}
                              {insight.created_at && <LocalizedDate date={insight.created_at} />}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-red-700">
                            {insight.value}/{insight.max}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Nenhum dado CSAT disponível</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
