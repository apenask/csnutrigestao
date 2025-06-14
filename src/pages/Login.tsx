// src/pages/Login.tsx - VERSÃO CORRIGIDA SEM ERRO ESLINT

import React, { useState } from 'react';
import { AlertCircle, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const { state } = useStore();
  const [accessCode, setAccessCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isError, setIsError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState<'code' | 'email'>('code');
  const [isLoading, setIsLoading] = useState(false);

  const SECRET_KEY = 'gestaocsnutriNR@';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsError(false);
    
    try {
      if (authMode === 'code') {
        // Seu sistema atual
        if (accessCode === SECRET_KEY) {
          onLogin();
        } else {
          throw new Error('Código de acesso inválido');
        }
      } else {
        // Novo: Autenticação por e-mail/senha
        if (email === 'admin@csnutri.com' && password === 'admin123') {
          onLogin();
        } else {
          throw new Error('E-mail ou senha incorretos');
        }
      }
    } catch {
      // Removido 'error' para corrigir ESLint
      setIsError(true);
      setAccessCode('');
      setPassword('');
      setTimeout(() => setIsError(false), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="w-full max-w-md">
        <div className="card rounded-2xl p-8 text-center animate-fade-in">
          
          {/* LOGO SECTION */}
          <div className="mb-8 flex flex-col items-center">
            {state.config.logo ? (
              <img 
                src={state.config.logo} 
                alt="Logo CS Nutri" 
                className="h-24 w-auto mb-4" 
              />
            ) : (
              <div className="w-16 h-16 bg-red-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">CS</span>
              </div>
            )}
            <h1 
              className="text-2xl font-bold mb-2" 
              style={{ color: 'var(--text-primary)' }}
            >
              {state.config.name}
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Sistema de Gestão v2.0
            </p>
          </div>

          {/* Seletor de Modo de Autenticação */}
          <div className="mb-6">
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setAuthMode('code')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  authMode === 'code' 
                    ? 'bg-red-500 text-white shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                Código de Acesso
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('email')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  authMode === 'email' 
                    ? 'bg-red-500 text-white shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                E-mail & Senha
              </button>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {authMode === 'code' ? (
              // Modo Código (seu sistema atual)
              <div>
                <div className="relative">
                  <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    placeholder="Digite seu código de acesso"
                    className={`w-full pl-10 pr-4 py-3 rounded-lg input-field text-center transition-all ${
                      isError ? 'border-red-500 animate-shake' : ''
                    }`}
                    autoFocus
                    disabled={isLoading}
                  />
                </div>
              </div>
            ) : (
              // Modo E-mail/Senha (novo)
              <>
                <div>
                  <div className="relative">
                    <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="E-mail"
                      className={`w-full pl-10 pr-4 py-3 rounded-lg input-field transition-all ${
                        isError ? 'border-red-500' : ''
                      }`}
                      autoFocus
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>
                <div>
                  <div className="relative">
                    <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Senha"
                      className={`w-full pl-10 pr-12 py-3 rounded-lg input-field transition-all ${
                        isError ? 'border-red-500' : ''
                      }`}
                      disabled={isLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Mensagem de Erro */}
            {isError && (
              <div className="flex items-center justify-center text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg animate-fade-in">
                <AlertCircle size={16} className="mr-2" />
                {authMode === 'code' ? 'Código de acesso inválido' : 'E-mail ou senha incorretos'}
              </div>
            )}

            {/* Botão de Login */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-red py-3 rounded-lg font-semibold hover-lift transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Entrando...
                </div>
              ) : (
                'Entrar'
              )}
            </button>

            {/* Dica para teste */}
            {authMode === 'email' && (
              <div className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                Para teste: admin@csnutri.com / admin123
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t" style={{ borderColor: 'var(--border-primary)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              CS Nutrição - Sistema de Gestão v2.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}