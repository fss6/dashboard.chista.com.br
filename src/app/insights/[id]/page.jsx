"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Brain, HardDrive, Volume2, Target, BarChart3, CheckCircle, AlertCircle } from "lucide-react";
import PDFDownloadButton from "../../../components/PDFDownloadButton";
import LoadingSpinner from "../../../components/LoadingSpinner";
import LocalizedDate from "../../../components/LocalizedDate";
import WordCloudLibrary from "../../../components/WordCloudLibrary";
import AudioPlayer from "../../../components/AudioPlayer";
import TranscriptionSection from "../../../components/TranscriptionSection";
import DashboardLayout from "../../../components/DashboardLayout";
import SatisfactionIndicators from "../../../components/SatisfactionIndicators";
import { useAuth } from "../../../contexts/AuthContext";
import { fetchInsightById, fetchInsightFileUrl, uploadFile, clearApiCache } from "../../../lib/api";
import { getStatusTranslation, getStatusColor } from "../../../lib/utils";

export default function InsightDetailsPage() {
  const { user, isAuthenticated, isLoading, loginWithRedirect, logout, chistaApiToken } = useAuth();
  const [insight, setInsight] = useState(null);
  const [error, setError] = useState(null);


  // Função para formatar dados estruturados
  const formatStructuredData = (data) => {
    const elements = [];
    let elementIndex = 0;

    // Resumo da conversa
    if (data.resume) {
      elements.push(
        <div key={elementIndex++} className="font-bold text-gray-900 text-lg mt-6 mb-3 first:mt-0">
          Resumo da conversa
        </div>
      );
      elements.push(
        <div key={elementIndex++} className="mb-1 leading-relaxed">
          {data.resume}
        </div>
      );
    }

    // Análise de Sentimento
    if (data.sentiment_analysis) {
      const sentiment = data.sentiment_analysis;
      
      // Sentimento geral
      if (sentiment.sentimento) {
        elements.push(
          <div key={elementIndex++} className="font-bold text-gray-900 text-lg mt-6 mb-3">
            Sentimento geral
          </div>
        );
        elements.push(
          <div key={elementIndex++} className="mb-1 leading-relaxed">
            <span className="font-semibold text-gray-800">Sentimento: </span>
            <span className="text-gray-700">{sentiment.sentimento}</span>
          </div>
        );
        if (sentiment.justificativa) {
          elements.push(
            <div key={elementIndex++} className="mb-1 leading-relaxed">
              <span className="font-semibold text-gray-800">Justificativa: </span>
              <span className="text-gray-700">{sentiment.justificativa}</span>
            </div>
          );
        }
      }

      // Pontos-chave
      if (sentiment.pontos_chave && sentiment.pontos_chave.length > 0) {
        elements.push(
          <div key={elementIndex++} className="font-bold text-gray-900 text-lg mt-6 mb-3">
            Pontos-chave
          </div>
        );
        sentiment.pontos_chave.forEach((ponto, index) => {
          elements.push(
            <div key={elementIndex++} className="mb-1 leading-relaxed">
              • {ponto}
            </div>
          );
        });
      }

      // Lições Aprendidas
      if (sentiment.licoes_aprendidas) {
        const licoes = sentiment.licoes_aprendidas;
        elements.push(
          <div key={elementIndex++} className="font-bold text-gray-900 text-lg mt-6 mb-3">
            Lições Aprendidas
          </div>
        );

        // Pontos fortes
        if (licoes.pontos_fortes && licoes.pontos_fortes.length > 0) {
          elements.push(
            <div key={elementIndex++} className="mt-4 mb-2">
              <span className="font-semibold text-gray-800">Pontos fortes identificados na conversa:</span>
            </div>
          );
          licoes.pontos_fortes.forEach((ponto, index) => {
            elements.push(
              <div key={elementIndex++} className="mb-1 leading-relaxed ml-4">
                • {ponto}
              </div>
            );
          });
        }

        // Oportunidades de melhoria
        if (licoes.oportunidades_melhoria && licoes.oportunidades_melhoria.length > 0) {
          elements.push(
            <div key={elementIndex++} className="mt-4 mb-2">
              <span className="font-semibold text-gray-800">Oportunidades de melhoria:</span>
            </div>
          );
          licoes.oportunidades_melhoria.forEach((oportunidade, index) => {
            elements.push(
              <div key={elementIndex++} className="mb-1 leading-relaxed ml-4">
                • {oportunidade}
              </div>
            );
          });
        }

        // Práticas que funcionaram bem
        if (licoes.praticas_funcionaram && licoes.praticas_funcionaram.length > 0) {
          elements.push(
            <div key={elementIndex++} className="mt-4 mb-2">
              <span className="font-semibold text-gray-800">Práticas que funcionaram bem:</span>
            </div>
          );
          licoes.praticas_funcionaram.forEach((pratica, index) => {
            elements.push(
              <div key={elementIndex++} className="mb-1 leading-relaxed ml-4">
                • {pratica}
              </div>
            );
          });
        }

        // Aspectos que poderiam ser aprimorados
        if (licoes.aspectos_aprimorar && licoes.aspectos_aprimorar.length > 0) {
          elements.push(
            <div key={elementIndex++} className="mt-4 mb-2">
              <span className="font-semibold text-gray-800">Aspectos que poderiam ser aprimorados:</span>
            </div>
          );
          licoes.aspectos_aprimorar.forEach((aspecto, index) => {
            elements.push(
              <div key={elementIndex++} className="mb-1 leading-relaxed ml-4">
                • {aspecto}
              </div>
            );
          });
        }
      }
    }



    return elements;
  };

  // Função para formatar QA Score
  const formatQAScore = (qaScoreData) => {
    if (!qaScoreData) return null;

    const elements = [];
    let elementIndex = 0;

    // Score geral
    if (qaScoreData.total_score !== undefined) {
      elements.push(
        <div key={elementIndex++} className="font-bold text-gray-900 text-lg mt-6 mb-3 first:mt-0">
          QA Score Geral
        </div>
      );
      elements.push(
        <div key={elementIndex++} className="mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#174A8B]" />
            <span className="text-2xl font-bold text-[#174A8B]">{qaScoreData.total_score}</span>
            <span className="text-gray-600">pontos</span>
          </div>
        </div>
      );
    }

    // Avaliações por bloco
    if (qaScoreData.evaluations && qaScoreData.evaluations.length > 0) {
      elements.push(
        <div key={elementIndex++} className="font-bold text-gray-900 text-lg mt-6 mb-3">
          Avaliações por Critério
        </div>
      );
      
      qaScoreData.evaluations.forEach((evaluation, index) => {
        elements.push(
          <div key={elementIndex++} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">{evaluation.block_name}</h4>
                <p className="text-sm text-gray-600 mb-2">{evaluation.block_description}</p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <span className="text-lg font-bold text-[#174A8B]">{evaluation.score}/5</span>
                <span className="text-sm text-gray-500">({evaluation.weight}% peso)</span>
              </div>
            </div>
            
            {evaluation.justification && (
              <div className="mt-3 p-3 bg-white rounded border-l-4 border-[#174A8B]">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Justificativa:</span> {evaluation.justification}
                </p>
              </div>
            )}
          </div>
        );
      });
    }

    return elements;
  };
  const [dataLoading, setDataLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const params = useParams();
  const router = useRouter();
  const insightId = params?.id;





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
    <DashboardLayout user={user} logout={logout}>
      <div className="p-6">
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
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Conteúdo Principal */}
            <div className="p-6 space-y-8">
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

               {/* 5. Indicadores de Satisfação */}
               <div id="indicadores-satisfacao">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-[#174A8B]" />
                    Indicadores de Satisfação
                  </h3>
                  <PDFDownloadButton insight={insight} insightId={insightId} />
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <SatisfactionIndicators 
                    indicators={insight?.insight?.sentiment_analysis?.indicadores_satisfacao}
                  />
                </div>
              </div>

              {/* 6. QA Score */}
              {insight?.qa_score && (
                <div id="qa-score">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    QA Score
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    {insight.qa_score_summary ? (
                      <div className="prose max-w-none">
                        <div className="text-gray-700 leading-relaxed">
                          {formatQAScore(insight.qa_score_summary)}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>Nenhum QA Score disponível</p>
                        <p className="text-sm mt-2">O QA Score será gerado automaticamente após o processamento</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 4. Resumo e Insights */}
              <div id="resumo-ia">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-[#174A8B]" />
                  Resumo e Insights
                </h3>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  {insight?.insight?.as_structured_json ? (
                    <div className="prose max-w-none">
                      <div className="text-gray-700 leading-relaxed">
                        {formatStructuredData(insight.insight.as_structured_json)}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <Brain className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>Nenhum resumo estruturado disponível</p>
                      <p className="text-sm mt-2">O resumo estruturado será gerado automaticamente após o processamento</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 6. Nuvem de Palavras */}
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
    </DashboardLayout>
  );
}