"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Calendar, TrendingUp, BarChart3, Filter, Info, Upload, Cloud, FileText, Heart, Brain, Clock, HardDrive, Play, Pause, Volume2, Download, GraduationCap, CheckCircle, AlertCircle, Target } from "lucide-react";
import LoadingSpinner from "../../../components/LoadingSpinner";
import LocalizedDate from "../../../components/LocalizedDate";
import UploadModal from "../../../components/UploadModal";
import WordCloudLibrary from "../../../components/WordCloudLibrary";
import AudioPlayer from "../../../components/AudioPlayer";
import TranscriptionSection from "../../../components/TranscriptionSection";
import NavMenu from "../../../components/NavMenu";
import { useAuth } from "../../../contexts/AuthContext";
import { fetchInsightById, fetchInsightFileUrl, useLoadingState, uploadFile, clearApiCache } from "../../../lib/api";

export default function InsightDetailsPage() {
  const { user, isAuthenticated, isLoading, loginWithRedirect, logout, chistaApiToken } = useAuth();
  const [insight, setInsight] = useState(null);
  const [error, setError] = useState(null);


  // Função para formatar o texto do resumo com títulos em negrito
  const formatResumeText = (text) => {
    if (!text) return null;
    
    const titlePatterns = [
      'Resumo da conversa',
      'Pontos-chave', 
      'Pontos chave',
      'Lições Aprendidas',
      'Sentimento geral',
      'Próximos passos',
      'Sugestão prática'
    ];
    
    const lines = text.split('\n');
    const formattedElements = [];
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Verifica se a linha é um dos títulos principais
      const isMainTitle = titlePatterns.some(pattern => 
        trimmedLine.startsWith(pattern) || trimmedLine === pattern
      );
      
      // Verifica se é um subtítulo numerado (ex: "1. Ações imediatas", "2. Ações de curto prazo")
      const isNumberedSubtitle = /^\d+\.\s+[A-Z]/.test(trimmedLine);
      
      // Verifica se é uma subseção de Lições Aprendidas
      const learningSubsections = [
        'pontos fortes identificados na conversa',
        'oportunidades de melhoria', 
        'práticas que funcionaram bem',
        'aspectos que poderiam ser aprimorados'
      ];
      const isLearningSubsection = learningSubsections.some(pattern => 
        trimmedLine.toLowerCase().includes(pattern.toLowerCase())
      );
      
      if (isMainTitle) {
        formattedElements.push(
          <div key={index} className="font-bold text-gray-900 text-lg mt-6 mb-3 first:mt-0">
            {trimmedLine}
          </div>
        );
      } else if (isLearningSubsection) {
        // Pequena ênfase para subseções de Lições Aprendidas - negrito apenas antes dos dois pontos
        const colonIndex = trimmedLine.indexOf(':');
        if (colonIndex > 0) {
          const beforeColon = trimmedLine.substring(0, colonIndex);
          const afterColon = trimmedLine.substring(colonIndex);
          // Capitaliza a primeira letra
          const capitalizedBefore = beforeColon.charAt(0).toUpperCase() + beforeColon.slice(1);
          
          formattedElements.push(
            <div key={index} className="mt-4 mb-2">
              <span className="font-semibold text-gray-800">{capitalizedBefore}</span>
              <span className="text-gray-700">{afterColon}</span>
            </div>
          );
        } else {
          // Caso não tenha dois pontos, aplica formatação padrão
          const capitalized = trimmedLine.charAt(0).toUpperCase() + trimmedLine.slice(1);
          formattedElements.push(
            <div key={index} className="font-semibold text-gray-800 mt-4 mb-2">
              {capitalized}
            </div>
          );
        }
      } else if (isNumberedSubtitle) {
        formattedElements.push(
          <div key={index} className="font-semibold text-gray-800 mt-4 mb-2">
            {trimmedLine}
          </div>
        );
      } else if (trimmedLine) {
        // Linha com conteúdo normal
        formattedElements.push(
          <div key={index} className="mb-1 leading-relaxed">
            {line}
          </div>
        );
      } else {
        // Linha vazia - adiciona espaçamento
        formattedElements.push(
          <div key={index} className="h-3"></div>
        );
      }
    });
    
    return formattedElements;
  };
  const [dataLoading, setDataLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const params = useParams();
  const router = useRouter();
  const insightId = params?.id;

  // Mock data - removido após implementação real
  const getStatusTranslation = (status) => {
    switch (status) {
      case 'awaiting_upload': return 'Aguardando Upload';
      case 'ready': return 'Pronto';
      case 'sent': return 'Enviado';
      case 'error': return 'Erro';
      default: return status || 'Desconhecido';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'awaiting_upload': return 'bg-yellow-100 text-yellow-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleUpload = async (file, description, onProgress) => {
    if (!chistaApiToken) {
      throw new Error('Token de autenticação não encontrado');
    }

    try {
      const result = await uploadFile(file, description, chistaApiToken, onProgress);
      clearApiCache();
      window.location.reload();
      return result;
    } catch (error) {
      console.error('Erro no upload:', error);
      throw error;
    }
  };




  useEffect(() => {
    if (isAuthenticated && chistaApiToken && insightId) {
      setDataLoading(true);
      Promise.all([
        fetchInsightById(insightId, chistaApiToken),
        fetchInsightFileUrl(insightId, chistaApiToken).catch((err) => {
          console.log('Erro ao buscar URL do áudio:', err);
          return null;
        })
      ])
        .then(([insightData, audioData]) => {
          setInsight(insightData);
          if (audioData) {
            let url = null;
            if (audioData.file_url) {
              url = audioData.file_url;
            } else if (audioData.url) {
              url = audioData.url;
            } else if (typeof audioData === 'string') {
              url = audioData;
            } else if (audioData.data && audioData.data.file_url) {
              url = audioData.data.file_url;
            }
            
            if (url) {
              setAudioUrl(url);
            }
          }
        })
        .catch((err) => setError(err.message))
        .finally(() => setDataLoading(false));
    }
  }, [isAuthenticated, chistaApiToken, insightId]);

  if (isLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acesso Restrito</h2>
          <p className="text-gray-600 mb-6">Você precisa estar logado para ver este insight.</p>
          <button
            onClick={() => loginWithRedirect()}
            className="bg-[#174A8B] hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Fazer Login
          </button>
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

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto">
        {insight ? (
          <div className="px-4 py-6">
            <div className="bg-white shadow-lg rounded-lg">
            {/* Header do Insight */}
            <div className="border-b border-gray-200">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Botão voltar no topo do card */}
                    <div className="flex items-center mb-4">
                      <button
                        onClick={() => router.push('/insights')}
                        className="bg-[#174A8B] hover:bg-blue-700 text-white p-2 rounded-lg transition-all duration-200 hover:scale-105 mr-3 shadow-sm"
                        title="Voltar para lista de insights"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Insight #{insight.id}
                      </h2>
                      {insight.status && (
                        <span className={`inline-flex mx-3 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(insight.status)}`}>
                          {getStatusTranslation(insight.status)}
                        </span>
                      )}
                    </div>
                    
                    {insight.description && (
                      <p className="text-gray-600 mb-4">{insight.description}</p>
                    )}
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      {insight.created_at && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Criado em <LocalizedDate date={insight.created_at} /></span>
                        </div>
                      )}
                      {insight.updated_at && (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>Atualizado em <LocalizedDate date={insight.updated_at} /></span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Conteúdo Principal */}
            <div className="p-6 space-y-8">
              {/* Navegação Rápida */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Navegação Rápida</h4>
                <div className="flex flex-wrap gap-2">
                  <a 
                    href="#upload-stats" 
                    className="inline-flex items-center px-3 py-1 text-xs bg-white text-blue-700 rounded-full border border-blue-300 hover:bg-blue-100 transition-colors"
                  >
                    💽 Estatísticas de Upload
                  </a>
                  <a 
                    href="#audio-player" 
                    className="inline-flex items-center px-3 py-1 text-xs bg-white text-blue-700 rounded-full border border-blue-300 hover:bg-blue-100 transition-colors"
                  >
                    🎵 Áudio Original
                  </a>
                  <a 
                    href="#transcricao" 
                    className="inline-flex items-center px-3 py-1 text-xs bg-white text-blue-700 rounded-full border border-blue-300 hover:bg-blue-100 transition-colors"
                  >
                    📝 Transcrição
                  </a>
                  <a 
                    href="#resumo-ia" 
                    className="inline-flex items-center px-3 py-1 text-xs bg-white text-blue-700 rounded-full border border-blue-300 hover:bg-blue-100 transition-colors"
                  >
                    🧠 Resumo e Insights
                  </a>
                  <a 
                    href="#nuvem-palavras" 
                    className="inline-flex items-center px-3 py-1 text-xs bg-white text-blue-700 rounded-full border border-blue-300 hover:bg-blue-100 transition-colors"
                  >
                    ☁️ Nuvem de Palavras
                  </a>
                </div>
              </div>
              {/* 1. Estatísticas de Upload */}
              <div id="upload-stats">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <HardDrive className="w-5 h-5 mr-2 text-[#174A8B]" />
                  Estatísticas de Upload
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {insight.upload_stats ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {insight.upload_stats.file_name && (
                        <div>
                          <div className="text-sm text-gray-500">Nome do Arquivo</div>
                          <div className="text-sm font-medium text-gray-900 truncate" title={insight.upload_stats.file_name}>
                            {insight.upload_stats.file_name}
                          </div>
                        </div>
                      )}
                      {insight.upload_stats.file_size && (
                        <div>
                          <div className="text-sm text-gray-500">Tamanho</div>
                          <div className="text-sm font-medium text-gray-900">
                            {(insight.upload_stats.file_size / (1024 * 1024)).toFixed(2)} MB
                          </div>
                        </div>
                      )}
                      {insight.upload_stats.file_type && (
                        <div>
                          <div className="text-sm text-gray-500">Tipo</div>
                          <div className="text-sm font-medium text-gray-900">{insight.upload_stats.file_type}</div>
                        </div>
                      )}
                      {insight.upload_stats.upload_duration_ms && (
                        <div>
                          <div className="text-sm text-gray-500">Duração do Upload</div>
                          <div className="text-sm font-medium text-gray-900">
                            {(insight.upload_stats.upload_duration_ms / 1000).toFixed(1)}s
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">Nenhuma estatística de upload disponível</p>
                  )}
                </div>
              </div>

              {/* 2. Player de Áudio */}
              <div id="audio-player">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Volume2 className="w-5 h-5 mr-2 text-[#174A8B]" />
                  Áudio Original
                </h3>
                <AudioPlayer 
                  audioUrl={audioUrl} 
                  title={`Insight ${insight?.id || insightId}`}
                />
              </div>

              {/* 3. Transcrição do Áudio */}
              <div id="transcricao">
                <TranscriptionSection insight={insight} />
              </div>

              {/* 4. Resumo e Insights */}
              <div id="resumo-ia">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-[#174A8B]" />
                  Resumo e Insights
                </h3>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  {insight?.insight?.resume ? (
                    <div className="prose max-w-none">
                      <div className="text-gray-700 leading-relaxed">
                        {formatResumeText(insight.insight.resume.replace(/\\n/g, '\n'))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <Brain className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>Nenhum resumo disponível</p>
                      <p className="text-sm mt-2">O resumo será gerado automaticamente após o processamento</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 5. Nuvem de Palavras */}
              <div id="nuvem-palavras">
                <WordCloudLibrary 
                  text={insight?.insight?.transcription} 
                  title="Nuvem de Palavras"
                />
              </div>
            </div>
            </div>
          </div>
        ) : error ? (
          <div className="px-4 py-6">
            <div className="bg-white shadow-lg rounded-lg p-6">
              <div className="text-center text-red-600">
                <p>Erro: {error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Tentar Novamente
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-4 py-6">
            <div className="bg-white shadow-lg rounded-lg p-6">
              <LoadingSpinner />
            </div>
          </div>
        )}
      </div>


    </div>
  );
}