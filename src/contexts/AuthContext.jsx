"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useOptimizedAuth, clearTokenCache } from '../lib/auth';
import { clearApiCache } from '../lib/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const auth0 = useAuth0();
  const auth = useOptimizedAuth(auth0);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Marca como inicializado após o primeiro carregamento
    if (!auth.isLoading) {
      setIsInitialized(true);
    }
  }, [auth.isLoading]);

  useEffect(() => {
    // Limpa cache quando o usuário faz logout
    if (!auth.isAuthenticated && isInitialized) {
      clearTokenCache();
      clearApiCache();
    }
  }, [auth.isAuthenticated, isInitialized]);

  const value = {
    ...auth,
    isInitialized,
    // Função para forçar refresh do token
    refreshToken: () => {
      clearTokenCache();
      clearApiCache();
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
} 