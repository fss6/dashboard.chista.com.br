import { useState, useEffect } from 'react';

// Cache para requisições da API
const apiCache = new Map();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutos

/**
 * Get the API base URL from environment variables
 * @returns {string} - Base URL for the API
 */
export function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_CHISTA_API_BASE_URL || 'http://localhost:3001';
}

/**
 * Build API endpoint URL
 * @param {string} endpoint - API endpoint path
 * @returns {string} - Complete API URL
 */
export function buildApiUrl(endpoint) {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
}

/**
 * Fetch insights from API
 * @param {string} token - Authorization token
 * @returns {Promise<Array>} - List of insights
 */
export async function fetchInsights(token) {
  return fetchWithCache(buildApiUrl('/insights'), token);
}

/**
 * Fetch specific insight by ID
 * @param {string} insightId - Insight ID
 * @param {string} token - Authorization token
 * @returns {Promise<Object>} - Insight details
 */
export async function fetchInsightById(insightId, token) {
  return fetchWithCache(buildApiUrl(`/insights/${insightId}`), token);
}

export async function fetchInsightFileUrl(insightId, token) {
  return fetchWithCache(buildApiUrl(`/insights/${insightId}/file_url`), token);
}

/**
 * Create audio batch and get presigned upload URL
 * @param {File} file - File to upload
 * @param {string} description - Description of the audio content
 * @param {string} token - Authorization token
 * @param {number} themeId - Optional theme ID
 * @returns {Promise<Object>} - Response with token and upload URLs
 */
export async function createAudioBatch(file, description, token, themeId = null) {
  const batchData = {
    description: description,
    entries: [file.name] // Array com o nome do arquivo
  };

  // Add theme_id if provided
  if (themeId) {
    batchData.theme_id = themeId;
  }

  const response = await fetch(buildApiUrl('/batches/audio'), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      batch: batchData
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao criar batch: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Upload file directly to S3 using presigned URL
 * @param {string} presignedUrl - Presigned URL from S3
 * @param {File} file - File to upload
 * @param {Function} onProgress - Optional progress callback
 * @returns {Promise<Response>} - Upload response
 */
export async function uploadFileToS3(presignedUrl, file, onProgress = null) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    // Track upload progress
    if (onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress(percentComplete);
        }
      });
    }

    xhr.onload = function() {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr);
      } else {
        reject(new Error(`Erro no upload: ${xhr.status} - ${xhr.statusText}`));
      }
    };

    xhr.onerror = function() {
      reject(new Error('Erro de rede durante upload'));
    };

    xhr.open('PUT', presignedUrl);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.send(file);
  });
}

/**
 * Complete the batch after successful upload
 * @param {string} batchToken - Token of the batch to complete
 * @param {string} token - Authorization token
 * @param {Object} uploadStats - Optional upload statistics
 * @returns {Promise<Object>} - Completion response
 */
export async function completeBatch(batchToken, token, uploadStats = null) {
  const body = uploadStats ? { upload_stats: uploadStats } : {};
  
  const response = await fetch(buildApiUrl(`/batches/${batchToken}/complete`), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao completar batch: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Complete upload process with presigned URL flow
 * @param {File} file - File to upload
 * @param {string} description - Description of the audio content
 * @param {string} token - Authorization token
 * @param {Function} onProgress - Optional progress callback
 * @param {number} themeId - Optional theme ID
 * @returns {Promise<Object>} - Complete upload response
 */
export async function uploadFile(file, description, token, onProgress = null, themeId = null) {
  try {
    // Step 1: Create batch and get presigned URL
    const batchResponse = await createAudioBatch(file, description, token, themeId);
    const { token: batchToken, uploads } = batchResponse;
    
    if (!uploads || uploads.length === 0) {
      throw new Error('Nenhuma URL de upload recebida');
    }

    const uploadEntry = uploads[0]; // First (and only) file upload entry
    const uploadUrl = uploadEntry?.url || uploadEntry;
    
    // Validate presigned URL
    if (!uploadUrl || typeof uploadUrl !== 'string') {
      throw new Error('URL de upload inválida recebida');
    }
    
    // Step 2: Upload file directly to S3
    const uploadStart = Date.now();
    await uploadFileToS3(uploadUrl, file, onProgress);
    const uploadEnd = Date.now();
    
    // Step 3: Complete the batch
    const uploadStats = {
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
      upload_duration_ms: uploadEnd - uploadStart,
      upload_completed_at: new Date().toISOString()
    };
    
    const completeResponse = await completeBatch(batchToken, token, uploadStats);
    
    return {
      batch_token: batchToken,
      ...completeResponse
    };
    
  } catch (error) {
    throw error;
  }
}

/**
 * Faz uma requisição à API com cache
 * @param {string} url - URL da requisição
 * @param {string} token - Token de autenticação
 * @param {Object} options - Opções adicionais
 * @returns {Promise<Object>} - Dados da resposta
 */
export async function fetchWithCache(url, token, options = {}) {
  const cacheKey = `${url}_${token}`;
  const now = Date.now();
  
  // Verifica se há cache válido
  const cached = apiCache.get(cacheKey);
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    const data = await response.json();
    
    // Salva no cache
    apiCache.set(cacheKey, {
      data,
      timestamp: now
    });

    return data;
  } catch (error) {
    // Remove cache em caso de erro
    apiCache.delete(cacheKey);
    throw error;
  }
}

/**
 * Limpa o cache da API
 */
export function clearApiCache() {
  apiCache.clear();
}

/**
 * Limpa cache específico por URL
 * @param {string} url - URL para limpar cache
 */
export function clearCacheForUrl(url) {
  for (const [key] of apiCache) {
    if (key.startsWith(url)) {
      apiCache.delete(key);
    }
  }
}

/**
 * Hook para fazer requisições com cache e estado de loading
 * @param {string} url - URL da requisição
 * @param {string} token - Token de autenticação
 * @param {Object} options - Opções adicionais
 * @returns {Object} - Estado da requisição { data, loading, error, refetch }
 */
export function useApiRequest(url, token, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    if (!url || !token) return;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchWithCache(url, token, options);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [url, token]);

  const refetch = () => {
    fetchData();
  };

  return { data, loading, error, refetch };
}

/**
 * Hook para gerenciar estado de carregamento de dados
 * @param {boolean} authLoading - Se a autenticação está carregando
 * @param {boolean} dataLoading - Se os dados estão carregando
 * @param {boolean} hasData - Se há dados carregados
 * @param {boolean} hasError - Se há erro
 * @returns {Object} - Estado de loading otimizado
 */
export function useLoadingState(authLoading, dataLoading, hasData, hasError) {
  const shouldShowLoading = authLoading || dataLoading || (!hasData && !hasError);
  
  const getLoadingMessage = () => {
    if (authLoading) return "Carregando...";
    if (dataLoading) return "Carregando dados...";
    return "Inicializando...";
  };

  const getLoadingSubtitle = () => {
    if (authLoading) return "Aguarde enquanto inicializamos";
    if (dataLoading) return "Buscando informações";
    return "Preparando aplicação";
  };

  return {
    shouldShowLoading,
    message: getLoadingMessage(),
    subtitle: getLoadingSubtitle()
  };
}

/**
 * Upload text for analysis
 * @param {string} text - Text content to analyze
 * @param {string} description - Description of the text
 * @param {string} token - Authorization token
 * @param {number} themeId - Optional theme ID
 * @returns {Promise<Object>} - Response with analysis results
 */
export async function uploadText(text, description, token, themeId = null) {
  const textData = {
    content: text,
    description: description
  };

  // Add theme_id if provided
  if (themeId) {
    textData.theme_id = themeId;
  }

  const response = await fetch(buildApiUrl('/texts'), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: textData
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao enviar texto: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Send message to chat API
 * @param {string} message - Message content
 * @param {string} userId - User ID
 * @param {string} token - Authorization token
 * @param {string} conversationId - Optional conversation ID
 * @returns {Promise<Object>} - Response with chat answer
 */
export async function sendChatMessage(message, userId, token, conversationId = null) {
  const response = await fetch(buildApiUrl('/chat'), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: message,
      user_id: userId,
      account_id: userId, // Tentativa de usar o mesmo valor para account_id
      conversation_id: conversationId
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro no chat: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Get all conversations for a user
 * @param {string} userId - User ID
 * @param {string} token - Authorization token
 * @returns {Promise<Array>} - List of conversations
 */
export async function getConversations(userId, token) {
  const response = await fetch(buildApiUrl(`/conversations?user_id=${userId}`), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao buscar conversas: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Create a new conversation
 * @param {string} userId - User ID
 * @param {string} token - Authorization token
 * @param {string} title - Conversation title
 * @returns {Promise<Object>} - Created conversation
 */
export async function createConversation(userId, token, title = 'Nova Conversa') {
  const response = await fetch(buildApiUrl('/conversations'), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: userId,
      title: title
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao criar conversa: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Update conversation title
 * @param {string} conversationId - Conversation ID
 * @param {string} title - New title
 * @param {string} token - Authorization token
 * @returns {Promise<Object>} - Updated conversation
 */
export async function updateConversation(conversationId, title, token) {
  const response = await fetch(buildApiUrl(`/conversations/${conversationId}`), {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: title
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao atualizar conversa: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Delete a conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} token - Authorization token
 * @returns {Promise<Object>} - Deletion response
 */
export async function deleteConversation(conversationId, token) {
  const response = await fetch(buildApiUrl(`/conversations/${conversationId}`), {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao deletar conversa: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Get messages from a conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} token - Authorization token
 * @returns {Promise<Array>} - List of messages
 */
export async function getConversationMessages(conversationId, token) {
  const response = await fetch(buildApiUrl(`/conversations/${conversationId}/messages`), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao buscar mensagens: ${response.status} - ${errorText}`);
  }

  return response.json();
}

// ===== THEMES API FUNCTIONS =====

/**
 * Fetch all themes from API
 * @param {string} token - Authorization token
 * @returns {Promise<Array>} - List of themes
 */
export async function fetchThemes(token) {
  const response = await fetch(buildApiUrl('/themes'), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao buscar temas: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Fetch specific theme by ID
 * @param {string} themeId - Theme ID
 * @param {string} token - Authorization token
 * @returns {Promise<Object>} - Theme details
 */
export async function fetchThemeById(themeId, token) {
  const response = await fetch(buildApiUrl(`/themes/${themeId}`), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao buscar tema: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Create a new theme
 * @param {Object} themeData - Theme data (name, persona)
 * @param {string} token - Authorization token
 * @returns {Promise<Object>} - Created theme
 */
export async function createTheme(themeData, token) {
  const response = await fetch(buildApiUrl('/themes'), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      theme: themeData
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao criar tema: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Update an existing theme
 * @param {string} themeId - Theme ID
 * @param {Object} themeData - Updated theme data
 * @param {string} token - Authorization token
 * @returns {Promise<Object>} - Updated theme
 */
export async function updateTheme(themeId, themeData, token) {
  const response = await fetch(buildApiUrl(`/themes/${themeId}`), {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      theme: themeData
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao atualizar tema: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Delete a theme
 * @param {string} themeId - Theme ID
 * @param {string} token - Authorization token
 * @returns {Promise<Object>} - Deletion response
 */
export async function deleteTheme(themeId, token) {
  const response = await fetch(buildApiUrl(`/themes/${themeId}`), {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao deletar tema: ${response.status} - ${errorText}`);
  }

  return response.json();
}

// ===== ALERTS API FUNCTIONS =====

/**
 * Fetch all alerts from API
 * @param {string} token - Authorization token
 * @returns {Promise<Array>} - List of alerts
 */
export async function fetchAlerts(token) {
  const response = await fetch(buildApiUrl('/alerts'), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao buscar alertas: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Fetch specific alert by ID
 * @param {string} alertId - Alert ID
 * @param {string} token - Authorization token
 * @returns {Promise<Object>} - Alert details
 */
export async function fetchAlertById(alertId, token) {
  const response = await fetch(buildApiUrl(`/alerts/${alertId}`), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao buscar alerta: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Create a new alert
 * @param {Object} alertData - Alert data (indicador, value, active)
 * @param {string} token - Authorization token
 * @returns {Promise<Object>} - Created alert
 */
export async function createAlert(alertData, token) {
  const response = await fetch(buildApiUrl('/alerts'), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      alert: alertData
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao criar alerta: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Update an existing alert
 * @param {string} alertId - Alert ID
 * @param {Object} alertData - Updated alert data
 * @param {string} token - Authorization token
 * @returns {Promise<Object>} - Updated alert
 */
export async function updateAlert(alertId, alertData, token) {
  const response = await fetch(buildApiUrl(`/alerts/${alertId}`), {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      alert: alertData
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao atualizar alerta: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Delete an alert
 * @param {string} alertId - Alert ID
 * @param {string} token - Authorization token
 * @returns {Promise<Object>} - Deletion response
 */
export async function deleteAlert(alertId, token) {
  const response = await fetch(buildApiUrl(`/alerts/${alertId}`), {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao deletar alerta: ${response.status} - ${errorText}`);
  }

  return response.json();
} 