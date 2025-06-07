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
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg card hover-lift"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-full card" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <div className="p-6">
            <div className="flex items-center mb-2">
              {state.config.logo && (
                <div className="w-10 h-10 mr-3 rounded-lg overflow-hidden">
                  <img
                    src={state.config.logo}
                    alt="Logo"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold gradient-bg-red bg-clip-text text-transparent">
                  {state.config.name}
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Sistema de Gestão
                </p>
              </div>
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

          {/* Logout Button */}
          <div className="p-4">
            <button
              onClick={onLogout}
              className="w-full flex items-center px-4 py-3 rounded-lg transition-all hover:bg-red-50 hover:text-red-600"
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
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}