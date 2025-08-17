"use client";
import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, Copy, Maximize2, Minimize2 } from 'lucide-react';

const TranscriptionSection = ({ insight }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  const transcription = insight?.insight?.transcription;
  const transcriptionConfidence = insight?.insight?.transcription_confidence;
  const duration = insight?.duration;

  if (!transcription) {
    return (
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-[#174A8B]" />
          Transcrição do Áudio
        </h3>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-center text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Nenhuma transcrição disponível</p>
          </div>
        </div>
      </div>
    );
  }

  // Determinar se o texto é longo (mais de 500 caracteres)
  const isLongText = transcription.length > 500;
  const previewText = isLongText ? transcription.substring(0, 300) + '...' : transcription;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(transcription);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar texto:', err);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      setIsExpanded(true); // Auto expandir no fullscreen
    }
  };

  return (
    <>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-[#174A8B]" />
          Transcrição do Áudio
          {isLongText && !isExpanded && (
            <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
              Texto longo
            </span>
          )}
        </h3>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          {/* Header da Transcrição */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
            <div className="flex items-center space-x-4">
              {transcriptionConfidence && (
                <div className="text-sm text-gray-500">
                  Confiança: 
                  <span className="ml-2 font-medium text-green-600">
                    {Math.round(transcriptionConfidence * 100)}%
                  </span>
                </div>
              )}
              {duration && (
                <div className="text-sm text-gray-500">
                  Duração: <span className="font-medium">{duration}</span>
                </div>
              )}
              <div className="text-sm text-gray-500">
                {transcription.length} caracteres
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleCopy}
                className="flex items-center gap-1 text-sm text-[#174A8B] hover:text-[#123456] font-medium transition-colors"
              >
                <Copy className="w-4 h-4" />
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
              
              <button
                onClick={toggleFullscreen}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                title={isFullscreen ? 'Sair do modo tela cheia' : 'Modo tela cheia'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Texto da Transcrição */}
          <div className="prose max-w-none">
            <div className={`text-gray-700 leading-relaxed text-base ${
              isLongText && !isExpanded ? 'max-h-32 overflow-hidden relative' : ''
            }`}>
              <p className="whitespace-pre-wrap">
                {isExpanded || !isLongText ? transcription : previewText}
              </p>
              
              {/* Gradient overlay para texto cortado */}
              {isLongText && !isExpanded && (
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
              )}
            </div>
          </div>

          {/* Botão Expandir/Recolher para textos longos */}
          {isLongText && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#174A8B] hover:text-[#123456] hover:bg-blue-50 rounded-lg transition-colors"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Mostrar menos
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Mostrar texto completo
                  </>
                )}
              </button>
            </div>
          )}

          {/* Footer da Transcrição */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Transcrição processada automaticamente</span>
              <span>Última atualização: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Fullscreen */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-white overflow-auto">
          <div className="min-h-screen p-6">
            {/* Header do Modal */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-[#174A8B]" />
                <h2 className="text-xl font-semibold text-gray-900">Transcrição Completa</h2>
              </div>
              
              <div className="flex items-center space-x-4">
                {transcriptionConfidence && (
                  <div className="text-sm text-gray-500">
                    Confiança: 
                    <span className="ml-2 font-medium text-green-600">
                      {Math.round(transcriptionConfidence * 100)}%
                    </span>
                  </div>
                )}
                
                <button 
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-[#174A8B] hover:text-white hover:bg-[#174A8B] border border-[#174A8B] rounded-lg transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? 'Copiado!' : 'Copiar Texto'}
                </button>
                
                <button
                  onClick={toggleFullscreen}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors"
                >
                  <Minimize2 className="w-4 h-4" />
                  Fechar
                </button>
              </div>
            </div>

            {/* Conteúdo do Modal */}
            <div className="max-w-4xl mx-auto">
              <div className="prose prose-lg max-w-none">
                <div className="text-gray-700 leading-relaxed text-base whitespace-pre-wrap font-sans">
                  {transcription}
                </div>
              </div>
              
              {/* Footer */}
              <div className="mt-8 pt-4 border-t border-gray-200 text-center">
                <div className="text-sm text-gray-500">
                  {transcription.length} caracteres • Processado automaticamente
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TranscriptionSection;

