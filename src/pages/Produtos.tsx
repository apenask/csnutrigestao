import React from 'react';
import { useStore } from '../context/StoreContext';
import ProductList from './ProductList';
import ProductForm from './ProductForm';
import { Plus } from 'lucide-react';

export default function Products() {
  const [showForm, setShowForm] = React.useState(false);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Produto
        </button>
      </div>

      {showForm && (
        <div className="mb-6">
          <ProductForm onClose={() => setShowForm(false)} />
        </div>
      )}

      <ProductList />
    </div>
  );
}