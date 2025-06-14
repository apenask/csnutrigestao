// src/hooks/useAuth.ts - CRIAR ESTE ARQUIVO

import { useState, useEffect } from 'react';

interface AuthState {
  isAuthenticated: boolean;
  user: { email?: string; loginMethod?: 'code' | 'email' } | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null
  });

  // Verificar se há sessão salva
  useEffect(() => {
    const savedAuth = localStorage.getItem('csnutri-auth');
    if (savedAuth) {
      try {
        const parsed = JSON.parse(savedAuth);
        setAuthState(parsed);
      } catch (error) {
        console.error('Erro ao carregar sessão:', error);
        localStorage.removeItem('csnutri-auth');
      }
    }
  }, []);

  // Salvar estado de autenticação
  const login = (method: 'code' | 'email', email?: string) => {
    const newState = {
      isAuthenticated: true,
      user: { loginMethod: method, email }
    };
    setAuthState(newState);
    localStorage.setItem('csnutri-auth', JSON.stringify(newState));
  };

  const logout = () => {
    setAuthState({ isAuthenticated: false, user: null });
    localStorage.removeItem('csnutri-auth');
  };

  // Função para verificar se a sessão ainda é válida
  const validateSession = () => {
    const savedAuth = localStorage.getItem('csnutri-auth');
    if (!savedAuth) {
      logout();
      return false;
    }
    return true;
  };

  return {
    ...authState,
    login,
    logout,
    validateSession
  };
}