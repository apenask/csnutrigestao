import { useState } from 'react';
import { Plus, Minus, TrendingUp, TrendingDown, Trash2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Modal } from '../components/Modal';
import { ConfirmModal } from '../components/ConfirmModal';
import { formatCurrency, formatDateTime } from '../utils/dateUtils';

export function Caixa() {
  const { state, dispatch } = useStore();
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState<string>('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  const cashBalance = state.cashFlow.reduce((balance, flow) => {
    return balance + (flow.type === 'expense' ? -flow.amount : flow.amount);
  }, 0);

  const handleAddEntry = (type: 'income' | 'expense') => {
    if (!description.trim() || !amount) return;
    const entry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      description: description.trim(),
      type,
      amount: parseFloat(amount)
    };
    dispatch({ type: 'ADD_CASH_FLOW', payload: entry });
    setDescription('');
    setAmount('');
    setShowEntryModal(false);
    setShowExpenseModal(false);
  };

  const handleDeleteEntry = (entryId: string) => {
    setSelectedEntryId(entryId);
    setShowDeleteModal(true);
  };

  const confirmDeleteEntry = () => {
    dispatch({ type: 'DELETE_CASH_FLOW', payload: selectedEntryId });
    setShowDeleteModal(false);
    setSelectedEntryId('');
  };

  const getFlowTypeIcon = (type: string) => {
    switch (type) {
      case 'income':
        return <TrendingUp size={16} className="text-green-600" />;
      case 'expense':
        return <TrendingDown size={16} className="text-red-600" />;
      case 'sale':
        return <TrendingUp size={16} className="text-green-600" />;
      default:
        return null;
    }
  };

  const getFlowTypeLabel = (type: string) => {
    switch (type) {
      case 'income': return 'Entrada';
      case 'expense': return 'Saída';
      case 'sale': return 'Venda';
      default: return type;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Caixa</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Controle seu fluxo de caixa</p>
      </div>

      <div className="card rounded-xl p-8 text-center">
        <h2 className="text-lg font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Saldo Atual do Caixa</h2>
        <p className={`text-4xl font-bold mb-6 ${cashBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {formatCurrency(cashBalance)}
        </p>
        <div className="flex justify-center space-x-4">
          <button onClick={() => setShowEntryModal(true)} className="btn-success px-6 py-3 rounded-lg font-semibold hover-lift flex items-center">
            <Plus size={20} className="mr-2" />
            Lançar Entrada
          </button>
          <button onClick={() => setShowExpenseModal(true)} className="btn-warning px-6 py-3 rounded-lg font-semibold hover-lift flex items-center">
            <Minus size={20} className="mr-2" />
            Lançar Saída
          </button>
        </div>
      </div>

      <div className="card rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Histórico de Transações</h3>
        {state.cashFlow.length === 0 ? (
          <div className="text-center py-8">
            <p style={{ color: 'var(--text-muted)' }}>Nenhuma transação registrada</p>
          </div>
        ) : (
          <>
            {/* Tabela para desktop */}
            <div className="hidden md:block">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-sm text-left min-w-full">
                  <thead className="border-b" style={{ borderColor: 'var(--border-primary)' }}>
                    <tr>
                      <th className="py-3 px-4 font-medium whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>Data/Hora</th>
                      <th className="py-3 px-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Descrição</th>
                      <th className="text-center py-3 px-4 font-medium whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>Tipo</th>
                      <th className="text-right py-3 px-4 font-medium whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>Valor</th>
                      <th className="text-center py-3 px-4 font-medium whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'var(--border-secondary)' }}>
                    {state.cashFlow.map((flow) => (
                      <tr key={flow.id} className="hover:bg-opacity-50" data-theme={state.config.theme === 'dark' ? 'dark' : 'light'}>
                        <td className="py-3 px-4 whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
                          {formatDateTime(flow.date)}
                        </td>
                        <td className="py-3 px-4" style={{ color: 'var(--text-primary)' }}>
                          {flow.description}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            {getFlowTypeIcon(flow.type)}
                            <span className="text-sm whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                              {getFlowTypeLabel(flow.type)}
                            </span>
                          </div>
                        </td>
                        <td className={`py-3 px-4 text-right font-semibold whitespace-nowrap ${flow.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                          {flow.type === 'expense' ? '-' : '+'}{formatCurrency(flow.amount)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {flow.type !== 'sale' && (
                            <button 
                              onClick={() => handleDeleteEntry(flow.id)} 
                              className="p-2 rounded-lg hover:bg-red-100 text-red-500" 
                              title="Excluir lançamento"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cards para mobile */}
            <div className="block md:hidden space-y-4">
              {state.cashFlow.map((flow) => (
                <div key={flow.id} className="card-secondary rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                        {flow.description}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        {formatDateTime(flow.date)}
                      </p>
                    </div>
                    {flow.type !== 'sale' && (
                      <button 
                        onClick={() => handleDeleteEntry(flow.id)} 
                        className="p-2 rounded-lg text-red-500 flex-shrink-0 ml-2"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-1">
                      {getFlowTypeIcon(flow.type)}
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {getFlowTypeLabel(flow.type)}
                      </span>
                    </div>
                    <span className={`font-semibold ${flow.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                      {flow.type === 'expense' ? '-' : '+'}{formatCurrency(flow.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <ConfirmModal 
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)} 
        onConfirm={confirmDeleteEntry} 
        title="Excluir Lançamento" 
        message="Tem certeza que deseja excluir este lançamento? Esta ação não pode ser desfeita." 
        confirmText="Excluir" 
        cancelText="Cancelar" 
        type="danger" 
      />
      
      <Modal 
        isOpen={showEntryModal} 
        onClose={() => { setShowEntryModal(false); setDescription(''); setAmount(''); }} 
        title="Lançar Entrada" 
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Descrição
            </label>
            <input 
              type="text" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Ex: Aporte de capital..." 
              className="w-full px-4 py-2 rounded-lg input-field" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Valor
            </label>
            <input 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              placeholder="0,00" 
              step="0.01" 
              min="0" 
              className="w-full px-4 py-2 rounded-lg input-field" 
            />
          </div>
          <div className="flex space-x-4 pt-4">
            <button 
              onClick={() => { setShowEntryModal(false); setDescription(''); setAmount(''); }} 
              className="flex-1 px-4 py-2 rounded-lg border hover-lift" 
              style={{ borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}
            >
              Cancelar
            </button>
            <button 
              onClick={() => handleAddEntry('income')} 
              disabled={!description.trim() || !amount} 
              className="flex-1 btn-success py-2 rounded-lg font-semibold hover-lift disabled:opacity-50"
            >
              Registrar Entrada
            </button>
          </div>
        </div>
      </Modal>
      
      <Modal 
        isOpen={showExpenseModal} 
        onClose={() => { setShowExpenseModal(false); setDescription(''); setAmount(''); }} 
        title="Lançar Saída" 
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Descrição
            </label>
            <input 
              type="text" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Ex: Pagamento de aluguel..." 
              className="w-full px-4 py-2 rounded-lg input-field" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Valor
            </label>
            <input 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              placeholder="0,00" 
              step="0.01" 
              min="0" 
              className="w-full px-4 py-2 rounded-lg input-field" 
            />
          </div>
          <div className="flex space-x-4 pt-4">
            <button 
              onClick={() => { setShowExpenseModal(false); setDescription(''); setAmount(''); }} 
              className="flex-1 px-4 py-2 rounded-lg border hover-lift" 
              style={{ borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}
            >
              Cancelar
            </button>
            <button 
              onClick={() => handleAddEntry('expense')} 
              disabled={!description.trim() || !amount} 
              className="flex-1 btn-warning py-2 rounded-lg font-semibold hover-lift disabled:opacity-50"
            >
              Registrar Saída
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}