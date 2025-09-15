"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  sendChatMessage, 
  getConversations, 
  createConversation, 
  updateConversation, 
  deleteConversation as deleteConversationApi,
  getConversationMessages 
} from '../../lib/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import NavMenu from '../../components/NavMenu';
import { Send, Bot, User, Loader2, Plus, MessageSquare, Trash2, Menu } from 'lucide-react';
import dynamicImport from 'next/dynamic';

const ReactMarkdown = dynamicImport(() => import('react-markdown'), { ssr: false });

export const dynamic = 'force-dynamic';

const ChatPage = () => {
  const { isAuthenticated, isLoading, user, logout, chistaApiToken } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);


  // Carregar conversas da API
  useEffect(() => {
    const loadConversations = async () => {
      if (isAuthenticated && user && chistaApiToken) {
        try {
          const conversationsData = await getConversations(user.sub, chistaApiToken);
          
      setConversations(conversationsData);
        } catch (error) {
          console.error('Erro ao carregar conversas:', error);
          // Sem fallback - apenas API
        }
      }
    };

    loadConversations();
  }, [isAuthenticated, user, chistaApiToken]);


  // Gerar título automático para conversa
  const generateConversationTitle = (firstMessage) => {
    const words = firstMessage.split(' ').slice(0, 6);
    return words.join(' ') + (firstMessage.split(' ').length > 6 ? '...' : '');
  };

  // Criar nova conversa
  const createNewConversation = async () => {
    try {
      const newConversationData = await createConversation(user.sub, chistaApiToken, 'Nova Conversa');
      
      const newConversation = {
        ...newConversationData,
        messages: []
      };
      
      setConversations(prev => [newConversation, ...prev]);
      setCurrentConversationId(newConversation.id);
      setMessages([]);
      setSidebarOpen(false);
    } catch (error) {
      console.error('Erro ao criar conversa:', error);
      // Fallback: criar conversa local
      const newConversation = {
        id: Date.now().toString(),
        title: 'Nova Conversa',
        messages: [],
        createdAt: new Date()
      };
      setConversations(prev => [newConversation, ...prev]);
      setCurrentConversationId(newConversation.id);
      setMessages([]);
      setSidebarOpen(false);
    }
  };

  // Carregar conversa existente
  const loadConversation = async (conversationId) => {
    try {
      const messagesData = await getConversationMessages(conversationId, chistaApiToken);
      
      setMessages(messagesData);
      setCurrentConversationId(conversationId);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      // Fallback: usar dados locais
      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation) {
        setMessages(conversation.messages);
        setCurrentConversationId(conversationId);
      }
    }
    setSidebarOpen(false);
  };

  // Deletar conversa
  const deleteConversation = async (conversationId) => {
    try {
      await deleteConversationApi(conversationId, chistaApiToken);
      
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      if (currentConversationId === conversationId) {
        setCurrentConversationId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Erro ao deletar conversa:', error);
      // Fallback: deletar localmente
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      if (currentConversationId === conversationId) {
        setCurrentConversationId(null);
        setMessages([]);
      }
    }
  };

  // Atualizar título da conversa quando receber primeira resposta
  const updateConversationTitle = async (conversationId, firstUserMessage) => {
    if (firstUserMessage) {
      const newTitle = generateConversationTitle(firstUserMessage);
      
      try {
        await updateConversation(conversationId, newTitle, chistaApiToken);
        
        setConversations(prev => 
          prev.map(c => 
            c.id === conversationId 
              ? { ...c, title: newTitle, updatedAt: new Date() }
              : c
          )
        );
      } catch (error) {
        console.error('Erro ao atualizar título da conversa:', error);
        // Fallback: atualizar localmente
        setConversations(prev => 
          prev.map(c => 
            c.id === conversationId 
              ? { ...c, title: newTitle, updatedAt: new Date() }
              : c
          )
        );
      }
    }
  };

  // Mensagem de boas-vindas inicial
  useEffect(() => {
    if (isAuthenticated && messages.length === 0 && !currentConversationId) {
      const welcomeMessage = {
        id: 'welcome',
        role: 'assistant',
        content: 'Olá! Sou a Chista, sua assistente especializada em análise de interações com clientes. Como posso ajudá-lo hoje?',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isAuthenticated, messages.length, currentConversationId]);

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

             // Criar nova conversa se não houver uma ativa
             let conversationId = currentConversationId;
             if (!conversationId) {
               try {
                 const newConversationData = await createConversation(user.sub, chistaApiToken, 'Nova Conversa');
        
      const newConversation = {
        ...newConversationData,
        messages: []
      };
        
        setConversations(prev => [newConversation, ...prev]);
        conversationId = newConversation.id;
        setCurrentConversationId(conversationId);
      } catch (error) {
        console.error('Erro ao criar conversa:', error);
        // Fallback: criar conversa local
        const newConversation = {
          id: Date.now().toString(),
          title: 'Nova Conversa',
          messages: [],
          createdAt: new Date()
        };
        setConversations(prev => [newConversation, ...prev]);
        conversationId = newConversation.id;
        setCurrentConversationId(conversationId);
      }
    }

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    // Adiciona mensagem do usuário
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoadingResponse(true);

    // Atualizar conversa com mensagem do usuário
    setConversations(prev => 
      prev.map(c => 
        c.id === conversationId 
          ? { ...c, messages: newMessages }
          : c
      )
    );

             try {
               // Chama a API para obter resposta
               const data = await sendChatMessage(
        userMessage.content,
        user?.sub || user?.id,
        chistaApiToken,
        conversationId
      );
      
      // Adiciona resposta da API
      const botMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.response || data.message || "Desculpe, não consegui processar sua mensagem.",
        timestamp: new Date()
      };

      const finalMessages = [...newMessages, botMessage];
      setMessages(finalMessages);

      // Atualizar conversa com resposta do bot
      setConversations(prev => 
        prev.map(c => 
          c.id === conversationId 
            ? { ...c, messages: finalMessages }
            : c
        )
      );

      // Atualizar título da conversa na primeira interação
      if (newMessages.length === 1) {
        updateConversationTitle(conversationId, userMessage.content);
      }

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      // Adiciona mensagem de erro
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.",
        timestamp: new Date()
      };
      
      const finalMessages = [...newMessages, errorMessage];
      setMessages(finalMessages);

      // Atualizar conversa com mensagem de erro
      setConversations(prev => 
        prev.map(c => 
          c.id === conversationId 
            ? { ...c, messages: finalMessages }
            : c
        )
      );
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Chat com Chista AI</h1>
            <p className="text-gray-600">
              Faça perguntas e obtenha respostas inteligentes
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={createNewConversation}
              className="flex items-center space-x-2 px-4 py-2 bg-[#174A8B] text-white rounded-lg hover:bg-blue-900 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Conversa</span>
            </button>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <Menu className="w-4 h-4" />
              <span>Histórico</span>
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar - Histórico de Conversas */}
          <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block w-80 flex-shrink-0`}>
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Conversas
              </h3>
              
              {conversations.length === 0 ? (
                <p className="text-gray-500 text-sm">Nenhuma conversa ainda</p>
              ) : (
                <div className="space-y-2">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors group ${
                        currentConversationId === conversation.id
                          ? 'bg-[#174A8B] text-white'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                      onClick={() => loadConversation(conversation.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${
                            currentConversationId === conversation.id ? 'text-white' : 'text-gray-900'
                          }`}>
                            {conversation.title}
                          </p>
                          <p className={`text-xs mt-1 ${
                            currentConversationId === conversation.id ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {conversation.created_at 
                              ? new Date(conversation.created_at).toLocaleDateString('pt-BR')
                              : 'Data não disponível'
                            }
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConversation(conversation.id);
                          }}
                          className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded ${
                            currentConversationId === conversation.id 
                              ? 'hover:bg-blue-800' 
                              : 'hover:bg-gray-200'
                          }`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chat Container */}
          <div className="flex-1 bg-white rounded-lg shadow-sm border h-[70vh] flex flex-col">
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
                    <div className="text-sm prose prose-sm max-w-none prose-invert">
                      <ReactMarkdown 
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                          li: ({ children }) => <li className="text-sm">{children}</li>,
                          strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                          em: ({ children }) => <em className="italic">{children}</em>,
                          code: ({ children }) => <code className="bg-gray-700 text-gray-200 px-1 py-0.5 rounded text-xs">{children}</code>,
                          pre: ({ children }) => <pre className="bg-gray-800 text-gray-200 p-3 rounded-lg overflow-x-auto text-xs mb-2">{children}</pre>,
                          h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
                          blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-500 pl-3 italic text-gray-300 mb-2">{children}</blockquote>
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                    <div className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString()}
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
                      <span className="text-sm">Chista AI está pensando...</span>
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
              Pressione Enter para enviar
            </p>
          </div>
        </div>
        </div>
      </div>

      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default ChatPage;