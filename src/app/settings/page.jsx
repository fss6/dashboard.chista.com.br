"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import NavMenu from '../../components/NavMenu';
import { Settings, Plus, Edit, Trash2, Tag, Bell, TrendingUp, Zap, Heart } from 'lucide-react';
import { fetchThemes, createTheme, updateTheme, deleteTheme, fetchAlerts, updateAlert } from '../../lib/api';

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading, loginWithRedirect, logout, chistaApiToken } = useAuth();
  const [themes, setThemes] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('themes');
  const [showModal, setShowModal] = useState(false);
  const [editingTheme, setEditingTheme] = useState(null);
  const [editingAlert, setEditingAlert] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    persona: ''
  });
  const [alertFormData, setAlertFormData] = useState({
    indicador: '',
    value: '',
    active: true
  });

  // Carregar dados
  useEffect(() => {
    if (isAuthenticated && chistaApiToken) {
      loadThemes();
      loadAlerts();
    }
  }, [isAuthenticated, chistaApiToken]);

  const loadThemes = async () => {
    try {
      setLoading(true);
      setError(null);
      const themesData = await fetchThemes(chistaApiToken);
      setThemes(themesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAlerts = async () => {
    try {
      const alertsData = await fetchAlerts(chistaApiToken);
      setAlerts(alertsData);
    } catch (err) {
      console.error('Erro ao carregar alertas:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (editingTheme) {
        await updateTheme(editingTheme.id, formData, chistaApiToken);
      } else {
        await createTheme(formData, chistaApiToken);
      }
      
      await loadThemes();
      setShowModal(false);
      setEditingTheme(null);
      setFormData({ name: '', persona: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (theme) => {
    setEditingTheme(theme);
    setFormData({
      name: theme.name,
      persona: theme.persona
    });
    setShowModal(true);
  };

  const handleDelete = async (themeId) => {
    if (!confirm('Tem certeza que deseja deletar este tema?')) return;
    
    try {
      setLoading(true);
      await deleteTheme(themeId, chistaApiToken);
      await loadThemes();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNewTheme = () => {
    setEditingTheme(null);
    setFormData({ name: '', persona: '' });
    setShowModal(true);
  };

  // Funções para Alertas
  const handleAlertSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      await updateAlert(editingAlert.id, alertFormData, chistaApiToken);
      
      await loadAlerts();
      setShowModal(false);
      setEditingAlert(null);
      setAlertFormData({ indicador: '', value: '', active: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditAlert = (alert) => {
    setEditingAlert(alert);
    setAlertFormData({
      indicador: alert.indicador,
      value: alert.value.toString(),
      active: alert.active
    });
    setShowModal(true);
  };


  const getIndicatorIcon = (indicador) => {
    switch (indicador) {
      case 'NPS':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'CES':
        return <Zap className="w-4 h-4 text-yellow-500" />;
      case 'CSAT':
        return <Heart className="w-4 h-4 text-red-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Carregando configurações..." subtitle="Preparando área de administração" />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Restrito</h1>
          <p className="text-gray-600 mb-6">Você precisa fazer login para acessar as configurações.</p>
          <button 
            onClick={() => loginWithRedirect()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
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
        currentPage="settings" 
        user={user}
        isAuthenticated={isAuthenticated}
        logout={logout}
      />

      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-8 h-8 text-[#174A8B]" />
            <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
          </div>
          <p className="text-gray-600">Gerencie os temas e configurações do sistema</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Erro</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('themes')}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === 'themes'
                    ? 'border-[#174A8B] text-[#174A8B]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Tag className="w-4 h-4" />
                Temas
              </button>
              <button
                onClick={() => setActiveTab('alerts')}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === 'alerts'
                    ? 'border-[#174A8B] text-[#174A8B]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Bell className="w-4 h-4" />
                Alertas
              </button>
            </nav>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'themes' && (
          <>
            {/* Themes Section */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Tag className="w-5 h-5 text-[#174A8B]" />
              <h2 className="text-lg font-medium text-gray-900">Temas</h2>
            </div>
              <button
                onClick={handleNewTheme}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#174A8B] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#174A8B]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Tema
              </button>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner message="Carregando temas..." />
              </div>
            ) : themes.length === 0 ? (
              <div className="text-center py-8">
                <Tag className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum tema encontrado</h3>
                <p className="mt-1 text-sm text-gray-500">Comece criando seu primeiro tema.</p>
                <div className="mt-6">
                  <button
                    onClick={handleNewTheme}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#174A8B] hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeiro Tema
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid gap-4">
                {themes.map((theme) => (
                  <div key={theme.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{theme.name}</h3>
                        <p className="mt-2 text-sm text-gray-600 line-clamp-3">{theme.persona}</p>
                      </div>
                      <div className="ml-4 flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(theme)}
                          className="p-2 text-gray-400 hover:text-[#174A8B] transition-colors"
                          title="Editar tema"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(theme.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Deletar tema"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
          </>
        )}

        {activeTab === 'alerts' && (
          <>
            {/* Alerts Section */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-[#174A8B]" />
                <h2 className="text-lg font-medium text-gray-900">Alertas</h2>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Explicação sobre alertas */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Bell className="w-5 h-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Como funcionam os alertas</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>Quando ativo, o alerta será disparado quando o valor do indicador for <strong>menor</strong> que o valor definido.</p>
                    <p className="mt-1">Por exemplo: se o alerta de NPS estiver configurado para 7, você será notificado quando o NPS for menor que 7.</p>
                  </div>
                </div>
              </div>
            </div>

            {alerts.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum alerta encontrado</h3>
                <p className="mt-1 text-sm text-gray-500">Os alertas são criados automaticamente pelo sistema.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getIndicatorIcon(alert.indicador)}
                          <h3 className="text-lg font-medium text-gray-900">{alert.indicador}</h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            alert.active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {alert.active ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Valor do alerta: <span className="font-medium">{alert.value}</span>
                        </p>
                      </div>
                      <div className="ml-4 flex items-center gap-2">
                        <button
                          onClick={() => handleEditAlert(alert)}
                          className="p-2 text-gray-400 hover:text-[#174A8B] transition-colors"
                          title="Editar alerta"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
          </>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingAlert ? 'Editar Alerta' : (editingTheme ? 'Editar Tema' : 'Novo Tema')}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingTheme(null);
                    setEditingAlert(null);
                    setFormData({ name: '', persona: '' });
                    setAlertFormData({ indicador: '', value: '', active: true });
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <form id="modal-form" onSubmit={editingAlert ? handleAlertSubmit : handleSubmit}>
                  {editingAlert ? (
                    // Formulário de Alerta
                    <>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Indicador
                        </label>
                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                          {getIndicatorIcon(alertFormData.indicador)}
                          <span className="text-sm font-medium text-gray-900">{alertFormData.indicador}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">O indicador não pode ser alterado</p>
                      </div>
                      <div className="mb-4">
                        <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-2">
                          Valor do Alerta <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          id="value"
                          value={alertFormData.value}
                          onChange={(e) => setAlertFormData({ ...alertFormData, value: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#174A8B] focus:border-transparent"
                          placeholder="Ex: 7"
                          required
                        />
                      </div>
                      <div className="mb-6">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={alertFormData.active}
                            onChange={(e) => setAlertFormData({ ...alertFormData, active: e.target.checked })}
                            className="rounded border-gray-300 text-[#174A8B] focus:ring-[#174A8B]"
                          />
                          <span className="ml-2 text-sm text-gray-700">Alerta ativo</span>
                        </label>
                      </div>
                    </>
                  ) : (
                    // Formulário de Tema
                    <>
                      <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                          Nome do Tema
                        </label>
                        <input
                          type="text"
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#174A8B] focus:border-transparent"
                          placeholder="Ex: Atendimento ao Cliente"
                          required
                        />
                      </div>
                      <div className="mb-6">
                        <label htmlFor="persona" className="block text-sm font-medium text-gray-700 mb-2">
                          Persona da IA
                        </label>
                        <textarea
                          id="persona"
                          value={formData.persona}
                          onChange={(e) => setFormData({ ...formData, persona: e.target.value })}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#174A8B] focus:border-transparent"
                          placeholder="Descreva como a IA deve se comportar para este tema..."
                          required
                        />
                      </div>
                    </>
                  )}
                </form>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingTheme(null);
                    setEditingAlert(null);
                    setFormData({ name: '', persona: '' });
                    setAlertFormData({ indicador: '', value: '', active: true });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  form="modal-form"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#174A8B] hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : (editingAlert || editingTheme) ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



