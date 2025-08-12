'use client';

import React from 'react';
import { PedidoItem } from '@/models/Pedido';

interface PedidoSummaryProps {
  items: PedidoItem[];
  onImprimir: () => void;
}

const PedidoSummary: React.FC<PedidoSummaryProps> = ({ items, onImprimir }) => {
  const total = items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-pizza-dark mb-4">Resumen del Pedido</h3>
      
      <div className="space-y-3 mb-6">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200">
            <div className="flex-1">
              <span className="font-medium text-gray-900">{item.nombre}</span>
              <span className="text-sm text-gray-500 ml-2 capitalize">
                ({item.tamanio})
              </span>
            </div>
            <div className="text-right">
              <span className="text-gray-600">x{item.cantidad}</span>
              <span className="ml-3 font-medium text-gray-900">
                ${(item.precio * item.cantidad).toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-bold text-pizza-dark">Total:</span>
          <span className="text-2xl font-bold text-pizza-red">${total.toFixed(2)}</span>
        </div>
        
        <button
          onClick={onImprimir}
          className="w-full bg-pizza-yellow hover:bg-yellow-500 text-pizza-dark font-bold py-3 px-4 rounded-md transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-yellow-200"
        >
          🖨️ Imprimir Orden
        </button>
      </div>
    </div>
  );
};

export default PedidoSummary; 