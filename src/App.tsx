import React, { useState } from 'react';
import { StoreProvider } from './context/StoreContext';
import { Login } from './pages/Login';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { PDV } from './pages/PDV';
import { Caixa } from './pages/Caixa';
import { Vendas } from './pages/Vendas';
import { Produtos } from './pages/Produtos';
import { Configuracoes } from './pages/Configuracoes';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage('dashboard');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'pdv':
        return <PDV />;
      case 'caixa':
        return <Caixa />;
      case 'vendas':
        return <Vendas />;
      case 'produtos':
        return <Produtos />;
      case 'configuracoes':
        return <Configuracoes />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <StoreProvider>
      {!isAuthenticated ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Layout 
          currentPage={currentPage} 
          onPageChange={setCurrentPage}
          onLogout={handleLogout}
        >
          {renderPage()}
        </Layout>
      )}
    </StoreProvider>
  );
}

export default App;