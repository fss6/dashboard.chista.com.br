"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, TrendingUp, BarChart3, Calendar, Filter, Upload } from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner";
import LocalizedDate from "../../components/LocalizedDate";
import UploadModal from "../../components/UploadModal";
import NavMenu from "../../components/NavMenu";
import { useAuth } from "../../contexts/AuthContext";
import { fetchInsights, useLoadingState, uploadFile, clearApiCache } from "../../lib/api";

export default function InsightsPage() {
  const { user, isAuthenticated, isLoading, loginWithRedirect, logout, chistaApiToken } = useAuth();
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
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
        showUploadButton={true}
        onUploadClick={() => setUploadModalOpen(true)}
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
            {insights && (
              <div className="text-sm text-gray-500">
                {insights.length} insight{insights.length !== 1 ? 's' : ''} encontrado{insights.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {insights && Array.isArray(insights) && insights.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {insights.map((insight) => (
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
    </div>
  );
}
