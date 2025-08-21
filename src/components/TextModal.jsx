"use client";
import React, { useState } from 'react';
import { X, FileText, Send, Loader2 } from 'lucide-react';
import { uploadText } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

const TextModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!text.trim() || !description.trim()) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    setStep(2);
    setProgress(25);

    try {
      // Simular progresso
      setProgress(50);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProgress(75);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Chamar a API real para enviar o texto
      await uploadText(text, description, user?.chistaApiToken);
      
      setProgress(100);
      await new Promise(resolve => setTimeout(resolve, 500));

      onSuccess();
    } catch (error) {
      console.error('Erro ao enviar texto:', error);
      alert('Erro ao enviar texto. Tente novamente.');
    } finally {
      setIsSubmitting(false);
      setStep(1);
      setProgress(0);
      setText('');
      setDescription('');
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setText('');
      setDescription('');
      setStep(1);
      setProgress(0);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Enviar Texto</h2>
              <p className="text-sm text-gray-500">Adicione um texto para análise</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Descrição */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Digite uma descrição para o texto..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Texto */}
              <div>
                <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
                  Texto <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Cole ou digite o texto que deseja analisar..."
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  required
                />
                <div className="mt-1 text-xs text-gray-500">
                  {text.length} caracteres
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !text.trim() || !description.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Enviar Texto
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Progress Step */
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Processando texto...</h3>
                <p className="text-sm text-gray-500">
                  {progress < 50 && "Criando análise..."}
                  {progress >= 50 && progress < 100 && "Gerando insights..."}
                  {progress >= 100 && "Concluído!"}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              <div className="text-center text-sm text-gray-500">
                {progress}% concluído
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TextModal;
