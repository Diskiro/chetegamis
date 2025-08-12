'use client';

import React, { useState } from 'react';
import { ClienteFormData, Cliente } from '@/models/Cliente';

interface ClienteFormProps {
  telefono: string;
  onClienteCreated: (cliente: Cliente) => void;
  onCancel: () => void;
}

const ClienteForm: React.FC<ClienteFormProps> = ({ telefono, onClienteCreated, onCancel }) => {
  const [formData, setFormData] = useState<ClienteFormData>({
    telefono,
    nombre: '',
    direccion: '',
    referencia: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre.trim() || !formData.direccion.trim() || !formData.referencia.trim()) {
      setError('Todos los campos son requeridos');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/clientes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        onClienteCreated(data.cliente);
      } else {
        setError(data.error || 'Error al crear cliente');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-pizza-dark mb-6 text-center">
        Nuevo Cliente
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
            Teléfono
          </label>
          <input
            type="tel"
            id="telefono"
            name="telefono"
            value={formData.telefono}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-black"
          />
        </div>

        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre Completo *
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pizza-red focus:border-transparent text-black"
            placeholder="Ingresa el nombre completo"
          />
        </div>

        <div>
          <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-2">
            Dirección *
          </label>
          <textarea
            id="direccion"
            name="direccion"
            value={formData.direccion}
            onChange={handleInputChange}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pizza-red focus:border-transparent text-black"
            placeholder="Ingresa la dirección completa"
          />
        </div>

        <div>
          <label htmlFor="referencia" className="block text-sm font-medium text-gray-700 mb-2">
            Referencia *
          </label>
          <textarea
            id="referencia"
            name="referencia"
            value={formData.referencia}
            onChange={handleInputChange}
            required
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pizza-red focus:border-transparent text-black"
            placeholder="Puntos de referencia para la entrega"
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 py-3 px-4 bg-pizza-red hover:bg-pizza-dark text-white rounded-md font-medium transition-colors disabled:opacity-50 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-pizza-light"
          >
            {isLoading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClienteForm; 