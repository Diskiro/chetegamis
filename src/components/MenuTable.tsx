'use client';

import React, { useState, useEffect } from 'react';
import { MenuItem } from '@/models/Menu';
import { PedidoItem } from '@/models/Pedido';

interface MenuTableProps {
  onPedidoChange: (items: PedidoItem[]) => void;
}

const tamaniosConst = ['chico', 'mediano', 'grande', 'familiar'] as const;

type Tamanio = typeof tamaniosConst[number];

const MenuTable: React.FC<MenuTableProps> = ({ onPedidoChange }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<PedidoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    nombre: '',
    precioChico: '',
    precioMediano: '',
    precioGrande: '',
    precioFamiliar: '',
  });
  const [addError, setAddError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const response = await fetch('/api/menu');
      const data = await response.json();
      
      if (response.ok) {
        setMenuItems(data.menuItems);
      }
    } catch (error) {
      console.error('Error fetching menu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemSelection = (menuItem: MenuItem, tamanio: Tamanio, isSelected: boolean) => {
    if (isSelected) {
      const newItem: PedidoItem = {
        menuItemId: menuItem._id || '',
        nombre: menuItem.nombre,
        tamanio,
        precio: getPrecioByTamanio(menuItem, tamanio),
        cantidad: 1,
      };
      
      const updatedItems = [...selectedItems, newItem];
      setSelectedItems(updatedItems);
      onPedidoChange(updatedItems);
    } else {
      const updatedItems = selectedItems.filter(
        item => !(item.menuItemId === menuItem._id && item.tamanio === tamanio)
      );
      setSelectedItems(updatedItems);
      onPedidoChange(updatedItems);
    }
  };

  const handleCantidadChange = (menuItem: MenuItem, tamanio: Tamanio, cantidad: number) => {
    const updatedItems = selectedItems.map(item => {
      if (item.menuItemId === menuItem._id && item.tamanio === tamanio) {
        return { ...item, cantidad };
      }
      return item;
    });
    
    setSelectedItems(updatedItems);
    onPedidoChange(updatedItems);
  };

  const getPrecioByTamanio = (menuItem: MenuItem, tamanio: Tamanio): number => {
    switch (tamanio) {
      case 'chico': return menuItem.precioChico;
      case 'mediano': return menuItem.precioMediano;
      case 'grande': return menuItem.precioGrande;
      case 'familiar': return menuItem.precioFamiliar;
      default: return 0;
    }
  };

  const isItemSelected = (menuItem: MenuItem, tamanio: Tamanio): boolean => {
    return selectedItems.some(item => 
      item.menuItemId === menuItem._id && item.tamanio === tamanio
    );
  };

  const getItemCantidad = (menuItem: MenuItem, tamanio: Tamanio): number => {
    const item = selectedItems.find(item => 
      item.menuItemId === menuItem._id && item.tamanio === tamanio
    );
    return item ? item.cantidad : 1;
  };

  const toggleAddForm = () => {
    setShowAddForm(prev => !prev);
    setAddError('');
  };

  const handleAddFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!addForm.nombre.trim() || !addForm.precioChico || !addForm.precioMediano || !addForm.precioGrande || !addForm.precioFamiliar) {
      setAddError('Todos los campos son requeridos');
      return;
    }

    const payload = {
      nombre: addForm.nombre.trim(),
      precioChico: Number(addForm.precioChico),
      precioMediano: Number(addForm.precioMediano),
      precioGrande: Number(addForm.precioGrande),
      precioFamiliar: Number(addForm.precioFamiliar),
    };

    if (Object.values(payload).some((v) => typeof v === 'number' && (!isFinite(v) || v < 0))) {
      setAddError('Los precios deben ser números válidos y no negativos');
      return;
    }

    try {
      setIsSaving(true);
      setAddError('');
      const res = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setAddError(data.error || 'No se pudo crear el item');
        return;
      }
      // Actualizar lista local con el nuevo item
      setMenuItems((prev) => [...prev, data.menuItem as MenuItem]);
      // Limpiar formulario y ocultar
      setAddForm({ nombre: '', precioChico: '', precioMediano: '', precioGrande: '', precioFamiliar: '' });
      setShowAddForm(false);
    } catch {
      setAddError('Error de conexión');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pizza-red mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando menú...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 bg-pizza-red text-white">
        <h2 className="text-2xl font-bold">Menú de Pizzas</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-pizza-light">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Ordenado</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nombre</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Chico</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Mediano</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Grande</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Familiar</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Cantidad</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {menuItems.map((menuItem) => (
              <tr key={menuItem._id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedItems.some(item => item.menuItemId === menuItem._id)}
                    onChange={(e) => {
                      // Si se selecciona el checkbox principal, seleccionar el tamaño mediano por defecto
                      if (e.target.checked) {
                        handleItemSelection(menuItem, 'mediano', true);
                      } else {
                        // Deseleccionar todos los tamaños
                        const tamanios: Array<Tamanio> = [...tamaniosConst];
                        tamanios.forEach(tamanio => {
                          handleItemSelection(menuItem, tamanio, false);
                        });
                      }
                    }}
                    className="w-4 h-4 text-pizza-red border-gray-300 rounded focus:ring-pizza-red"
                  />
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">{menuItem.nombre}</td>
                
                {(tamaniosConst).map((tamanio) => (
                  <td key={tamanio} className="px-4 py-3 text-center">
                    <div className="flex flex-col items-center space-y-2">
                      <input
                        type="checkbox"
                        checked={isItemSelected(menuItem, tamanio)}
                        onChange={(e) => handleItemSelection(menuItem, tamanio, e.target.checked)}
                        className="w-4 h-4 text-pizza-red border-gray-300 rounded focus:ring-pizza-red"
                      />
                      <span className="text-sm text-gray-600">
                        ${getPrecioByTamanio(menuItem, tamanio)}
                      </span>
                    </div>
                  </td>
                ))}
                
                <td className="px-4 py-3 text-center">
                  {selectedItems.some(item => item.menuItemId === menuItem._id) && (
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={getItemCantidad(menuItem, 'mediano')}
                      onChange={(e) => {
                        const cantidad = parseInt(e.target.value) || 1;
                        // Actualizar cantidad para todos los tamaños seleccionados
                        const tamanios: Array<Tamanio> = [...tamaniosConst];
                        tamanios.forEach(tamanio => {
                          if (isItemSelected(menuItem, tamanio)) {
                            handleCantidadChange(menuItem, tamanio, cantidad);
                          }
                        });
                      }}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm text-black"
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <button
          onClick={toggleAddForm}
          className="inline-flex items-center px-4 py-2 bg-pizza-yellow hover:bg-yellow-500 text-pizza-dark font-semibold rounded-md shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-yellow-200"
        >
          {showAddForm ? 'Cancelar' : 'Agregar al menú'}
        </button>

        {showAddForm && (
          <form onSubmit={handleAddItem} className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-3">
            <input
              type="text"
              name="nombre"
              value={addForm.nombre}
              onChange={handleAddFormChange}
              placeholder="Nombre"
              className="px-3 py-2 border border-gray-300 rounded-md text-black"
              required
            />
            <input
              type="number"
              name="precioChico"
              value={addForm.precioChico}
              onChange={handleAddFormChange}
              placeholder="Precio Chico"
              className="px-3 py-2 border border-gray-300 rounded-md text-black"
              min="0"
              step="0.01"
              required
            />
            <input
              type="number"
              name="precioMediano"
              value={addForm.precioMediano}
              onChange={handleAddFormChange}
              placeholder="Precio Mediano"
              className="px-3 py-2 border border-gray-300 rounded-md text-black"
              min="0"
              step="0.01"
              required
            />
            <input
              type="number"
              name="precioGrande"
              value={addForm.precioGrande}
              onChange={handleAddFormChange}
              placeholder="Precio Grande"
              className="px-3 py-2 border border-gray-300 rounded-md text-black"
              min="0"
              step="0.01"
              required
            />
            <div className="flex gap-3">
              <input
                type="number"
                name="precioFamiliar"
                value={addForm.precioFamiliar}
                onChange={handleAddFormChange}
                placeholder="Precio Familiar"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-black"
                min="0"
                step="0.01"
                required
              />
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-pizza-red hover:bg-pizza-dark text-white font-semibold rounded-md disabled:opacity-50 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-pizza-light"
              >
                {isSaving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>

            {addError && (
              <div className="md:col-span-5 text-red-600 text-sm">{addError}</div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default MenuTable; 