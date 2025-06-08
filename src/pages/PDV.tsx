import { useState, useMemo } from 'react';
import { Plus, Minus, Trash2, ShoppingCart, CreditCard, Banknote, QrCode, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Modal } from '../components/Modal';
import { ConfirmModal } from '../components/ConfirmModal';
import { formatCurrency } from '../utils/dateUtils';
import { generateSaleReceipt } from '../utils/pdfGenerator';
import { Product, Sale } from '../types';

export function PDV() {
  const { state, dispatch } = useStore();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showClearCartModal, setShowClearCartModal] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'pix'>('cash');
  const [cardType, setCardType] = useState<'debit' | 'credit'>('debit');

  const cartTotal = useMemo(() => {
    return state.cart.reduce((sum, item) => {
      let priceToUse = item.product.price;
      if (paymentMethod === 'card' && cardType === 'credit' && item.product.installmentPrice) {
        priceToUse = item.product.installmentPrice;
      }
      return sum + (priceToUse * item.quantity);
    }, 0);
  }, [state.cart, paymentMethod, cardType]);

  const handleAddToCart = (product: Product) => {
    dispatch({ type: 'ADD_TO_CART', payload: product });
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      dispatch({ type: 'REMOVE_FROM_CART', payload: id });
    } else {
      dispatch({ type: 'UPDATE_CART_QUANTITY', payload: { id, quantity } });
    }
  };

  const handleClearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    setShowClearCartModal(false);
  };

  const handleFinalizeSale = () => {
    if (state.cart.length === 0) return;

    const sale: Sale = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      items: state.cart.map(item => {
        let priceToUse = item.product.price;
        if (paymentMethod === 'card' && cardType === 'credit' && item.product.installmentPrice) {
          priceToUse = item.product.installmentPrice;
        }
        return { 
          ...item, 
          product: { ...item.product, price: priceToUse }
        };
      }),
      total: cartTotal,
      paymentMethod,
      cardType: paymentMethod === 'card' ? cardType : undefined,
    };

    dispatch({ type: 'ADD_SALE', payload: sale });
    setLastSale(sale);
    dispatch({ type: 'CLEAR_CART' });
    setShowSuccessModal(true);
  };

  const handleGeneratePDF = async () => {
    if (lastSale) {
      await generateSaleReceipt(lastSale, state.config.name, state.config.logo);
    }
  };

  const handleNewSale = () => {
    setShowSuccessModal(false);
    setLastSale(null);
  };

  const paymentIcons = {
    cash: Banknote,
    card: CreditCard,
    pix: QrCode
  };

  const paymentLabels = {
    cash: 'Dinheiro',
    card: 'Cartão',
    pix: 'PIX'
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          PDV - Ponto de Venda
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Registre suas vendas
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="card rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Produtos
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {state.products.map((product) => (
                <div 
                  key={product.id} 
                  className="card-secondary rounded-lg overflow-hidden hover-lift cursor-pointer"
                  onClick={() => handleAddToCart(product)}
                >
                  <div className="h-32 bg-gray-100 flex items-center justify-center overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <ShoppingCart size={24} />
                        <span className="text-xs mt-1">Sem imagem</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h4 className="font-medium mb-1 text-sm" style={{ color: 'var(--text-primary)' }}>
                      {product.name}
                    </h4>
                    <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                      {product.category}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold" style={{ color: 'var(--accent-red)' }}>
                        {formatCurrency(product.price)}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Est: {product.stock}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <ShoppingCart size={20} className="mr-2" style={{ color: 'var(--accent-red)' }} />
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Carrinho
              </h3>
            </div>
            {state.cart.length > 0 && (
              <button
                onClick={() => setShowClearCartModal(true)}
                className="p-2 rounded-lg hover:bg-red-100 text-red-500"
                title="Limpar carrinho"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {state.cart.length === 0 ? (
            <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
              Carrinho vazio
            </p>
          ) : (
            <div className="space-y-4">
              {state.cart.map((item) => (
                <div key={item.product.id} className="card-secondary rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                      {item.product.name}
                    </h4>
                    <button
                      onClick={() => dispatch({ type: 'REMOVE_FROM_CART', payload: item.product.id })}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <span className="font-bold" style={{ color: 'var(--accent-red)' }}>
                      {formatCurrency(item.product.price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}

              <div className="border-t pt-4" style={{ borderColor: 'var(--border-primary)' }}>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Total:
                  </span>
                  <span className="text-xl font-bold" style={{ color: 'var(--accent-red)' }}>
                    {formatCurrency(cartTotal)}
                  </span>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Forma de Pagamento
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(paymentLabels).map(([method, label]) => {
                      const Icon = paymentIcons[method as keyof typeof paymentIcons];
                      return (
                        <button
                          key={method}
                          onClick={() => setPaymentMethod(method as any)}
                          className={`p-2 rounded-lg border text-xs flex flex-col items-center justify-center transition-all ${
                            paymentMethod === method
                              ? 'btn-red text-white border-transparent'
                              : 'card-secondary hover-lift'
                          }`}
                        >
                          <Icon size={16} className="mb-1" />
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {paymentMethod === 'card' && (
                  <div className="mb-4 p-3 card-secondary rounded-lg animate-fade-in">
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Tipo de Transação
                    </label>
                    <div className="flex rounded-lg bg-gray-200 dark:bg-gray-700 p-1">
                      <button onClick={() => setCardType('debit')} className={`flex-1 text-sm py-1 rounded-md transition-all ${cardType === 'debit' ? 'bg-white dark:bg-gray-500 shadow' : 'text-gray-600 dark:text-gray-300'}`}>Débito</button>
                      <button onClick={() => setCardType('credit')} className={`flex-1 text-sm py-1 rounded-md transition-all ${cardType === 'credit' ? 'bg-white dark:bg-gray-500 shadow' : 'text-gray-600 dark:text-gray-300'}`}>Crédito</button>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleFinalizeSale}
                  className="w-full btn-red py-3 rounded-lg font-semibold hover-lift"
                >
                  Finalizar Venda
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showClearCartModal}
        onClose={() => setShowClearCartModal(false)}
        onConfirm={handleClearCart}
        title="Limpar Carrinho"
        message="Tem certeza que deseja remover todos os itens do carrinho?"
        confirmText="Limpar"
        cancelText="Cancelar"
        type="warning"
      />

      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Venda Registrada com Sucesso!"
        size="md"
      >
        <div className="text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            <ShoppingCart size={32} className="text-green-600 dark:text-green-400" />
          </div>
          
          <div>
            <p className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Venda #{lastSale?.id}
            </p>
            <p className="text-2xl font-bold" style={{ color: 'var(--accent-red)' }}>
              {formatCurrency(lastSale?.total || 0)}
            </p>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleGeneratePDF}
              className="flex-1 btn-success py-3 rounded-lg font-semibold hover-lift"
            >
              Gerar Recibo PDF
            </button>
            <button
              onClick={handleNewSale}
              className="flex-1 btn-red py-3 rounded-lg font-semibold hover-lift"
            >
              Nova Venda
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}