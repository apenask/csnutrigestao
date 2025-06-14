import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Package, ShoppingCart, TrendingUp, DollarSign, Settings, LogOut, User } from 'lucide-react';
import { useAuth } from '../context';
import { ThemeToggle } from './ThemeToggle';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  const navigation = [
    { name: 'Dashboard', href: '/', icon: TrendingUp },
    { name: 'Produtos', href: '/products', icon: Package },
    { name: 'Vendas', href: '/sales', icon: ShoppingCart },
    { name: 'Fluxo de Caixa', href: '/cash-flow', icon: DollarSign },
    { name: 'Configurações', href: '/settings', icon: Settings },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Package className="h-8 w-8 text-red-600" />
              <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">
                CS Nutrição
              </span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'border-red-500 text-gray-900 dark:text-white'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Toggle de Tema */}
            <ThemeToggle size="sm" variant="switch" />
            
            {/* Informações do Usuário */}
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <User className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">{user?.email}</span>
            </div>
            
            {/* Botão de Logout */}
            <button
              onClick={handleSignOut}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Menu Mobile */}
      <div className="sm:hidden">
        <div className="pt-2 pb-3 space-y-1 bg-gray-50 dark:bg-gray-800">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors ${
                  isActive
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <item.icon className="h-4 w-4 mr-3" />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}