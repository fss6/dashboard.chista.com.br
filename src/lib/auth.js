import { getApiBaseUrl } from './api';

// Cache para o token da API
let cachedToken = null;
let tokenExpiry = null;
const TOKEN_CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Obtém o token da API com cache
 * @param {Object} user - Objeto do usuário do Auth0
 * @returns {string|null} - Token da API ou null
 */
export function getChistaApiToken(user) {
  if (!user) return null;

  // Primeiro tenta a chave fixa do Auth0 (que é sempre https://api.chista.com.br)
  const fixedTokenKey = 'https://api.chista.com.br/auth_token';
  let token = user[fixedTokenKey];
  
  // Se não encontrar, tenta com a URL da variável de ambiente
  if (!token) {
    const apiBaseUrl = getApiBaseUrl();
    const dynamicTokenKey = `${apiBaseUrl}/auth_token`;
    token = user[dynamicTokenKey];
  }
  
  // Token encontrado com sucesso
  
  if (!token) return null;

  // Verifica se o token está em cache e ainda é válido
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  // Atualiza o cache
  cachedToken = token;
  tokenExpiry = Date.now() + TOKEN_CACHE_DURATION;
  
  return token;
}

/**
 * Limpa o cache do token
 */
export function clearTokenCache() {
  cachedToken = null;
  tokenExpiry = null;
}

/**
 * Verifica se o token está em cache e é válido
 * @returns {boolean}
 */
export function isTokenCached() {
  return cachedToken && tokenExpiry && Date.now() < tokenExpiry;
}

/**
 * Hook personalizado para autenticação otimizada
 * @param {Object} auth0 - Objeto do useAuth0
 * @returns {Object} - Dados de autenticação otimizados
 */
export function useOptimizedAuth(auth0) {
  const { user, isAuthenticated, isLoading, error, loginWithRedirect, logout } = auth0;
  
  // Obtém o token com cache
  const chistaApiToken = getChistaApiToken(user);
  
  // Determina se precisa mostrar loading
  const shouldShowLoading = isLoading;
  
  return {
    user,
    isAuthenticated,
    isLoading: shouldShowLoading,
    error,
    loginWithRedirect,
    logout,
    chistaApiToken,
    isTokenCached: isTokenCached()
  };
} 