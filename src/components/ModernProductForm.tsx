import React, { useState, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';
import { 
  X, 
  Upload, 
  Link, 
  Package, 
  DollarSign, 
  Hash, 
  Tag,
  Image as ImageIcon,
  Check,
  AlertCircle
} from 'lucide-react';

interface ModernProductFormProps {
  product?: Product;
  isOpen: boolean;
  onClose: () => void;
}

export function ModernProductForm({ product, isOpen, onClose }: ModernProductFormProps) {
  const { addProduct, updateProduct } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    name: product?.name || '',
    price: product?.price?.toString() || '',
    installmentPrice: product?.installmentPrice?.toString() || '',
    category: product?.category || '',
    stock: product?.stock?.toString() || '',
    imageUrl: product?.image || ''
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(product?.image || '');
  const [activeTab, setActiveTab] = useState<'link' | 'upload'>('link');
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      installmentPrice: '',
      category: '',
      stock: '',
      imageUrl: ''
    });
    setImageFile(null);
    setImagePreview('');
    setActiveTab('link');
    setErrors({});
    setShowSuccess(false);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Preço deve ser maior que zero';
    }
    
    if (!formData.category.trim()) {
      newErrors.category = 'Categoria é obrigatória';
    }
    
    if (!formData.stock || parseInt(formData.stock) < 0) {
      newErrors.stock = 'Estoque deve ser um número válido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUrlChange = (url: string) => {
    setFormData(prev => ({ ...prev, imageUrl: url }));
    setImagePreview(url);
    setImageFile(null);
  };

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setFormData(prev => ({ ...prev, imageUrl: '' }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const productData = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        installmentPrice: formData.installmentPrice ? parseFloat(formData.installmentPrice) : undefined,
        category: formData.category.trim(),
        stock: parseInt(formData.stock),
        image: activeTab === 'link' ? formData.imageUrl : undefined,
      };

      if (product) {
        await updateProduct({ 
          ...productData, 
          id: product.id, 
          sku_number: product.sku_number 
        }, imageFile);
      } else {
        await addProduct(productData, imageFile);
      }
      
      setShowSuccess(true);
      setTimeout(() => {
        onClose();
        resetForm();
      }, 1500);
      
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      setErrors({ submit: 'Erro ao salvar produto. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div 
        className="modal-content animate-slide-up" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '56rem' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {product ? 'Editar Produto' : 'Novo Produto'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="m-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg animate-scale-in">
            <div className="flex items-center">
              <Check size={20} className="text-green-600 dark:text-green-400 mr-2" />
              <span className="text-green-800 dark:text-green-200 font-medium">
                Produto salvo com sucesso!
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Coluna Esquerda - Informações Básicas */}
            <div className="space-y-6">
              <div className="form-section">
                <h4 className="form-section-title">
                  <Package size={20} className="inline mr-2" />
                  Informações Básicas
                </h4>
                
                <div className="form-grid">
                  {/* Nome do Produto */}
                  <div className="form-grid-full">
                    <div className="input-group">
                      <label className="input-label">Nome do Produto *</label>
                      <div className="relative">
                        <Package size={18} className="input-icon" />
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Ex: Whey Protein 900g"
                          className={`input-modern input-with-icon ${errors.name ? 'input-error animate-shake' : ''}`}
                        />
                      </div>
                      {errors.name && (
                        <span className="validation-message validation-error">
                          <AlertCircle size={14} className="inline mr-1" />
                          {errors.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Categoria */}
                  <div className="form-grid-full">
                    <div className="input-group">
                      <label className="input-label">Categoria *</label>
                      <div className="relative">
                        <Tag size={18} className="input-icon" />
                        <input
                          type="text"
                          value={formData.category}
                          onChange={(e) => handleInputChange('category', e.target.value)}
                          placeholder="Ex: Proteínas"
                          className={`input-modern input-with-icon ${errors.category ? 'input-error animate-shake' : ''}`}
                        />
                      </div>
                      {errors.category && (
                        <span className="validation-message validation-error">
                          <AlertCircle size={14} className="inline mr-1" />
                          {errors.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Preços */}
                  <div>
                    <div className="input-group">
                      <label className="input-label">Preço à Vista *</label>
                      <div className="relative">
                        <DollarSign size={18} className="input-icon" />
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.price}
                          onChange={(e) => handleInputChange('price', e.target.value)}
                          placeholder="0,00"
                          className={`input-modern input-with-icon ${errors.price ? 'input-error animate-shake' : ''}`}
                        />
                      </div>
                      {errors.price && (
                        <span className="validation-message validation-error">
                          <AlertCircle size={14} className="inline mr-1" />
                          {errors.price}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="input-group">
                      <label className="input-label">Preço a Prazo</label>
                      <div className="relative">
                        <DollarSign size={18} className="input-icon" />
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.installmentPrice}
                          onChange={(e) => handleInputChange('installmentPrice', e.target.value)}
                          placeholder="Opcional"
                          className="input-modern input-with-icon"
                        />
                      </div>
                      <span className="validation-message" style={{ color: 'var(--text-muted)' }}>
                        Preço para pagamento parcelado
                      </span>
                    </div>
                  </div>

                  {/* Estoque */}
                  <div className="form-grid-full">
                    <div className="input-group">
                      <label className="input-label">Estoque *</label>
                      <div className="relative">
                        <Hash size={18} className="input-icon" />
                        <input
                          type="number"
                          min="0"
                          value={formData.stock}
                          onChange={(e) => handleInputChange('stock', e.target.value)}
                          placeholder="0"
                          className={`input-modern input-with-icon ${errors.stock ? 'input-error animate-shake' : ''}`}
                        />
                      </div>
                      {errors.stock && (
                        <span className="validation-message validation-error">
                          <AlertCircle size={14} className="inline mr-1" />
                          {errors.stock}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna Direita - Imagem */}
            <div className="space-y-6">
              <div className="form-section">
                <h4 className="form-section-title">
                  <ImageIcon size={20} className="inline mr-2" />
                  Imagem do Produto
                </h4>

                {/* Tabs */}
                <div className="tab-list mb-6">
                  <button
                    type="button"
                    onClick={() => setActiveTab('link')}
                    className={`tab-button ${activeTab === 'link' ? 'active' : ''}`}
                  >
                    <Link size={16} />
                    URL da Imagem
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('upload')}
                    className={`tab-button ${activeTab === 'upload' ? 'active' : ''}`}
                  >
                    <Upload size={16} />
                    Upload de Arquivo
                  </button>
                </div>

                {/* Conteúdo da Tab */}
                {activeTab === 'link' ? (
                  <div className="input-group">
                    <label className="input-label">URL da Imagem</label>
                    <div className="relative">
                      <Link size={18} className="input-icon" />
                      <input
                        type="url"
                        value={formData.imageUrl}
                        onChange={(e) => handleImageUrlChange(e.target.value)}
                        placeholder="https://exemplo.com/imagem.jpg"
                        className="input-modern input-with-icon"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                      className="hidden"
                    />
                    
                    <div
                      className={`file-upload-area ${dragActive ? 'dragging' : ''}`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={32} className="mx-auto mb-3 text-gray-400" />
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Clique para selecionar ou arraste uma imagem
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF até 10MB
                      </p>
                    </div>
                  </div>
                )}

                {/* Preview da Imagem */}
                {imagePreview && (
                  <div className="mt-6 animate-fade-in">
                    <label className="input-label">Pré-visualização</label>
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="image-preview mx-auto"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview('');
                          setImageFile(null);
                          setFormData(prev => ({ ...prev, imageUrl: '' }));
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer com Botões */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-8">
            {errors.submit && (
              <div className="w-full p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle size={16} className="text-red-600 dark:text-red-400 mr-2" />
                  <span className="text-red-800 dark:text-red-200 text-sm">
                    {errors.submit}
                  </span>
                </div>
              </div>
            )}
            
            <div className="flex gap-3 sm:ml-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="btn-base btn-secondary flex-1 sm:flex-none"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-base btn-primary flex-1 sm:flex-none"
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    {product ? 'Atualizar' : 'Adicionar'} Produto
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}