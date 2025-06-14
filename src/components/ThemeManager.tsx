// src/components/ThemeManager.tsx - VERSÃO CORRIGIDA SEM WARNINGS

import { useEffect } from 'react';
import { useStore } from '../context/StoreContext';

interface ThemeManagerProps {
  children: React.ReactNode;
}

export function ThemeManager({ children }: ThemeManagerProps) {
  const { state } = useStore();

  useEffect(() => {
    // Aplicar tema ao documentElement
    document.documentElement.setAttribute('data-theme', state.config.theme);
    document.documentElement.className = state.config.theme;
    
    // Aplicar classe ao body também para compatibilidade
    document.body.className = state.config.theme;
    
    // Aplicar meta theme-color para mobile
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }
    
    metaThemeColor.setAttribute('content', 
      state.config.theme === 'dark' ? '#1e293b' : '#ffffff'
    );

    // Aplicar cor de fundo ao body para evitar flash
    document.body.style.backgroundColor = state.config.theme === 'dark' ? '#0f172a' : '#ffffff';
    document.body.style.color = state.config.theme === 'dark' ? '#f8fafc' : '#1e293b';
    
  }, [state.config.theme]);

  return <>{children}</>;
}