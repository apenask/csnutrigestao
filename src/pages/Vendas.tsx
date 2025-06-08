import { useState } from 'react';
import { FileText, Download, Trash2 } from 'lucide-react'; // 'React' e 'Filter' removidos
import { useStore } from '../context/StoreContext';
import { Modal } from '../components/Modal';
import { ConfirmModal } from '../components/ConfirmModal';
import { formatDateTime, formatCurrency } from '../utils/dateUtils';
import { generateSaleReceipt } from '../utils/pdfGenerator';
import { Sale } from '../types';

export function Vendas() {
  const { state, dispatch } = useStore();
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredSales = state.sales.filter(sale => {
    if (!startDate && !endDate) return true;
    
    const saleDate = new Date(sale.date);
    const start = startDate ? new Date(startDate) : new Date('1900-01-01');
    const end = endDate ? new Date(endDate) : new Date('2100-12-31');
    
    end.setHours(23, 59, 59, 999);

    return saleDate >= start && saleDate <= end;
  });

  const totalSalesValue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);

  const paymentMethodLabels: { [key: string]: string } = {
    cash: 'Dinheiro',
    card: 'Cartão',
    pix: 'PIX'
  };

  const handleViewDetails = (sale: Sale) => {
    setSelectedSale(sale);
    setShowDetailsModal(true);
  };

  const handleDeleteAttempt = (saleId: string) => {
    setSaleToDelete(saleId);
    setShowDeleteModal(true);
  };
  
  const handleConfirmDelete = () => {
    dispatch({ type: 'DELETE_SALE', payload: saleToDelete });
    setShowDeleteModal(false);
  };

  const handleGeneratePDF = async (sale: Sale) => {
    await generateSaleReceipt(sale, state.config.name, state.config.logo);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Vendas
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Histórico de todas as vendas realizadas
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card rounded-xl p-6 text-center">
          <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
            Total de Vendas
          </h3>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {filteredSales.length}
          </p>
        </div>
        
        <div className="card rounded-xl p-6 text-center">
          <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
            Faturamento Total
          </h3>
          <p className="text-2xl font-bold" style={{ color: 'var(--accent-red)' }}>
            {formatCurrency(totalSalesValue)}
          </p>
        </div>
        
        <div className="card rounded-xl p-6 text-center">
          <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
            Ticket Médio
          </h3>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {formatCurrency(filteredSales.length > 0 ? totalSalesValue / filteredSales.length : 0)}
          </p>
        </div>
      </div>

      <div className="card rounded-xl p-6">
        <div className="flex items-center mb-4">
          <FileText size={20} className="mr-2" style={{ color: 'var(--accent-red)' }} />
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Filtros
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Data Inicial
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 rounded-lg input-field"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Data Final
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 rounded-lg input-field"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              className="px-4 py-2 rounded-lg border hover-lift"
              style={{ borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      <div className="card rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Histórico de Vendas ({filteredSales.length})
        </h3>
        
        {filteredSales.length === 0 ? (
          <div className="text-center py-8">
            <FileText size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
            <p style={{ color: 'var(--text-muted)' }}>
              Nenhuma venda encontrada para o período selecionado
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border-primary)' }}>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-secondary)' }}>ID da Venda</th>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Data/Hora</th>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Itens</th>
                  <th className="text-center py-3 px-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Pagamento</th>
                  <th className="text-right py-3 px-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Total</th>
                  <th className="text-center py-3 px-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="border-b hover:bg-opacity-50" style={{ borderColor: 'var(--border-secondary)' }}>
                    <td className="py-3 px-4 font-mono" style={{ color: 'var(--text-primary)' }}>#{sale.id}</td>
                    <td className="py-3 px-4" style={{ color: 'var(--text-primary)' }}>{formatDateTime(sale.date)}</td>
                    <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>{sale.items.length} item{sale.items.length !== 1 ? 's' : ''}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-1 rounded-full text-xs font-medium card-secondary">
                        {paymentMethodLabels[sale.paymentMethod]}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold" style={{ color: 'var(--accent-red)' }}>{formatCurrency(sale.total)}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center space-x-2">
                        <button onClick={() => handleViewDetails(sale)} className="p-2 rounded-lg hover-lift card-secondary" title="Ver Detalhes">
                          <FileText size={16} style={{ color: 'var(--accent-red)' }} />
                        </button>
                        <button onClick={() => handleGeneratePDF(sale)} className="p-2 rounded-lg hover-lift card-secondary" title="Gerar PDF">
                          <Download size={16} style={{ color: 'var(--success)' }} />
                        </button>
                        <button onClick={() => handleDeleteAttempt(sale.id)} className="p-2 rounded-lg hover-lift card-secondary" title="Excluir Venda">
                          <Trash2 size={16} className="text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={`Detalhes da Venda #${selectedSale?.id}`}
        size="lg"
      >
        {selectedSale && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Data/Hora</label>
                <p style={{ color: 'var(--text-primary)' }}>{formatDateTime(selectedSale.date)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Forma de Pagamento</label>
                <p style={{ color: 'var(--text-primary)' }}>{paymentMethodLabels[selectedSale.paymentMethod]}</p>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Itens da Venda</h4>
              <div className="space-y-2">
                {selectedSale.items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-3 card-secondary rounded-lg">
                    <div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{item.product.name}</p>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{formatCurrency(item.product.price)} x {item.quantity}</p>
                    </div>
                    <p className="font-semibold" style={{ color: 'var(--accent-red)' }}>{formatCurrency(item.product.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t pt-4" style={{ borderColor: 'var(--border-primary)' }}>
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Total da Venda:</span>
                <span className="text-xl font-bold" style={{ color: 'var(--accent-red)' }}>{formatCurrency(selectedSale.total)}</span>
              </div>
            </div>
            <div className="flex space-x-4 pt-4">
              <button onClick={() => setShowDetailsModal(false)} className="flex-1 px-4 py-2 rounded-lg border hover-lift" style={{ borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}>Fechar</button>
              <button onClick={() => handleGeneratePDF(selectedSale)} className="flex-1 btn-success py-2 rounded-lg font-semibold hover-lift">Gerar PDF</button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Excluir Venda"
        message="Tem certeza que deseja excluir esta venda e seu lançamento no caixa? Esta ação é irreversível."
        confirmText="Sim, Excluir"
        type="danger"
      />
    </div>
  );
}