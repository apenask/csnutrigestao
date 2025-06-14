import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { Settings as SettingsIcon, User, Store } from 'lucide-react';

export default function Settings() {
  const { state, updateConfig } = useStore();
  const { user } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Configurações</h1>

      <div className="space-y-6">
        {/* Informações do Usuário */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <User className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Informações do Usuário</h3>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Email:</span> {user?.email}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">ID:</span> {user?.id}
            </p>
          </div>
        </div>

        {/* Configurações da Loja */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Store className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Configurações da Loja</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="storeName" className="block text-sm font-medium text-gray-700">
                Nome da Loja
              </label>
              <input
                type="text"
                id="storeName"
                value={state.config.name}
                onChange={(e) => updateConfig({ name: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="CS Nutrição"
              />
            </div>
          </div>
        </div>

        {/* Tema */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <SettingsIcon className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Aparência</h3>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tema</label>
            <select
              value={state.config.theme}
              onChange={(e) => updateConfig({ theme: e.target.value as 'light' | 'dark' })}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
            >
              <option value="light">Claro</option>
              <option value="dark">Escuro</option>
            </select>
          </div>
        </div>

        {/* Informações do Sistema */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Informações do Sistema</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">{state.products.length}</p>
              <p className="text-sm text-gray-500">Produtos</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{state.sales.length}</p>
              <p className="text-sm text-gray-500">Vendas</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{state.cashFlow.length}</p>
              <p className="text-sm text-gray-500">Lançamentos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}