'use client';

import React, { useState } from 'react';
import { Cliente } from '@/models/Cliente';

interface ClienteSearchProps {
  onClienteFound: (cliente: Cliente) => void;
  onClienteNotFound: (telefono: string) => void;
}

const ClienteSearch: React.FC<ClienteSearchProps> = ({ onClienteFound, onClienteNotFound }) => {
  const [telefono, setTelefono] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isValidTelefono = telefono.length === 10 && /^\d+$/.test(telefono);

  const handleSearch = async () => {
    if (!isValidTelefono) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`https://us-central1-chetegamis-cb3c0.cloudfunctions.net/buscarCliente?telefono=${telefono}`);
      const data = await response.json();

      if (response.ok) {
        if (data.found) {
          onClienteFound(data.cliente);
        } else {
          onClienteNotFound(telefono);
        }
      } else {
        setError(data.error || 'Error al buscar cliente');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValidTelefono) {
      handleSearch();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-pizza-dark mb-6 text-center">
        Buscar Cliente
      </h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
            Número de Teléfono
          </label>
          <input
            type="tel"
            id="telefono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ''))}
            onKeyPress={handleKeyPress}
            placeholder="1234567890"
            maxLength={10}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pizza-red focus:border-transparent text-black placeholder-gray-400"
          />
          <p className="text-xs text-gray-500 mt-1">
            Ingresa un número de 10 dígitos
          </p>
        </div>

        {error && (
          <div className="text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        <button
          onClick={handleSearch}
          disabled={!isValidTelefono || isLoading}
          className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
            isValidTelefono && !isLoading
              ? 'bg-pizza-red hover:bg-pizza-dark text-white shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-pizza-light'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isLoading ? 'Buscando...' : 'Buscar'}
        </button>
      </div>
    </div>
  );
};

export default ClienteSearch; 