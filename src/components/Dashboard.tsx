import { useStore } from '../context/StoreContext';
import { Package, ShoppingCart, TrendingUp, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const { state } = useStore();
  
  // Cálculos básicos
  const totalProducts = state.products.length;
  const totalSales = state.sales.length;
  const lowStockProducts = state.products.filter(p => p.stock <= 5).length;
  const totalRevenue = state.sales.reduce((acc, sale) => acc + sale.total, 0);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
      
      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card Produtos */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="bg-blue-500 rounded-md p-3">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Produtos</p>
                <p className="text-2xl font-semibold text-gray-900">{totalProducts}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Card Vendas */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="bg-green-500 rounded-md p-3">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Vendas</p>
                <p className="text-2xl font-semibold text-gray-900">{totalSales}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Card Receita */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="bg-purple-500 rounded-md p-3">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Receita Total</p>
                <p className="text-2xl font-semibold text-gray-900">
                  R$ {totalRevenue.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card Estoque Baixo */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className={`${lowStockProducts > 0 ? 'bg-red-500' : 'bg-gray-500'} rounded-md p-3`}>
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Estoque Baixo</p>
                <p className="text-2xl font-semibold text-gray-900">{lowStockProducts}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de produtos com estoque baixo */}
      {lowStockProducts > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Produtos com Estoque Baixo
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estoque
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {state.products
                  .filter(p => p.stock <= 5)
                  .map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.stock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          product.stock === 0 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {product.stock === 0 ? 'Sem estoque' : 'Estoque baixo'}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}