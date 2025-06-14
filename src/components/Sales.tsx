import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { Product, CartItem } from '../types';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, DollarSign, Smartphone } from 'lucide-react';

export default function Sales() {
  const { state, addSale, dispatch } = useStore();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'pix'>('cash');
  const [cardType, setCardType] = useState<'debit' | 'credit'>('debit');
  const [cart, setCart] = useState<CartItem[]>([]);

  // Filtrar produtos baseado na busca
  const filteredProducts = state.products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Adicionar produto ao carrinho
  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  // Atualizar quantidade no carrinho
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.product.id !== productId));
    } else {
      setCart(cart.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      ));
    }
  };

  // Remover do carrinho
  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  // Calcular total
  const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  // Finalizar venda
  const finalizeSale = async () => {
    if (cart.length === 0) return;

    const saleData = {
      items: cart,
      total,
      paymentMethod,
      cardType: paymentMethod === 'card' ? cardType : undefined,
      cashier_id: user?.id
    };

    try {
      await addSale(saleData);
      
      // Atualizar estoque
      cart.forEach(item => {
        const product = state.products.find(p => p.id === item.product.id);
        if (product) {
          dispatch({
            type: 'UPDATE_PRODUCT',
            payload: { ...product, stock: product.stock - item.quantity }
          });
        }
      });

      // Limpar carrinho
      setCart([]);
      setShowForm(false);
      setPaymentMethod('cash');
      alert('Venda realizada com sucesso!');
    } catch (error) {
      console.error('Erro ao finalizar venda:', error);
      alert('Erro ao finalizar venda');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Vendas</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Nova Venda
        </button>
      </div>

      {showForm && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Nova Venda</h3>
          
          {/* Busca de produtos */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Lista de produtos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 max-h-64 overflow-y-auto">
            {filteredProducts.map(product => (
              <div key={product.id} className="border rounded-lg p-3 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{product.name}</h4>
                    <p className="text-xs text-gray-500">{product.category}</p>
                    <p className="text-sm font-bold text-green-600">R$ {product.price.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">Estoque: {product.stock}</p>
                  </div>
                  <button
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0}
                    className="ml-2 p-1 bg-green-100 text-green-600 rounded hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Carrinho */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Carrinho</h4>
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Carrinho vazio</p>
            ) : (
              <div className="space-y-2">
                {cart.map(item => (
                  <div key={item.product.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.product.name}</p>
                      <p className="text-xs text-gray-500">R$ {item.product.price.toFixed(2)} cada</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-1 text-gray-600 hover:bg-gray-200 rounded"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="p-1 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded ml-2"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-medium text-sm">R$ {(item.product.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Total e Pagamento */}
          {cart.length > 0 && (
            <div className="border-t mt-4 pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold">Total:</span>
                <span className="text-2xl font-bold text-green-600">R$ {total.toFixed(2)}</span>
              </div>

              {/* Método de Pagamento */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Método de Pagamento</label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`flex-1 p-3 border rounded-lg flex items-center justify-center space-x-2 ${
                      paymentMethod === 'cash' ? 'border-green-500 bg-green-50' : 'border-gray-300'
                    }`}
                  >
                    <DollarSign className="h-4 w-4" />
                    <span>Dinheiro</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`flex-1 p-3 border rounded-lg flex items-center justify-center space-x-2 ${
                      paymentMethod === 'card' ? 'border-green-500 bg-green-50' : 'border-gray-300'
                    }`}
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>Cartão</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('pix')}
                    className={`flex-1 p-3 border rounded-lg flex items-center justify-center space-x-2 ${
                      paymentMethod === 'pix' ? 'border-green-500 bg-green-50' : 'border-gray-300'
                    }`}
                  >
                    <Smartphone className="h-4 w-4" />
                    <span>PIX</span>
                  </button>
                </div>

                {paymentMethod === 'card' && (
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() => setCardType('debit')}
                      className={`flex-1 p-2 border rounded ${
                        cardType === 'debit' ? 'border-green-500 bg-green-50' : 'border-gray-300'
                      }`}
                    >
                      Débito
                    </button>
                    <button
                      onClick={() => setCardType('credit')}
                      className={`flex-1 p-2 border rounded ${
                        cardType === 'credit' ? 'border-green-500 bg-green-50' : 'border-gray-300'
                      }`}
                    >
                      Crédito
                    </button>
                  </div>
                )}
              </div>

              {/* Botões de ação */}
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={finalizeSale}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Finalizar Venda
                </button>
                <button
                  onClick={() => {
                    setCart([]);
                    setShowForm(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lista de vendas */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Itens</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pagamento</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {state.sales.map((sale) => (
              <tr key={sale.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(sale.date).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  #{sale.id.slice(-6)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {sale.items.reduce((sum, item) => sum + item.quantity, 0)} produtos
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  R$ {sale.total.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="capitalize">{sale.paymentMethod}</span>
                  {sale.cardType && ` (${sale.cardType})`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {state.sales.length === 0 && (
          <p className="text-center py-8 text-gray-500">Nenhuma venda realizada</p>
        )}
      </div>
    </div>
  );
}