import React, { useState } from 'react';
import { Plus, Edit, Trash2, Package, Image as ImageIcon, Link, Upload } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Modal } from '../components/Modal';
import { formatCurrency } from '../utils/dateUtils';
import { Product } from '../types';

export function Produtos() {
  const { state, dispatch } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<'link' | 'upload'>('link');
  
  // Form states
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');

  const resetForm = () => {
    setName('');
    setPrice('');
    setCategory('');
    setStock('');
    setImageUrl('');
    setImageFile(null);
    setImagePreview('');
    setEditingProduct(null);
    setActiveTab('link');
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setName(product.name);
      setPrice(product.price.toString());
      setCategory(product.category);
      setStock(product.stock.toString());
      setImageUrl(product.image || '');
      setImagePreview(product.image || '');
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleImageUrlChange = (url: string) => {
    setImageUrl(url);
    if (url) {
      setImagePreview(url);
    } else {
      setImagePreview('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !price || !category.trim() || !stock) return;

    const finalImageUrl = activeTab === 'link' ? imageUrl : imagePreview;

    const productData = {
      id: editingProduct?.id || Date.now().toString(),
      name: name.trim(),
      price: parseFloat(price),
      category: category.trim(),
      stock: parseInt(stock),
      image: finalImageUrl
    };

    if (editingProduct) {
      dispatch({ type: 'UPDATE_PRODUCT', payload: productData });
    } else {
      dispatch({ type: 'ADD_PRODUCT', payload: productData });
    }

    setShowModal(false);
    resetForm();
  };

  const handleDelete = (productId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      dispatch({ type: 'DELETE_PRODUCT', payload: productId });
    }
  };

  const categories = [...new Set(state.products.map(p => p.category))];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Produtos
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Gerencie o catálogo de produtos
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-red px-6 py-3 rounded-lg font-semibold hover-lift flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Novo Produto
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {state.products.map((product) => (
          <div key={product.id} className="card rounded-xl overflow-hidden hover-lift">
            {/* Product Image */}
            <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`flex flex-col items-center justify-center text-gray-400 ${product.image ? 'hidden' : ''}`}>
                <Package size={48} />
                <span className="text-sm mt-2">Sem imagem</span>
              </div>
            </div>

            {/* Product Info */}
            <div className="p-4">
              <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                {product.name}
              </h3>
              <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
                {product.category}
              </p>
              <div className="flex justify-between items-center mb-3">
                <span className="text-lg font-bold" style={{ color: 'var(--accent-red)' }}>
                  {formatCurrency(product.price)}
                </span>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Estoque: {product.stock}
                </span>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleOpenModal(product)}
                  className="flex-1 p-2 rounded-lg card-secondary hover-lift flex items-center justify-center"
                >
                  <Edit size={16} style={{ color: 'var(--accent-red)' }} />
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="flex-1 p-2 rounded-lg card-secondary hover-lift flex items-center justify-center"
                >
                  <Trash2 size={16} className="text-red-500" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Product Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingProduct ? 'Editar Produto' : 'Novo Produto'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Nome do Produto
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Whey Protein 900g"
                  className="w-full px-4 py-2 rounded-lg input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Preço
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0,00"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 rounded-lg input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Categoria
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Ex: Proteínas"
                  list="categories"
                  className="w-full px-4 py-2 rounded-lg input-field"
                  required
                />
                <datalist id="categories">
                  {categories.map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Estoque
                </label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-2 rounded-lg input-field"
                  required
                />
              </div>
            </div>

            {/* Image Section */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Imagem do Produto
                </label>
                
                {/* Tabs */}
                <div className="flex rounded-lg card-secondary p-1 mb-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab('link')}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                      activeTab === 'link' 
                        ? 'btn-red text-white' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <Link size={16} className="inline mr-1" />
                    Via Link
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('upload')}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                      activeTab === 'upload' 
                        ? 'btn-red text-white' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <Upload size={16} className="inline mr-1" />
                    Upload
                  </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'link' ? (
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => handleImageUrlChange(e.target.value)}
                    placeholder="https://exemplo.com/imagem.jpg"
                    className="w-full px-4 py-2 rounded-lg input-field"
                  />
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full px-4 py-2 rounded-lg input-field"
                    />
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      Formatos aceitos: JPG, PNG, GIF
                    </p>
                  </div>
                )}
              </div>

              {/* Image Preview */}
              {imagePreview && (
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Pré-visualização
                  </label>
                  <div className="w-full h-48 rounded-lg overflow-hidden card-secondary">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={() => setImagePreview('')}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="flex-1 px-4 py-2 rounded-lg border hover-lift"
              style={{ borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 btn-red py-2 rounded-lg font-semibold hover-lift"
            >
              {editingProduct ? 'Atualizar' : 'Adicionar'} Produto
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}