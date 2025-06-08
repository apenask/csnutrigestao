import React from 'react';
import { Sale } from '../types';
import { formatDateTime, formatCurrency } from '../utils/dateUtils';

interface ReceiptTemplateProps {
  sale: Sale;
  storeName: string;
  storeLogo?: string;
}

export function ReceiptTemplate({ sale, storeName, storeLogo }: ReceiptTemplateProps) {
  const paymentMethodLabels = {
    cash: 'Dinheiro',
    card: 'Cartão',
    pix: 'PIX'
  };

  return (
    <div 
      id="receipt-template" 
      className="bg-white p-8 max-w-md mx-auto"
      style={{ 
        fontFamily: 'Arial, sans-serif',
        color: '#000',
        lineHeight: '1.4'
      }}
    >
      {/* Header */}
      <div className="text-center mb-6">
        {storeLogo && (
          <div className="mb-4">
            <img 
              src={storeLogo} 
              alt="Logo" 
              className="mx-auto"
              style={{ maxWidth: '80px', maxHeight: '80px', objectFit: 'contain' }}
            />
          </div>
        )}
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#E53E3E' }}>
          {storeName}
        </h1>
        <p className="text-sm text-gray-600">Sistema de Gestão</p>
        <div className="border-b-2 border-gray-300 mt-4"></div>
      </div>

      {/* Sale Info */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">COMPROVANTE DE VENDA</h2>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Venda:</span>
            <span className="font-mono">#{sale.id}</span>
          </div>
          <div className="flex justify-between">
            <span>Data/Hora:</span>
            <span>{formatDateTime(sale.date)}</span>
          </div>
          <div className="flex justify-between">
            <span>Pagamento:</span>
            <span>{paymentMethodLabels[sale.paymentMethod]}</span>
          </div>
        </div>
        <div className="border-b border-gray-300 mt-3"></div>
      </div>

      {/* Items */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3">ITENS</h3>
        <div className="space-y-2">
          {sale.items.map((item, index) => (
            <div key={index} className="text-sm">
              <div className="flex justify-between font-medium">
                <span>{item.product.name}</span>
                <span>{formatCurrency(item.product.price * item.quantity)}</span>
              </div>
              <div className="flex justify-between text-gray-600 text-xs">
                <span>{formatCurrency(item.product.price)} x {item.quantity}</span>
                <span>{item.product.category}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="border-b border-gray-300 mt-3"></div>
      </div>

      {/* Total */}
      <div className="mb-6">
        <div className="flex justify-between items-center text-lg font-bold">
          <span>TOTAL:</span>
          <span style={{ color: '#E53E3E' }}>{formatCurrency(sale.total)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-600 border-t border-gray-300 pt-4">
        <p className="mb-2">Obrigado pela preferência!</p>
        <p className="font-medium">{storeName}</p>
        <p>Sua loja de suplementos</p>
        <div className="mt-4 text-xs">
          <p>Este documento não possui valor fiscal</p>
          <p>Gerado em {formatDateTime(new Date().toISOString())}</p>
        </div>
      </div>
    </div>
  );
}