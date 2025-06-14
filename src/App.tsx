import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';
import { ThemeManager } from './components/ThemeManager';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Signup from './components/Signup';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Sales from './components/Sales';
import CashFlow from './components/CashFlow';
import Settings from './components/Settings';

// Layout para rotas protegidas
function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <StoreProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main>
            <Outlet />
          </main>
        </div>
      </StoreProvider>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <StoreProvider>
          <ThemeManager>
            <Routes>
              {/* Rotas públicas */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Rotas protegidas */}
              <Route element={<ProtectedLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/products" element={<Products />} />
                <Route path="/sales" element={<Sales />} />
                <Route path="/cash-flow" element={<CashFlow />} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              {/* Redireciona rotas não encontradas */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ThemeManager>
        </StoreProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;