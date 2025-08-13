'use client';

import React, { useState } from 'react';
import { PedidoItem } from '@/models/Pedido';

interface PedidoSummaryProps {
  items: PedidoItem[];
  onImprimir: (empleado: string) => void;
}

const PedidoSummary: React.FC<PedidoSummaryProps> = ({ items, onImprimir }) => {
  const [empleado, setEmpleado] = useState('');
  const total = items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

  const tamanioLabel: Record<PedidoItem['tamanio'], string> = {
    individual: 'Individual',
    chica: 'Chica',
    mediana: 'Mediana',
    familiar: 'Familiar',
    sencilla: 'Sencillo',
    doble: 'Doble',
    unico: 'Único',
  };

  if (items.length === 0) {
    return null;
  }

  const handleImprimir = () => {
    if (empleado.trim()) {
      onImprimir(empleado.trim());
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-pizza-dark mb-4">Resumen del Pedido</h3>
      
      <div className="space-y-3 mb-6">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200">
            <div className="flex-1">
              <span className="font-medium text-gray-900">{item.nombre}</span>
              <span className="text-sm text-gray-500 ml-2 capitalize">
                ({tamanioLabel[item.tamanio]})
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
        
        <div className="mb-4">
          <label htmlFor="empleado" className="block text-sm font-medium text-gray-700 mb-2">
            Empleado *
          </label>
          <input
            type="text"
            id="empleado"
            value={empleado}
            onChange={(e) => setEmpleado(e.target.value)}
            placeholder="Nombre del empleado"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pizza-red focus:border-transparent text-black placeholder-gray-400"
            required
          />
        </div>
        
        <button
          onClick={handleImprimir}
          disabled={!empleado.trim()}
          className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
            empleado.trim()
              ? 'bg-pizza-yellow hover:bg-yellow-500 text-pizza-dark shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-yellow-200'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          🖨️ Imprimir Orden
        </button>
      </div>
    </div>
  );
};

export default PedidoSummary; 