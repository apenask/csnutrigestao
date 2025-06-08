import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'danger'
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const typeStyles = {
    danger: {
      icon: 'text-red-500',
      button: 'btn-red'
    },
    warning: {
      icon: 'text-yellow-500',
      button: 'btn-warning'
    },
    info: {
      icon: 'text-blue-500',
      button: 'btn-red'
    }
  };

  const currentStyle = typeStyles[type];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4 text-center">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
        
        <div className="relative inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle card rounded-xl animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <AlertTriangle size={24} className={`mr-3 ${currentStyle.icon}`} />
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                {title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-opacity-20 hover:bg-gray-500 transition-colors"
            >
              <X size={20} style={{ color: 'var(--text-secondary)' }} />
            </button>
          </div>
          
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
            {message}
          </p>

          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border hover-lift"
              style={{ borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 ${currentStyle.button} py-2 rounded-lg font-semibold hover-lift`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}