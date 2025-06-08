import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const { state } = useStore();
  const [accessCode, setAccessCode] = useState('');
  const [isError, setIsError] = useState(false);

  const SECRET_KEY = 'gestaocsnutriNR@';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (accessCode === SECRET_KEY) {
      onLogin();
    } else {
      setIsError(true);
      setAccessCode('');
      setTimeout(() => setIsError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="w-full max-w-md">
        <div className="card rounded-2xl p-8 text-center animate-fade-in">
          
          {/* LOGO SECTION - CÓDIGO MODIFICADO ABAIXO */}
          <div className="mb-8 flex flex-col items-center">
            {state.config.logo ? (
              <img 
                src={state.config.logo} 
                alt="Logo CS Nutri" 
                className="h-24 w-auto mb-4" 
              />
            ) : (
              <h1 
                className="text-3xl font-bold mb-4" 
                style={{ color: 'var(--text-primary)' }}
              >
                {state.config.name}
              </h1>
            )}
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Sistema de Gestão
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="password"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="Digite seu código de acesso"
                className={`w-full px-4 py-3 rounded-lg input-field text-center transition-all ${
                  isError ? 'border-red-500 animate-shake' : ''
                }`}
                autoFocus
              />
              {isError && (
                <div className="flex items-center justify-center mt-2 text-red-500 text-sm">
                  <AlertCircle size={16} className="mr-1" />
                  Código de acesso inválido
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full btn-red py-3 rounded-lg font-semibold hover-lift"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}