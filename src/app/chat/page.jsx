"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { sendChatMessage } from '../../lib/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import NavMenu from '../../components/NavMenu';
import { Send, Bot, User, Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

const ChatPage = () => {
  const { isAuthenticated, isLoading, getAccessTokenSilently, user, logout } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const messagesEndRef = useRef(null);

  // Mensagem de boas-vindas inicial
  useEffect(() => {
    if (isAuthenticated && messages.length === 0) {
      const welcomeMessage = {
        id: 'welcome',
        role: 'assistant',
        content: 'Olá! Sou a Chista, sua assistente especializada em análise de interações com clientes. Como posso ajudá-lo hoje?',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isAuthenticated, messages.length]);

  // Scroll para a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoadingResponse) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    // Adiciona mensagem do usuário
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoadingResponse(true);

    try {
      const token = await getAccessTokenSilently();
      
      // Chama a API para obter resposta
      const data = await sendChatMessage(
        userMessage.content,
        user?.sub || user?.id,
        token
      );
      
      // Adiciona resposta da API
      const botMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.response || data.message || "Desculpe, não consegui processar sua mensagem.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      // Adiciona mensagem de erro
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoadingResponse(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Acesso Negado
          </h1>
          <p className="text-gray-600">
            Você precisa estar logado para acessar o chat.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - seguindo o padrão das outras páginas */}
      <NavMenu 
        currentPage="chat" 
        user={user}
        isAuthenticated={isAuthenticated}
        logout={logout}
      />

      {/* Page Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Chat com Chista AI</h1>
          <p className="text-gray-600">
            Faça perguntas e obtenha respostas inteligentes sobre análise de sentimentos
          </p>
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-lg shadow-sm border h-[70vh] flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex max-w-[80%] ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user'
                        ? 'bg-[#174A8B] text-white ml-3'
                        : 'bg-gray-100 text-gray-600 mr-3'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div
                    className={`px-4 py-2 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-[#174A8B] text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </div>
                    <div className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoadingResponse && (
              <div className="flex justify-start">
                <div className="flex max-w-[80%]">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 text-gray-600 mr-3 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="px-4 py-2 rounded-lg bg-gray-100 text-gray-900">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Chista AI está digitando...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t bg-gray-50 p-4 rounded-b-lg">
            <form onSubmit={sendMessage} className="flex space-x-4">
              <div className="flex-1">
                <input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua mensagem aqui..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#174A8B] focus:border-transparent resize-none"
                  disabled={isLoadingResponse}
                />
              </div>
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoadingResponse}
                className="px-6 py-3 bg-[#174A8B] text-white rounded-lg hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center space-x-2"
              >
                {isLoadingResponse ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Enviar</span>
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-2">
              Pressione Enter para enviar, Shift+Enter para nova linha
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;