"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, TrendingUp, BarChart3, Calendar, Filter, Upload, Search, ChevronDown, ArrowUpDown, Zap, FileText } from "lucide-react";
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
  const [sortBy, setSortBy] = useState('recent'); // recent, nps_high, nps_low, ces_high, ces_low
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
      case 'ready':
        return 'Pronto';
      case 'sent':
        return 'Enviado';
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
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'sent':
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
        return (b.insight?.nps_score || 0) - (a.insight?.nps_score || 0);
      case 'nps_low':
        return (a.insight?.nps_score || 0) - (b.insight?.nps_score || 0);
      case 'ces_high':
        return (b.insight?.ces_score || 0) - (a.insight?.ces_score || 0);
      case 'ces_low':
        return (a.insight?.ces_score || 0) - (b.insight?.ces_score || 0);
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
              <p className="text-gray-600">Transforme seus áudios em insights valiosos para o seu negócio</p>
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
                  ? 'bg-green-600 text-white'
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
                  ? 'bg-red-600 text-white'
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
                  ? 'bg-orange-600 text-white'
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
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Zap className="w-3 h-3" />
              Menor CES
            </button>
          </div>
        </div>

        {/* Content */}
        {insights && Array.isArray(insights) && insights.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedInsights.map((insight) => (
              <div
                key={insight.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden"
              >
                {/* Header do Card */}
                <div className="p-6 pb-4">
                                  <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {getInsightTypeIcon(insight.type)}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getInsightTypeColor(insight.type)}`}>
                      {insight.type || 'Insight'}
                    </span>
                  </div>
                  {insight.created_at && (
                    <div className="text-xs text-gray-400">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      <LocalizedDate date={insight.created_at} />
                    </div>
                  )}
                </div>

                {/* Status */}
                {insight.status && (
                  <div className="mb-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(insight.status)}`}>
                      {getStatusTranslation(insight.status)}
                    </span>
                  </div>
                )}

                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {insight.title || insight.name || `Insight #${insight.id}`}
                  </h3>
                  
                  {insight.description && (
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {insight.description}
                    </p>
                  )}

                  {/* Scores NPS e CES */}
                  {(insight.insight?.nps_score !== undefined || insight.insight?.ces_score !== undefined) && (
                    <div className="mt-3 flex gap-3">
                      {insight.insight?.nps_score !== undefined && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-green-600" />
                          <span className="text-xs font-medium text-gray-700">
                            NPS: <span className="text-green-600">{insight.insight.nps_score}</span>
                          </span>
                        </div>
                      )}
                      {insight.insight?.ces_score !== undefined && (
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-orange-600" />
                          <span className="text-xs font-medium text-gray-700">
                            CES: <span className="text-orange-600">{insight.insight.ces_score}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Métricas ou Valores */}
                {(insight.value || insight.metric || insight.score) && (
                  <div className="px-6 pb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm text-gray-500 mb-1">Valor</div>
                      <div className="text-xl font-bold text-[#174A8B]">
                        {insight.value || insight.metric || insight.score}
                        {insight.unit && <span className="text-sm text-gray-500 ml-1">{insight.unit}</span>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer com ações */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <button
                    onClick={() => router.push(`/insights/${insight.id}`)}
                    className="w-full inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#174A8B] hover:bg-[#0f3a6b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#174A8B] transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Detalhes
                  </button>
                </div>
              </div>
            ))}
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
