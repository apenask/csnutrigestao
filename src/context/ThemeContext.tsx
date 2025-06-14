import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('light');

  // Carregar tema inicial
  useEffect(() => {
    const savedTheme = localStorage.getItem('csnutri-theme') as Theme;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      setThemeState(savedTheme);
    } else {
      // Detectar preferência do sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setThemeState(prefersDark ? 'dark' : 'light');
    }
  }, []); // Array vazio - executa apenas na montagem

  // Aplicar tema quando muda
  useEffect(() => {
    // Remove todas as classes de tema existentes
    document.documentElement.classList.remove('light', 'dark');
    document.body.classList.remove('light', 'dark');
    
    // Remove atributos de tema existentes
    document.documentElement.removeAttribute('data-theme');
    
    // Aplica o novo tema
    document.documentElement.classList.add(theme);
    document.body.classList.add(theme);
    document.documentElement.setAttribute('data-theme', theme);
    
    // Aplicar meta theme-color para dispositivos móveis
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }
    
    // Cores específicas para cada tema
    const themeColors = {
      light: '#ffffff',
      dark: '#0f172a'
    };
    
    metaThemeColor.setAttribute('content', themeColors[theme]);
    
    // Aplicar cor de fundo inicial para evitar flash
    const backgroundColors = {
      light: '#f8fafc',
      dark: '#1e293b'
    };
    
    const textColors = {
      light: '#0f172a',
      dark: '#f8fafc'
    };
    
    document.body.style.backgroundColor = backgroundColors[theme];
    document.body.style.color = textColors[theme];
    
    // Salvar no localStorage
    localStorage.setItem('csnutri-theme', theme);
    
    // Log para debug
    console.log(`Tema aplicado: ${theme}`);
  }, [theme]); // Dependência correta adicionada

  const toggleTheme = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};