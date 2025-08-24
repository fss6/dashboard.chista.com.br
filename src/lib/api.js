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
 * @returns {Promise<Object>} - Response with token and upload URLs
 */
export async function createAudioBatch(file, description, token) {
  const response = await fetch(buildApiUrl('/batches/audio'), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      batch: {
        description: description,
        entries: [file.name] // Array com o nome do arquivo
      }
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
 * @returns {Promise<Object>} - Complete upload response
 */
export async function uploadFile(file, description, token, onProgress = null) {
  try {
    // Step 1: Create batch and get presigned URL
    const batchResponse = await createAudioBatch(file, description, token);
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
 * @returns {Promise<Object>} - Response with analysis results
 */
export async function uploadText(text, description, token) {
  const response = await fetch(buildApiUrl('/texts'), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: {
        content: text,
        description: description
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao enviar texto: ${response.status} - ${errorText}`);
  }

  return response.json();
} 