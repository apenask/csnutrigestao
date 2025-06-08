import React from 'react';
import { Home, ShoppingCart, DollarSign, FileText, Package, Settings, Menu, X, LogOut } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
  onLogout: () => void;
}

export function Layout({ children, currentPage, onPageChange, onLogout }: LayoutProps) {
  const { state } = useStore();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'pdv', label: 'PDV', icon: ShoppingCart },
    { id: 'caixa', label: 'Caixa', icon: DollarSign },
    { id: 'vendas', label: 'Vendas', icon: FileText },
    { id: 'produtos', label: 'Produtos', icon: Package },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      {/* ========================================================== */}
      {/* CÓDIGO CORRIGIDO ABAIXO */}
      {/* ========================================================== */}
      <div className={`lg:hidden fixed top-4 left-4 z-50 transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg card hover-lift"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-full flex flex-col card relative" style={{ backgroundColor: 'var(--bg-primary)' }}>
          
          <div className="lg:hidden absolute top-4 right-4 z-50">
             <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-opacity-50"
              >
                <X size={24} style={{color: 'var(--text-secondary)'}}/>
              </button>
          </div>
          
          <div className="p-4 h-24 flex items-center gap-3">
            {state.config.logo && (
              <img 
                src={state.config.logo} 
                alt="Logo CS Nutri" 
                className="h-10 w-10 object-contain"
              />
            )}
            <div className="flex flex-col">
              <h1 
                className="text-lg font-bold leading-tight" 
                style={{ color: 'var(--text-primary)' }}
              >
                {state.config.name}
              </h1>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Sistema de Gestão
              </p>
            </div>
          </div>
          
          <nav className="px-4 space-y-2 flex-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onPageChange(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'gradient-bg-red text-white shadow-md'
                      : 'hover:bg-opacity-50 hover-lift'
                  }`}
                  style={{
                    backgroundColor: isActive ? undefined : 'transparent',
                    color: isActive ? 'white' : 'var(--text-secondary)'
                  }}
                >
                  <Icon size={20} className="mr-3" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="p-4 mt-auto">
            <button
              onClick={onLogout}
              className="w-full flex items-center px-4 py-3 rounded-lg transition-all hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/50 dark:hover:text-red-400"
              style={{ color: 'var(--text-muted)' }}
            >
              <LogOut size={20} className="mr-3" />
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="lg:ml-64 min-h-screen">
        <main className="p-4 pt-20 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}