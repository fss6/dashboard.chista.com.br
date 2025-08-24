"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, TrendingUp, BarChart3, Calendar, Filter, Upload, Search, ArrowUpDown, Zap, FileText, Heart } from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner";
import LocalizedDate from "../../components/LocalizedDate";
import UploadModal from "../../components/UploadModal";
import TextModal from "../../components/TextModal";
import NavMenu from "../../components/NavMenu";
import { useAuth } from "../../contexts/AuthContext";
import { fetchInsights, useLoadingState, uploadFile, clearApiCache } from "../../lib/api";

export default function InsightsPage() {
  const { user, isAuthenticated, isLoading, loginWithRedirect, logout, chistaApiToken } = useAuth();
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [textModalOpen, setTextModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // recent, nps_high, nps_low, ces_high, ces_low, csat_high, csat_low
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect();
    }
  }, [isLoading, isAuthenticated, loginWithRedirect]);

  useEffect(() => {
    if (isAuthenticated && chistaApiToken) {
      setDataLoading(true);
      fetchInsights(chistaApiToken)
        .then(setInsights)
        .catch((err) => setError(err.message))
        .finally(() => setDataLoading(false));
    }
  }, [isAuthenticated, chistaApiToken]);

  // Usa o hook otimizado para gerenciar o estado de loading
  const { shouldShowLoading, message, subtitle } = useLoadingState(
    isLoading,           // authLoading
    dataLoading,         // dataLoading
    !!insights,          // hasData
    !!error              // hasError
  );

  const getInsightTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'trend':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'metric':
        return <BarChart3 className="w-5 h-5 text-blue-500" />;
      case 'analysis':
        return <Filter className="w-5 h-5 text-purple-500" />;
      default:
        return <BarChart3 className="w-5 h-5 text-gray-500" />;
    }
  };

  const getInsightTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'trend':
        return 'bg-green-100 text-green-800';
      case 'metric':
        return 'bg-blue-100 text-blue-800';
      case 'analysis':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusTranslation = (status) => {
    switch (status) {
      case 'awaiting_upload':
        return 'Aguardando Upload';
      case 'ready_to_process':
        return 'Aguardando Processamento';
      case 'sent_to_process':
        return 'Processando';
      case 'analyzed':
        return 'Analizado';
      case 'error':
        return 'Erro';
      default:
        return status || 'Desconhecido';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'awaiting_upload':
        return 'bg-yellow-100 text-yellow-800';
      case 'ready_to_process':
        return 'bg-green-100 text-green-800';
      case 'sent_to_process':
        return 'bg-blue-100 text-blue-800';
      case 'analyzed':
        return 'bg-blue-100 text-blue-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleFileUpload = async (file, description, onProgress) => {
    try {
      await uploadFile(file, description, chistaApiToken, onProgress);
      // Clear cache and reload insights after successful upload
      clearApiCache();
      setDataLoading(true);
      const newInsights = await fetchInsights(chistaApiToken);
      setInsights(newInsights);
      setDataLoading(false);
    } catch (error) {
      throw error; // Re-throw to let modal handle the error display
    }
  };

  // Função para filtrar insights baseado no termo de busca
  const filteredInsights = insights?.filter((insight) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const title = (insight.title || insight.name || `Insight #${insight.id}`).toLowerCase();
    const description = (insight.description || '').toLowerCase();
    const status = getStatusTranslation(insight.status).toLowerCase();
    const type = (insight.type || 'Insight').toLowerCase();
    
    return (
      title.includes(searchLower) ||
      description.includes(searchLower) ||
      status.includes(searchLower) ||
      type.includes(searchLower) ||
      insight.id.toString().includes(searchLower)
    );
  }) || [];

  // Função para ordenar insights
  const sortedInsights = [...filteredInsights].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      case 'nps_high':
        return (b.insight?.nps || 0) - (a.insight?.nps || 0);
      case 'nps_low':
        return (a.insight?.nps || 0) - (b.insight?.nps || 0);
      case 'ces_high':
        return (b.insight?.ces || 0) - (a.insight?.ces || 0);
      case 'ces_low':
        return (a.insight?.ces || 0) - (b.insight?.ces || 0);
      case 'csat_high':
        return (b.insight?.csat || 0) - (a.insight?.csat || 0);
      case 'csat_low':
        return (a.insight?.csat || 0) - (b.insight?.csat || 0);
      default:
        return 0;
    }
  });

  if (shouldShowLoading) {
    return (
      <LoadingSpinner 
        message={message}
        subtitle={subtitle}
      />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <NavMenu 
          currentPage="insights" 
          user={user}
          isAuthenticated={isAuthenticated}
          logout={logout}
          showUploadButton={true}
          onUploadClick={() => setUploadModalOpen(true)}
        />

        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] text-red-600">
          <div className="text-center p-8">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-red-800 mb-2">Erro ao Carregar Insights</h1>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <NavMenu 
        currentPage="insights" 
        user={user}
        isAuthenticated={isAuthenticated}
        logout={logout}
      />

      {/* Main content */}
      <main className="w-full max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Insights</h1>
              <p className="text-gray-600">Transforme suas interações em insights valiosos para o seu negócio</p>
            </div>
            <div className="flex items-center gap-4">
              {insights && (
                <div className="text-sm text-gray-500">
                  {insights.length} insight{insights.length !== 1 ? 's' : ''} encontrado{insights.length !== 1 ? 's' : ''}
                </div>
              )}
                             <div className="flex items-center gap-2">
                 <button
                   onClick={() => setTextModalOpen(true)}
                   className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
                 >
                   <FileText className="w-4 h-4" />
                   Enviar Texto
                 </button>
                 <button
                   onClick={() => setUploadModalOpen(true)}
                   className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
                 >
                   <Upload className="w-4 h-4" />
                   Enviar Áudio
                 </button>
               </div>
            </div>
          </div>
        </div>

        {/* Campo de Busca */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar insights por título, descrição, status ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#174A8B] focus:border-[#174A8B] sm:text-sm"
            />
          </div>
          {searchTerm && (
            <div className="mt-2 text-sm text-gray-600">
              {filteredInsights.length} de {insights?.length || 0} insight{filteredInsights.length !== 1 ? 's' : ''} encontrado{filteredInsights.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Filtros de Ordenação */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Ordenar por:</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSortBy('recent')}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                sortBy === 'recent'
                  ? 'bg-[#174A8B] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Mais Recentes
            </button>
            
            <button
              onClick={() => setSortBy('nps_high')}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors flex items-center gap-1 ${
                sortBy === 'nps_high'
                  ? 'bg-[#174A8B] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <TrendingUp className="w-3 h-3" />
              Maior NPS
            </button>
            
            <button
              onClick={() => setSortBy('nps_low')}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors flex items-center gap-1 ${
                sortBy === 'nps_low'
                  ? 'bg-[#174A8B] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <TrendingUp className="w-3 h-3 rotate-180" />
              Menor NPS
            </button>
            
            <button
              onClick={() => setSortBy('ces_high')}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors flex items-center gap-1 ${
                sortBy === 'ces_high'
                  ? 'bg-[#174A8B] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Zap className="w-3 h-3" />
              Maior CES
            </button>
            
            <button
              onClick={() => setSortBy('ces_low')}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors flex items-center gap-1 ${
                sortBy === 'ces_low'
                  ? 'bg-[#174A8B] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Zap className="w-3 h-3" />
              Menor CES
            </button>
            
            <button
              onClick={() => setSortBy('csat_high')}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors flex items-center gap-1 ${
                sortBy === 'csat_high'
                  ? 'bg-[#174A8B] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Heart className="w-3 h-3" />
              Maior CSAT
            </button>
            
            <button
              onClick={() => setSortBy('csat_low')}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors flex items-center gap-1 ${
                sortBy === 'csat_low'
                  ? 'bg-[#174A8B] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Heart className="w-3 h-3" />
              Menor CSAT
            </button>
          </div>
        </div>

        {/* Content */}
        {insights && Array.isArray(insights) && insights.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Insight
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NPS Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CES Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CSAT Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedInsights.map((insight) => (
                    <tr key={insight.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            {getInsightTypeIcon(insight.type)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {insight.title || insight.name || `Insight #${insight.id}`}
                            </div>
                            {insight.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {insight.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {insight.status && (
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(insight.status)}`}>
                            {getStatusTranslation(insight.status)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {insight.insight?.nps !== undefined ? (
                          <span className="text-sm font-medium text-gray-900">
                            {insight.insight.nps}/10
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {insight.insight?.ces !== undefined ? (
                          <span className="text-sm font-medium text-gray-900">
                            {insight.insight.ces}/7
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {insight.insight?.csat !== undefined ? (
                          <span className="text-sm font-medium text-gray-900">
                            {insight.insight.csat}/5
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {insight.created_at && (
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            <LocalizedDate date={insight.created_at} />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => router.push(`/insights/${insight.id}`)}
                          className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-[#174A8B] hover:bg-[#0f3a6b] focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-[#174A8B] transition-colors"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : searchTerm && filteredInsights.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum insight encontrado</h3>
            <p className="text-gray-500">
              Nenhum insight corresponde aos critérios de busca "{searchTerm}".
            </p>
            <button
              onClick={() => setSearchTerm('')}
              className="mt-4 text-[#174A8B] hover:text-blue-700 font-medium"
            >
              Limpar busca
            </button>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum insight encontrado</h3>
            <p className="text-gray-500">
              Ainda não há insights disponíveis para exibir.
            </p>
          </div>
        )}
      </main>

      {/* Upload Modal */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUpload={handleFileUpload}
      />

      {/* Text Modal */}
      {textModalOpen && (
        <TextModal
          isOpen={textModalOpen}
          onClose={() => setTextModalOpen(false)}
          onSuccess={() => {
            setTextModalOpen(false);
            fetchInsights();
          }}
        />
      )}
    </div>
  );
}
