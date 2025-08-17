"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Calendar, TrendingUp, BarChart3, Filter, Info, Upload, Cloud, FileText, Heart, Brain, Clock, HardDrive, Play, Pause, Volume2, Download } from "lucide-react";
import LoadingSpinner from "../../../components/LoadingSpinner";
import LocalizedDate from "../../../components/LocalizedDate";
import UploadModal from "../../../components/UploadModal";
import WordCloud from "../../../components/WordCloud";
import AudioPlayer from "../../../components/AudioPlayer";
import { useAuth } from "../../../contexts/AuthContext";
import { fetchInsightById, fetchInsightFileUrl, useLoadingState, uploadFile, clearApiCache } from "../../../lib/api";

export default function InsightDetailsPage() {
  const { user, isAuthenticated, isLoading, loginWithRedirect, logout, chistaApiToken } = useAuth();
  const [insight, setInsight] = useState(null);
  const [error, setError] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const params = useParams();
  const router = useRouter();
  const insightId = params.id;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect();
    }
  }, [isLoading, isAuthenticated, loginWithRedirect]);

  useEffect(() => {
    if (isAuthenticated && chistaApiToken && insightId) {
      setDataLoading(true);
      
      // Buscar dados do insight e URL do áudio em paralelo
      Promise.all([
        fetchInsightById(insightId, chistaApiToken),
        fetchInsightFileUrl(insightId, chistaApiToken).catch((err) => {
          console.log('Erro ao buscar URL do áudio:', err);
          return null;
        }) // Falha silenciosa para áudio
      ])
        .then(([insightData, audioData]) => {
          console.log('Dados do insight:', insightData);
          console.log('Dados do áudio:', audioData);
          
          setInsight(insightData);
          
          // Tentar diferentes estruturas de resposta
          if (audioData) {
            let url = null;
            
            // Estrutura 1: { file_url: "..." }
            if (audioData.file_url) {
              url = audioData.file_url;
            }
            // Estrutura 2: { url: "..." }
            else if (audioData.url) {
              url = audioData.url;
            }
            // Estrutura 3: string direta
            else if (typeof audioData === 'string') {
              url = audioData;
            }
            // Estrutura 4: { data: { file_url: "..." } }
            else if (audioData.data && audioData.data.file_url) {
              url = audioData.data.file_url;
            }
            
            console.log('URL final do áudio:', url);
            if (url) {
              setAudioUrl(url);
            }
          }
        })
        .catch((err) => setError(err.message))
        .finally(() => setDataLoading(false));
    }
  }, [isAuthenticated, chistaApiToken, insightId]);

  // Usa o hook otimizado para gerenciar o estado de loading
  const { shouldShowLoading, message, subtitle } = useLoadingState(
    isLoading,           // authLoading
    dataLoading,         // dataLoading
    !!insight,           // hasData
    !!error              // hasError
  );

  const getInsightTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'trend':
        return <TrendingUp className="w-6 h-6 text-green-500" />;
      case 'metric':
        return <BarChart3 className="w-6 h-6 text-blue-500" />;
      case 'analysis':
        return <Filter className="w-6 h-6 text-purple-500" />;
      default:
        return <BarChart3 className="w-6 h-6 text-gray-500" />;
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
      // Clear cache after successful upload
      clearApiCache();
    } catch (error) {
      throw error; // Re-throw to let modal handle the error display
    }
  };



  const mockAISummary = {
    summary: "Este áudio contém uma discussão detalhada sobre estratégias de crescimento tecnológico, focando em inovação e desenvolvimento de software. Os principais pontos abordam análise de dados, implementação de insights e otimização de processos de negócio.",
    insights: [
      "Foco em tecnologias emergentes para acelerar o crescimento",
      "Importância da análise de dados para tomada de decisões",
      "Necessidade de otimizar processos internos",
      "Investimento em capacitação da equipe técnica"
    ]
  };

  const mockSentimentAnalysis = {
    overall: "positive",
    score: 0.75,
    breakdown: {
      positive: 65,
      neutral: 25,
      negative: 10
    },
    emotions: [
      { emotion: "Confiança", percentage: 45, color: "bg-green-500" },
      { emotion: "Otimismo", percentage: 30, color: "bg-blue-500" },
      { emotion: "Determinação", percentage: 15, color: "bg-purple-500" },
      { emotion: "Preocupação", percentage: 10, color: "bg-yellow-500" }
    ]
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
        <header className="w-full h-20 bg-white border-b border-blue-100 flex items-center justify-between px-4 md:px-8 shadow-sm sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <Image src="/logo.png" alt="Logo Chista" width={88} height={48} priority />
            <span className="text-[#174A8B] font-bold text-xl">Insights</span>
          </div>
          {isAuthenticated && user && (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-[#174A8B] max-w-[10rem] truncate">{user.name || user.email}</span>
              <Image
                src={user.picture || "/logo.png"}
                alt={user.name || "Avatar"}
                width={40}
                height={40}
                className="rounded-full border border-blue-200"
              />
              <button
                className="ml-2 px-4 py-2 bg-[#174A8B] text-white rounded hover:bg-blue-900 transition text-sm font-semibold"
                onClick={() => logout({ returnTo: window.location.origin })}
              >
                Logout
              </button>
            </div>
          )}
        </header>

        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] text-red-600">
          <div className="text-center p-8">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-red-800 mb-2">Erro ao Carregar Insight</h1>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="w-full h-20 bg-white border-b border-blue-100 flex items-center justify-between px-4 md:px-8 shadow-sm sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Image src="/logo.png" alt="Logo Chista" width={88} height={48} priority />
          <span className="text-[#174A8B] font-bold text-xl">Insights</span>
        </div>
        {isAuthenticated && user && (
          <div className="flex items-center gap-4">
            <button
              onClick={() => setUploadModalOpen(true)}
              className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </button>
            <span className="text-sm font-medium text-[#174A8B] max-w-[10rem] truncate">{user.name || user.email}</span>
            <Image
              src={user.picture || "/logo.png"}
              alt={user.name || "Avatar"}
              width={40}
              height={40}
              className="rounded-full border border-blue-200"
            />
            <button
              className="ml-2 px-4 py-2 bg-[#174A8B] text-white rounded hover:bg-blue-900 transition text-sm font-semibold"
              onClick={() => logout({ returnTo: window.location.origin })}
            >
              Logout
            </button>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="w-full max-w-6xl mx-auto px-4 py-8">
        {/* Botão Voltar */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/insights')}
            className="flex items-center text-[#174A8B] hover:text-[#0f3a6b] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Insights
          </button>
        </div>

        {insight ? (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header do Insight */}
            <div className="bg-gradient-to-r from-[#174A8B] to-[#0f3a6b] px-6 py-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    {getInsightTypeIcon(insight.type)}
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getInsightTypeColor(insight.type)}`}>
                      {insight.type || 'Insight'}
                    </span>
                    {insight.status && (
                      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(insight.status)}`}>
                        {getStatusTranslation(insight.status)}
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold text-white mb-2">
                    {insight.title || insight.name || `Insight #${insight.id}`}
                  </h1>
                  {insight.description && (
                    <p className="text-blue-100 text-lg">{insight.description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Conteúdo Principal */}
            <div className="p-6 space-y-8">
              {/* Seção de Upload Stats */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <HardDrive className="w-5 h-5 mr-2 text-[#174A8B]" />
                  Estatísticas de Upload
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {insight.upload_stats ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {insight.upload_stats.file_name && (
                        <div>
                          <div className="text-sm text-gray-500">Arquivo</div>
                          <div className="text-sm font-medium text-gray-900 truncate">{insight.upload_stats.file_name}</div>
                        </div>
                      )}
                      {insight.upload_stats.file_size && (
                        <div>
                          <div className="text-sm text-gray-500">Tamanho</div>
                          <div className="text-sm font-medium text-gray-900">{Math.round(insight.upload_stats.file_size / 1024)} KB</div>
                        </div>
                      )}
                      {insight.upload_stats.upload_duration_ms && (
                        <div>
                          <div className="text-sm text-gray-500">Duração Upload</div>
                          <div className="text-sm font-medium text-gray-900">{insight.upload_stats.upload_duration_ms}ms</div>
                        </div>
                      )}
                      {insight.upload_stats.upload_completed_at && (
                        <div>
                          <div className="text-sm text-gray-500">Concluído em</div>
                          <div className="text-sm font-medium text-gray-900">
                            <LocalizedDate date={insight.upload_stats.upload_completed_at} />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">Nenhuma estatística de upload disponível</p>
                  )}
                </div>
              </div>

              {/* Player de Áudio */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Volume2 className="w-5 h-5 mr-2 text-[#174A8B]" />
                  Áudio Original
                </h3>
                <AudioPlayer 
                  audioUrl={audioUrl} 
                  title={`Insight ${insight?.id || insightId}`}
                />
              </div>

              {/* Transcrição do Áudio */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-[#174A8B]" />
                  Transcrição do Áudio
                </h3>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  {/* Header da Transcrição */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center space-x-4">
                      {insight?.insight?.transcription_confidence && (
                        <div className="text-sm text-gray-500">
                          Confiança da transcrição: 
                          <span className="ml-2 font-medium text-green-600">
                            {Math.round(insight.insight.transcription_confidence * 100)}%
                          </span>
                        </div>
                      )}
                      {insight?.duration && (
                        <div className="text-sm text-gray-500">
                          Duração: <span className="font-medium">{insight.duration}</span>
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => {
                        if (insight?.insight?.transcription) {
                          navigator.clipboard.writeText(insight.insight.transcription);
                        }
                      }}
                      className="text-sm text-[#174A8B] hover:text-[#123456] font-medium"
                    >
                      Copiar texto
                    </button>
                  </div>

                  {/* Texto da Transcrição */}
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed text-base">
                      {insight?.insight?.transcription || 'Nenhuma transcrição disponível'}
                    </p>
                  </div>

                  {/* Footer da Transcrição */}
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Transcrição processada automaticamente</span>
                      <span>Última atualização: {new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Nuvem de Palavras */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Cloud className="w-5 h-5 mr-2 text-[#174A8B]" />
                  Nuvem de Palavras
                </h3>
                <div className="flex justify-center">
                  <WordCloud 
                    text={insight?.insight?.transcription} 
                    width={Math.min(800, typeof window !== 'undefined' ? window.innerWidth - 100 : 800)} 
                    height={450}
                    className="w-full max-w-4xl"
                  />
                </div>
              </div>

              {/* Resumo da IA */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-[#174A8B]" />
                  Resumo e Insights da IA
                </h3>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      Resumo
                    </h4>
                    <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                      {mockAISummary.summary}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Principais Insights
                    </h4>
                    <ul className="space-y-2">
                      {mockAISummary.insights.map((insight, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-[#174A8B] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-gray-700">{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  * Conteúdo mock - será substituído por análise real da IA
                </p>
              </div>

              {/* Análise de Sentimento */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-[#174A8B]" />
                  Análise de Sentimento
                </h3>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  {/* Sentimento Geral */}
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-900 mb-3">Sentimento Geral</h4>
                    <div className="flex items-center space-x-4">
                      <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                        mockSentimentAnalysis.overall === 'positive' ? 'bg-green-100 text-green-800' :
                        mockSentimentAnalysis.overall === 'negative' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {mockSentimentAnalysis.overall === 'positive' ? 'Positivo' :
                         mockSentimentAnalysis.overall === 'negative' ? 'Negativo' : 'Neutro'}
                      </div>
                      <div className="text-2xl font-bold text-[#174A8B]">
                        {Math.round(mockSentimentAnalysis.score * 100)}%
                      </div>
                    </div>
                  </div>

                  {/* Distribuição de Sentimentos */}
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-900 mb-3">Distribuição</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{mockSentimentAnalysis.breakdown.positive}%</div>
                        <div className="text-sm text-gray-500">Positivo</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-600">{mockSentimentAnalysis.breakdown.neutral}%</div>
                        <div className="text-sm text-gray-500">Neutro</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{mockSentimentAnalysis.breakdown.negative}%</div>
                        <div className="text-sm text-gray-500">Negativo</div>
                      </div>
                    </div>
                  </div>

                  {/* Emoções Detectadas */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">Emoções Detectadas</h4>
                    <div className="space-y-3">
                      {mockSentimentAnalysis.emotions.map((emotion, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">{emotion.emotion}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${emotion.color}`}
                                style={{ width: `${emotion.percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-500 w-8">{emotion.percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  * Análise mock - será substituída por processamento real de IA
                </p>
              </div>

              {/* Informações Adicionais */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Metadados */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Informações Gerais</h4>
                  <div className="space-y-3">
                    {insight.source && (
                      <div>
                        <div className="text-sm text-gray-500">Fonte</div>
                        <div className="text-sm font-medium text-gray-900">{insight.source}</div>
                      </div>
                    )}
                    {insight.category && (
                      <div>
                        <div className="text-sm text-gray-500">Categoria</div>
                        <div className="text-sm font-medium text-gray-900">{insight.category}</div>
                      </div>
                    )}
                    {insight.confidence && (
                      <div>
                        <div className="text-sm text-gray-500">Confiança</div>
                        <div className="text-sm font-medium text-gray-900">
                          {insight.confidence}%
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${insight.confidence}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags */}
                {insight.tags && insight.tags.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {insight.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Valor/Métrica Principal */}
                {(insight.value || insight.metric || insight.score) && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Métricas</h4>
                    <div className="text-3xl font-bold text-[#174A8B]">
                      {insight.value || insight.metric || insight.score}
                      {insight.unit && <span className="text-lg text-gray-500 ml-2">{insight.unit}</span>}
                    </div>
                    {insight.change && (
                      <div className={`text-sm mt-2 ${insight.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {insight.change > 0 ? '↗️' : '↘️'} {Math.abs(insight.change)}% 
                        {insight.period && ` em ${insight.period}`}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Dados Completos (para debug) */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Dados Completos</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap break-words overflow-x-auto">
                    {JSON.stringify(insight, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Insight não encontrado</h3>
            <p className="text-gray-500">O insight solicitado não foi encontrado.</p>
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
