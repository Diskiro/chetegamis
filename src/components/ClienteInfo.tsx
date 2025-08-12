'use client';

import React from 'react';
import { Cliente } from '@/models/Cliente';

interface ClienteInfoProps {
  cliente: Cliente;
}

const ClienteInfo: React.FC<ClienteInfoProps> = ({ cliente }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-pizza-dark mb-6 text-center">
        Cliente Encontrado
      </h2>
      
      <div className="space-y-4">
        <div className="bg-pizza-light p-4 rounded-lg">
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                value={cliente.telefono}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-black"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                value={cliente.nombre}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-black"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <textarea
                value={cliente.direccion}
                disabled
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-black"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Referencia
              </label>
              <textarea
                value={cliente.referencia}
                disabled
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-black"
              />
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-green-600 font-medium">
            ✓ Cliente verificado correctamente
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClienteInfo; 