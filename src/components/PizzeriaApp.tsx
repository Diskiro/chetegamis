'use client';

import React, { useState } from 'react';
import { Cliente } from '@/models/Cliente';
import { PedidoItem } from '@/models/Pedido';
import ClienteSearch from './ClienteSearch';
import ClienteForm from './ClienteForm';
import ClienteInfo from './ClienteInfo';
import MenuTable from './MenuTable';
import PedidoSummary from './PedidoSummary';

type AppState = 'searching' | 'creating' | 'ordering' | 'completed';

const PizzeriaApp: React.FC = () => {
  const [currentState, setCurrentState] = useState<AppState>('searching');
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [pedidoItems, setPedidoItems] = useState<PedidoItem[]>([]);
  const [searchedTelefono, setSearchedTelefono] = useState<string>('');

  const handleClienteFound = (clienteEncontrado: Cliente) => {
    setCliente(clienteEncontrado);
    setCurrentState('ordering');
  };

  const handleClienteNotFound = (telefono: string) => {
    setSearchedTelefono(telefono);
    setCurrentState('creating');
  };

  const handleClienteCreated = (nuevoCliente: Cliente) => {
    setCliente(nuevoCliente);
    setCurrentState('ordering');
  };

  const handleCancelCreation = () => {
    setCurrentState('searching');
  };

  const handlePedidoChange = (items: PedidoItem[]) => {
    setPedidoItems(items);
  };

  const handleImprimir = async () => {
    if (!cliente || pedidoItems.length === 0) return;

    try {
      // Crear el pedido en la base de datos
      const pedidoData = {
        clienteId: cliente._id,
        telefono: cliente.telefono,
        nombre: cliente.nombre,
        direccion: cliente.direccion,
        referencia: cliente.referencia,
        items: pedidoItems,
        total: pedidoItems.reduce((sum, item) => sum + (item.precio * item.cantidad), 0),
      };

      const response = await fetch('/api/pedidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pedidoData),
      });

      if (response.ok) {
        // Imprimir la orden
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>Orden CHETEGAMIS</title>
                <style>
                  body { font-family: Arial, sans-serif; margin: 20px; }
                  .header { text-align: center; margin-bottom: 30px; }
                  .cliente-info { margin-bottom: 30px; }
                  .items { margin-bottom: 30px; }
                  .total { font-size: 18px; font-weight: bold; text-align: right; }
                  table { width: 100%; border-collapse: collapse; }
                  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                  th { background-color: #f2f2f2; }
                </style>
              </head>
              <body>
                <div class="header">
                  <h1>🍕 CHETEGAMIS 🍕</h1>
                  <p>La mejor pizza de la ciudad</p>
                  <p>Fecha: ${new Date().toLocaleDateString()}</p>
                  <p>Hora: ${new Date().toLocaleTimeString()}</p>
                </div>
                
                <div class="cliente-info">
                  <h2>Información del Cliente</h2>
                  <p><strong>Nombre:</strong> ${cliente.nombre}</p>
                  <p><strong>Teléfono:</strong> ${cliente.telefono}</p>
                  <p><strong>Dirección:</strong> ${cliente.direccion}</p>
                  <p><strong>Referencia:</strong> ${cliente.referencia}</p>
                </div>
                
                <div class="items">
                  <h2>Items del Pedido</h2>
                  <table>
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Tamaño</th>
                        <th>Cantidad</th>
                        <th>Precio Unitario</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${pedidoItems.map(item => `
                        <tr>
                          <td>${item.nombre}</td>
                          <td>${item.tamanio}</td>
                          <td>${item.cantidad}</td>
                          <td>$${item.precio.toFixed(2)}</td>
                          <td>$${(item.precio * item.cantidad).toFixed(2)}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
                
                <div class="total">
                  <p>Total: $${pedidoItems.reduce((sum, item) => sum + (item.precio * item.cantidad), 0).toFixed(2)}</p>
                </div>
                
                <div style="margin-top: 50px; text-align: center;">
                  <p>¡Gracias por tu pedido!</p>
                  <p>Tu pizza estará lista pronto 🍕</p>
                </div>
              </body>
            </html>
          `);
          printWindow.document.close();
          printWindow.print();
        }

        // Limpiar todo y volver al estado inicial
        setTimeout(() => {
          setCliente(null);
          setPedidoItems([]);
          setSearchedTelefono('');
          setCurrentState('searching');
        }, 1000);
      }
    } catch (error) {
      console.error('Error al procesar el pedido:', error);
      alert('Error al procesar el pedido. Inténtalo de nuevo.');
    }
  };

  const renderCurrentState = () => {
    switch (currentState) {
      case 'searching':
        return (
          <ClienteSearch
            onClienteFound={handleClienteFound}
            onClienteNotFound={handleClienteNotFound}
          />
        );
      
      case 'creating':
        return (
          <ClienteForm
            telefono={searchedTelefono}
            onClienteCreated={handleClienteCreated}
            onCancel={handleCancelCreation}
          />
        );
      
      case 'ordering':
        return (
          <div className="space-y-6">
            <ClienteInfo cliente={cliente!} />
            <MenuTable onPedidoChange={handlePedidoChange} />
            <PedidoSummary items={pedidoItems} onImprimir={handleImprimir} />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-pizza-cream">
      <div className="container mx-auto px-4 py-8">
        {renderCurrentState()}
      </div>
    </div>
  );
};

export default PizzeriaApp; 