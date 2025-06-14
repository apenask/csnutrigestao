import { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { ModernProductForm } from './ModernProductForm';
import { Product } from '../types';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  Search,
  Grid,
  List,
  AlertTriangle,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import { formatCurrency } from '../utils/dateUtils';

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ size: number; className?: string }>;
  trend?: string;
  color?: string;
}

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

interface ProductListItemProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

export default function Products() {
  const { state, deleteProduct } = useStore();
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock' | 'category'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Obter categorias únicas
  const categories = useMemo(() => {
    const cats = [...new Set(state.products.map(p => p.category))];
    return cats.sort();
  }, [state.products]);

  // Filtrar e ordenar produtos
  const filteredAndSortedProducts = useMemo(() => {
    const filtered = state.products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Ordenação
    filtered.sort((a, b) => {
      let aValue: string | number = a[sortBy];
      let bValue: string | number = b[sortBy];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [state.products, searchTerm, selectedCategory, sortBy, sortOrder]);

  // Estatísticas
  const stats = useMemo(() => {
    const total = state.products.length;
    const lowStock = state.products.filter(p => p.stock <= 5).length;
    const outOfStock = state.products.filter(p => p.stock === 0).length;
    const totalValue = state.products.reduce((sum, p) => sum + (p.price * p.stock), 0);
    
    return { total, lowStock, outOfStock, totalValue };
  }, [state.products]);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleDelete = async (productId: string) => {
    try {
      await deleteProduct(productId);
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
    }
  };

  const handleFormClose = () => {
    setShowProductForm(false);
    setEditingProduct(undefined);
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: 'Sem estoque', color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/20' };
    if (stock <= 5) return { label: 'Estoque baixo', color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/20' };
    return { label: 'Em estoque', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/20' };
  };

  const StatsCard = ({ title, value, icon: Icon, trend, color }: StatsCardProps) => (
    <div className="card p-6 hover:shadow-lg transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className={`text-2xl font-bold ${color || 'text-gray-900 dark:text-white'}`}>
            {typeof value === 'number' && title.includes('Valor') ? formatCurrency(value) : value}
          </p>
        </div>
        <div className={`p-3 rounded-full ${color?.includes('red') ? 'bg-red-100 dark:bg-red-900/20' : 
                                             color?.includes('yellow') ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                                             'bg-blue-100 dark:bg-blue-900/20'}`}>
          <Icon size={24} className={color || 'text-blue-600 dark:text-blue-400'} />
        </div>
      </div>
      {trend && (
        <div className="flex items-center mt-2 text-sm">
          <TrendingUp size={16} className="text-green-500 mr-1" />
          <span className="text-green-600 dark:text-green-400">{trend}</span>
        </div>
      )}
    </div>
  );

  const ProductCard = ({ product, onEdit, onDelete }: ProductCardProps) => {
    const stockStatus = getStockStatus(product.stock);
    
    return (
      <div className="card overflow-hidden hover:shadow-xl transition-all duration-300 group">
        <div className="relative h-48 bg-gray-100 dark:bg-gray-800 overflow-hidden">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package size={48} className="text-gray-400" />
            </div>
          )}
          
          {/* Badge de estoque */}
          <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${stockStatus.bg} ${stockStatus.color}`}>
            {stockStatus.label}
          </div>
          
          {/* Menu de ações */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex gap-1">
              <button
                onClick={() => onEdit(product)}
                className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                title="Editar produto"
              >
                <Edit size={16} className="text-blue-600 dark:text-blue-400" />
              </button>
              <button
                onClick={() => onDelete(product.id)}
                className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                title="Excluir produto"
              >
                <Trash2 size={16} className="text-red-600 dark:text-red-400" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {product.category}
          </p>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-red-600 dark:text-red-400">
                {formatCurrency(product.price)}
              </p>
              {product.installmentPrice && (
                <p className="text-xs text-gray-500">
                  ou {formatCurrency(product.installmentPrice)} a prazo
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {product.stock} un.
              </p>
              <p className="text-xs text-gray-500">em estoque</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ProductListItem = ({ product, onEdit, onDelete }: ProductListItemProps) => {
    const stockStatus = getStockStatus(product.stock);
    
    return (
      <div className="card p-4 hover:shadow-md transition-all duration-200">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package size={24} className="text-gray-400" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {product.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {product.category}
            </p>
          </div>
          
          <div className="text-right">
            <p className="font-bold text-red-600 dark:text-red-400">
              {formatCurrency(product.price)}
            </p>
            {product.installmentPrice && (
              <p className="text-xs text-gray-500">
                {formatCurrency(product.installmentPrice)} a prazo
              </p>
            )}
          </div>
          
          <div className="text-center">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${stockStatus.bg} ${stockStatus.color}`}>
              {product.stock} un.
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(product)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Editar produto"
            >
              <Edit size={16} className="text-blue-600 dark:text-blue-400" />
            </button>
            <button
              onClick={() => onDelete(product.id)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Excluir produto"
            >
              <Trash2 size={16} className="text-red-600 dark:text-red-400" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container-fluid py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Produtos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie seu catálogo de produtos
          </p>
        </div>
        <button
          onClick={() => setShowProductForm(true)}
          className="btn-base btn-primary"
        >
          <Plus size={20} />
          Novo Produto
        </button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total de Produtos"
          value={stats.total}
          icon={Package}
          color="text-blue-600 dark:text-blue-400"
        />
        <StatsCard
          title="Estoque Baixo"
          value={stats.lowStock}
          icon={AlertTriangle}
          color="text-yellow-600 dark:text-yellow-400"
        />
        <StatsCard
          title="Sem Estoque"
          value={stats.outOfStock}
          icon={TrendingDown}
          color="text-red-600 dark:text-red-400"
        />
        <StatsCard
          title="Valor Total"
          value={stats.totalValue}
          icon={TrendingUp}
          color="text-green-600 dark:text-green-400"
        />
      </div>

      {/* Filtros e Controles */}
      <div className="card p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Busca */}
          <div className="relative flex-1">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-modern pl-10 w-full"
            />
          </div>
          
          {/* Filtro de Categoria */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-modern lg:w-48"
          >
            <option value="">Todas as categorias</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          
          {/* Ordenação */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field as 'name' | 'price' | 'stock' | 'category');
              setSortOrder(order as 'asc' | 'desc');
            }}
            className="input-modern lg:w-48"
          >
            <option value="name-asc">Nome (A-Z)</option>
            <option value="name-desc">Nome (Z-A)</option>
            <option value="price-asc">Preço (menor)</option>
            <option value="price-desc">Preço (maior)</option>
            <option value="stock-asc">Estoque (menor)</option>
            <option value="stock-desc">Estoque (maior)</option>
          </select>
          
          {/* Modo de Visualização */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white dark:bg-gray-700 shadow-sm' 
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white dark:bg-gray-700 shadow-sm' 
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <List size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Produtos */}
      {filteredAndSortedProducts.length === 0 ? (
        <div className="card p-12 text-center">
          <Package size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Nenhum produto encontrado
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm || selectedCategory 
              ? 'Tente ajustar os filtros de busca'
              : 'Comece adicionando seu primeiro produto'
            }
          </p>
          {!searchTerm && !selectedCategory && (
            <button
              onClick={() => setShowProductForm(true)}
              className="btn-base btn-primary"
            >
              <Plus size={20} />
              Adicionar Produto
            </button>
          )}
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid-responsive' 
            : 'space-y-4'
        }>
          {filteredAndSortedProducts.map(product => (
            viewMode === 'grid' ? (
              <ProductCard 
                key={product.id} 
                product={product} 
                onEdit={handleEdit}
                onDelete={(id) => setShowDeleteConfirm(id)}
              />
            ) : (
              <ProductListItem 
                key={product.id} 
                product={product} 
                onEdit={handleEdit}
                onDelete={(id) => setShowDeleteConfirm(id)}
              />
            )
          ))}
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteConfirm && (
        <div className="modal-overlay animate-fade-in" onClick={() => setShowDeleteConfirm(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 animate-scale-in">
            <div className="flex items-center mb-4">
              <AlertTriangle size={24} className="text-red-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Confirmar Exclusão
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="btn-base btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="btn-base btn-danger flex-1"
              >
                <Trash2 size={16} />
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formulário de Produto */}
      <ModernProductForm
        product={editingProduct}
        isOpen={showProductForm}
        onClose={handleFormClose}
      />
    </div>
  );
}