import { Moon, Sun } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface ThemeToggleProps {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  variant?: 'switch' | 'button';
}

export function ThemeToggle({ 
  size = 'md', 
  showLabel = false, 
  variant = 'switch' 
}: ThemeToggleProps) {
  const { state, dispatch } = useStore();
  const isDark = state.config.theme === 'dark';

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    dispatch({ 
      type: 'UPDATE_CONFIG', 
      payload: { theme: newTheme } 
    });
  };

  const sizes = {
    sm: { toggle: 'h-5 w-9', thumb: 'h-3 w-3', icon: 16, translate: 'translate-x-4' },
    md: { toggle: 'h-6 w-11', thumb: 'h-4 w-4', icon: 18, translate: 'translate-x-5' },
    lg: { toggle: 'h-7 w-13', thumb: 'h-5 w-5', icon: 20, translate: 'translate-x-6' }
  };

  const currentSize = sizes[size];

  if (variant === 'button') {
    return (
      <button
        onClick={toggleTheme}
        className="btn-base btn-secondary"
        title={`Alternar para modo ${isDark ? 'claro' : 'escuro'}`}
      >
        {isDark ? (
          <Sun size={currentSize.icon} className="text-yellow-500" />
        ) : (
          <Moon size={currentSize.icon} className="text-blue-600" />
        )}
        {showLabel && (
          <span className="ml-2">
            Modo {isDark ? 'Claro' : 'Escuro'}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {showLabel && (
        <div className="flex items-center gap-2">
          <Sun size={currentSize.icon} className="text-yellow-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Tema
          </span>
          <Moon size={currentSize.icon} className="text-blue-600 dark:text-blue-400" />
        </div>
      )}
      
      <button
        onClick={toggleTheme}
        className={`
          relative flex items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500
          ${currentSize.toggle}
          ${isDark 
            ? 'bg-red-600 hover:bg-red-700' 
            : 'bg-gray-300 hover:bg-gray-400'
          }
        `}
        title={`Alternar para modo ${isDark ? 'claro' : 'escuro'}`}
        aria-label={`Alternar para modo ${isDark ? 'claro' : 'escuro'}`}
      >
        <span
          className={`
            flex items-center justify-center transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out
            ${currentSize.thumb}
            ${isDark ? currentSize.translate : 'translate-x-1'}
          `}
        >
          {isDark ? (
            <Moon size={currentSize.icon - 6} className="text-gray-700" />
          ) : (
            <Sun size={currentSize.icon - 6} className="text-yellow-500" />
          )}
        </span>
      </button>
    </div>
  );
}