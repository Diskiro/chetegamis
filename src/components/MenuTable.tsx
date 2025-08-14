'use client';

import React, { useState, useEffect } from 'react';
import { MenuItem, MenuCategoria, MenuTamanio } from '@/models/Menu';
import { PedidoItem } from '@/models/Pedido';

interface MenuTableProps {
  onPedidoChange: (items: PedidoItem[]) => void;
}

const tamaniosPizza = ['individual', 'chica', 'mediana', 'familiar'] as const;
const tamaniosSandwich = ['sencilla', 'doble'] as const;
const tamaniosUnico = ['unico'] as const;

type Tamanio = typeof tamaniosPizza[number] | typeof tamaniosSandwich[number] | typeof tamaniosUnico[number];

type RawMenuItem = Partial<MenuItem> & {
  precioChico?: number | string;
  precioMediano?: number | string;
  precioGrande?: number | string;
  precioFamiliar?: number | string;
  [key: string]: unknown;
};

const categorias: MenuCategoria[] = [
  'Pizzas',
  'Especiales',
  'Sandwich',
  'Hamburguesas de arrachera',
  'Otros alimentos',
  'Pastas',
  'Bebidas',
];

const MenuTable: React.FC<MenuTableProps> = ({ onPedidoChange }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<PedidoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    nombre: '',
    categoria: '' as unknown as MenuCategoria,
    precioChico: '',
    precioMediano: '',
    precioGrande: '',
    precioFamiliar: '',
  });
  const [addError, setAddError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchAllMenus();
  }, []);

  const normalizeItem = (it: RawMenuItem): MenuItem => {
    const categoria = (it.categoria as MenuCategoria) || 'Pizzas';
    const precioChico = Number((it.precioChico ?? 0));
    const precioMediano = Number((it.precioMediano ?? 0));
    const precioGrande = Number((it.precioGrande ?? 0));
    const precioFamiliar = Number((it.precioFamiliar ?? 0));

    const preciosPorTamanio: Partial<Record<MenuTamanio, number>> = (it.preciosPorTamanio as Partial<Record<MenuTamanio, number>> | undefined) || (
      categoria === 'Pizzas' || categoria === 'Especiales'
        ? { individual: precioChico, chica: precioMediano, mediana: precioGrande, familiar: precioFamiliar }
        : categoria === 'Sandwich' || categoria === 'Hamburguesas de arrachera'
        ? { sencilla: precioChico, doble: precioMediano }
        : { unico: precioChico }
    );

    const tamaniosHabilitados: MenuTamanio[] = (it.tamaniosHabilitados as MenuTamanio[] | undefined) || (
      categoria === 'Pizzas' || categoria === 'Especiales' ? [...tamaniosPizza]
      : categoria === 'Sandwich' || categoria === 'Hamburguesas de arrachera' ? [...tamaniosSandwich]
      : [...tamaniosUnico]
    );

    return {
      _id: it._id as string | undefined,
      nombre: (it.nombre as string) || '',
      categoria,
      preciosPorTamanio,
      tamaniosHabilitados,
      precioChico,
      precioMediano,
      precioGrande,
      precioFamiliar,
      createdAt: it.createdAt as Date | undefined,
      updatedAt: it.updatedAt as Date | undefined,
    };
  };

  const fetchFrom = async (url: string): Promise<MenuItem[]> => {
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) return [];
    return (data.menuItems || []).map((it: RawMenuItem) => normalizeItem(it));
  };

  const fetchAllMenus = async () => {
    try {
      const [pizzas, sandHam, otros, bebidas, pastas] = await Promise.all([
        fetchFrom('https://us-central1-chetegamis-cb3c0.cloudfunctions.net/obtenerMenuPizzasEspeciales'),
        fetchFrom('https://us-central1-chetegamis-cb3c0.cloudfunctions.net/obtenerMenuSandwichesHamburguesas'),
        fetchFrom('https://us-central1-chetegamis-cb3c0.cloudfunctions.net/obtenerMenuOtrosAlimentos'),
        fetchFrom('https://us-central1-chetegamis-cb3c0.cloudfunctions.net/obtenerMenuBebidas'),
        fetchFrom('https://us-central1-chetegamis-cb3c0.cloudfunctions.net/obtenerMenuPastas'),
      ]);
      setMenuItems([...pizzas, ...sandHam, ...otros, ...bebidas, ...pastas]);
    } catch (e) {
      console.error('Error fetching menus por categoría:', e);
      // fallback al legacy si algo falla
      const res = await fetch('https://us-central1-chetegamis-cb3c0.cloudfunctions.net/obtenerMenu');
      const data = await res.json();
      if (res.ok) {
        const normalized: MenuItem[] = (data.menuItems || []).map((it: RawMenuItem) => normalizeItem(it));
        setMenuItems(normalized);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getTamaniosByCategoria = (categoria?: MenuCategoria): Tamanio[] => {
    if (categoria === 'Pizzas' || categoria === 'Especiales') return [...tamaniosPizza];
    if (categoria === 'Sandwich' || categoria === 'Hamburguesas de arrachera') return [...tamaniosSandwich];
    return [...tamaniosUnico];
  };

  const labelByTamanio: Record<Tamanio, string> = {
    individual: 'Individual',
    chica: 'Chica',
    mediana: 'Mediana',
    familiar: 'Familiar',
    sencilla: 'Sencillo',
    doble: 'Doble',
    unico: 'Único',
  };

  const getPrecioByTamanio = (menuItem: MenuItem, tamanio: Tamanio): number => {
    const key = tamanio as MenuTamanio;
    if (menuItem.preciosPorTamanio && menuItem.preciosPorTamanio[key] !== undefined) {
      return Number(menuItem.preciosPorTamanio[key]);
    }
    switch (tamanio) {
      case 'individual': return menuItem.precioChico;
      case 'chica': return menuItem.precioMediano;
      case 'mediana': return menuItem.precioGrande;
      case 'familiar': return menuItem.precioFamiliar;
      case 'sencilla': return menuItem.precioChico;
      case 'doble': return menuItem.precioMediano;
      case 'unico': return menuItem.precioChico;
      default: return 0;
    }
  };

  const getDisplayedCantidad = (menuItem: MenuItem): number => {
    const item = selectedItems.find(item => item.menuItemId === menuItem._id);
    return item ? item.cantidad : 0; // Cambiado de 1 a 0
  };

  const handleItemSelection = (menuItem: MenuItem, tamanio: Tamanio, isSelected: boolean) => {
    if (isSelected) {
      const cantidadActual = getDisplayedCantidad(menuItem);
      const newItem: PedidoItem = {
        menuItemId: menuItem._id || '',
        nombre: menuItem.nombre,
        tamanio,
        precio: getPrecioByTamanio(menuItem, tamanio),
        cantidad: cantidadActual,
      };
      setSelectedItems(prev => {
        const updated = [...prev, newItem];
        onPedidoChange(updated);
        return updated;
      });
    } else {
      setSelectedItems(prev => {
        const updated = prev.filter(item => !(item.menuItemId === menuItem._id && item.tamanio === tamanio));
        onPedidoChange(updated);
        return updated;
      });
    }
  };

  const handleCantidadChange = (menuItem: MenuItem, cantidad: number) => {
    const cantidadNormalizada = Number.isFinite(cantidad) && cantidad >= 0 ? cantidad : 0; // Cambiado para permitir 0
    setSelectedItems(prev => {
      const updated = prev.map(item => item.menuItemId === menuItem._id ? { ...item, cantidad: cantidadNormalizada } : item);
      onPedidoChange(updated);
      return updated;
    });
  };

  const isItemSelected = (menuItem: MenuItem, tamanio: Tamanio): boolean => {
    return selectedItems.some(item => item.menuItemId === menuItem._id && item.tamanio === tamanio);
  };

  const toggleAddForm = () => {
    setShowAddForm(prev => !prev);
    setAddError('');
  };

  const handleAddFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddForm(prev => ({ ...prev, [name]: value }));
  };

  const categoriaRequires = (categoria: MenuCategoria | '') => {
    if (categoria === 'Pizzas' || categoria === 'Especiales') return 'cuatro';
    if (categoria === 'Sandwich' || categoria === 'Hamburguesas de arrachera') return 'dos';
    return 'uno';
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!addForm.nombre.trim() || !addForm.categoria) {
      setAddError('Nombre y categoría son requeridos');
      return;
    }

    const requirement = categoriaRequires(addForm.categoria);

    if (requirement === 'cuatro' && (!addForm.precioChico || !addForm.precioMediano || !addForm.precioGrande || !addForm.precioFamiliar)) {
      setAddError('Completa los 4 precios para Pizzas o Especiales');
      return;
    }
    if (requirement === 'dos' && (!addForm.precioChico || !addForm.precioMediano)) {
      setAddError('Completa Sencillo y Doble');
      return;
    }
    if (requirement === 'uno' && (!addForm.precioChico)) {
      setAddError('Completa el precio Único');
      return;
    }

    const tamaniosHabilitados =
      requirement === 'cuatro' ? [...tamaniosPizza] : requirement === 'dos' ? [...tamaniosSandwich] : [...tamaniosUnico];

    const preciosPorTamanio: Partial<Record<MenuTamanio, number>> = {};
    if (requirement === 'cuatro') {
      preciosPorTamanio['individual'] = Number(addForm.precioChico);
      preciosPorTamanio['chica'] = Number(addForm.precioMediano);
      preciosPorTamanio['mediana'] = Number(addForm.precioGrande);
      preciosPorTamanio['familiar'] = Number(addForm.precioFamiliar);
    } else if (requirement === 'dos') {
      preciosPorTamanio['sencilla'] = Number(addForm.precioChico);
      preciosPorTamanio['doble'] = Number(addForm.precioMediano);
    } else {
      preciosPorTamanio['unico'] = Number(addForm.precioChico);
    }

    // Seleccionar endpoint por categoría
    const endpoint =
      addForm.categoria === 'Pizzas' || addForm.categoria === 'Especiales'
        ? 'obtenerMenuPizzasEspeciales'
        : addForm.categoria === 'Sandwich' || addForm.categoria === 'Hamburguesas de arrachera'
        ? 'obtenerMenuSandwichesHamburguesas'
        : addForm.categoria === 'Otros alimentos'
        ? 'obtenerMenuOtrosAlimentos'
        : addForm.categoria === 'Bebidas'
        ? 'obtenerMenuBebidas'
        : 'obtenerMenuPastas';

    const payload: Partial<MenuItem> & { nombre: string } = {
      nombre: addForm.nombre.trim(),
      categoria: addForm.categoria,
      tamaniosHabilitados: tamaniosHabilitados as MenuTamanio[],
      preciosPorTamanio,
      precioChico: Number(addForm.precioChico || 0),
      precioMediano: Number(addForm.precioMediano || 0),
      precioGrande: Number(addForm.precioGrande || 0),
      precioFamiliar: Number(addForm.precioFamiliar || 0),
    };

    if (Object.entries(payload).some(([k, v]) => (k.startsWith('precio') && typeof v === 'number' && (!isFinite(v) || v < 0)))) {
      setAddError('Los precios deben ser números válidos y no negativos');
      return;
    }

    try {
      setIsSaving(true);
      setAddError('');
      const res = await fetch(`https://us-central1-chetegamis-cb3c0.cloudfunctions.net/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setAddError(data.error || 'No se pudo crear el item');
        return;
      }
      // Insertar al estado y no depender de nueva carga
      const newItem = normalizeItem(data.menuItem as RawMenuItem);
      setMenuItems((prev) => [...prev, newItem]);
      setAddForm({ nombre: '', categoria: '' as unknown as MenuCategoria, precioChico: '', precioMediano: '', precioGrande: '', precioFamiliar: '' });
      setShowAddForm(false);
    } catch {
      setAddError('Error de conexión');
    } finally {
      setIsSaving(false);
    }
  };

  const requirement = categoriaRequires(addForm.categoria || '');

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pizza-red mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando menú...</p>
      </div>
    );
  }

  const renderCategoryTable = (categoria: MenuCategoria) => {
    const items = menuItems.filter((it) => it.categoria === categoria);
    if (items.length === 0) return null;
    const tamanios = getTamaniosByCategoria(categoria);

    return (
      <div key={categoria} className="mb-8">
        <div className="px-6 py-4 bg-pizza-red text-white">
          <h2 className="text-2xl font-bold">Menú {categoria}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-pizza-light">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nombre</th>
                {tamanios.map((t) => (
                  <th key={t} className="px-4 py-3 text-center text-sm font-medium text-gray-700">{labelByTamanio[t]}</th>
                ))}
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Cantidad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((menuItem) => (
                <tr key={menuItem._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{menuItem.nombre}</td>
                  {tamanios.map((t) => (
                    <td key={t} className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center space-y-2">
                        <input
                          type="checkbox"
                          checked={isItemSelected(menuItem, t)}
                          onChange={(e) => handleItemSelection(menuItem, t, e.target.checked)}
                          className="w-4 h-4 text-pizza-red border-gray-300 rounded focus:ring-pizza-red"
                        />
                        <span className="text-sm text-gray-600">
                          ${getPrecioByTamanio(menuItem, t)}
                        </span>
                      </div>
                    </td>
                  ))}
                  <td className="px-4 py-3 text-center">
                    {selectedItems.some(item => item.menuItemId === menuItem._id) && (
                      <input
                        type="number"
                        min="0"
                        max="99"
                        value={getDisplayedCantidad(menuItem) || ''} // Cambiado para mostrar vacío cuando es 0
                        onChange={(e) => {
                          const cantidad = parseInt(e.target.value) || 0; // Cambiado para permitir 0
                          handleCantidadChange(menuItem, cantidad);
                        }}
                        placeholder="0" // Agregado placeholder
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm text-black"
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {categorias.map((c) => renderCategoryTable(c))}

      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        {!showAddForm && (
          <button
            onClick={toggleAddForm}
            className="inline-flex items-center px-4 py-2 bg-pizza-yellow hover:bg-yellow-500 text-pizza-dark font-semibold rounded-md shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-yellow-200"
          >
            Agregar al menú
          </button>
        )}

        {showAddForm && (
          <div className="flex items-center gap-3">
            <button
              onClick={toggleAddForm}
              className="inline-flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black font-semibold rounded-md shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="add-menu-form"
              disabled={isSaving}
              className="inline-flex items-center px-4 py-2 bg-pizza-red hover:bg-pizza-dark text-white font-semibold rounded-md disabled:opacity-50 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-pizza-light"
            >
              {isSaving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        )}

        {showAddForm && (
          <form id="add-menu-form" onSubmit={handleAddItem} className="mt-4 grid grid-cols-1 md:grid-cols-6 gap-3">
            <input
              type="text"
              name="nombre"
              value={addForm.nombre}
              onChange={handleAddFormChange}
              placeholder="Nombre"
              className="px-3 py-2 border border-gray-300 rounded-md text-black md:col-span-2"
              required
            />
            <select
              name="categoria"
              value={addForm.categoria || ''}
              onChange={handleAddFormChange}
              className="px-3 py-2 border border-gray-300 rounded-md text-black md:col-span-2"
              required
            >
              <option value="" disabled>Selecciona categoría</option>
              {categorias.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {(() => {
              if (requirement === 'cuatro') {
                return (
                  <>
                    <input type="number" name="precioChico" value={addForm.precioChico} onChange={handleAddFormChange} placeholder="Precio Individual" className="px-3 py-2 border border-gray-300 rounded-md text-black" min="0" step="0.01" required />
                    <input type="number" name="precioMediano" value={addForm.precioMediano} onChange={handleAddFormChange} placeholder="Precio Chica" className="px-3 py-2 border border-gray-300 rounded-md text-black" min="0" step="0.01" required />
                    <input type="number" name="precioGrande" value={addForm.precioGrande} onChange={handleAddFormChange} placeholder="Precio Mediana" className="px-3 py-2 border border-gray-300 rounded-md text-black" min="0" step="0.01" required />
                    <input type="number" name="precioFamiliar" value={addForm.precioFamiliar} onChange={handleAddFormChange} placeholder="Precio Familiar" className="px-3 py-2 border border-gray-300 rounded-md text-black" min="0" step="0.01" required />
                  </>
                );
              }
              if (requirement === 'dos') {
                return (
                  <>
                    <input type="number" name="precioChico" value={addForm.precioChico} onChange={handleAddFormChange} placeholder="Precio Sencillo" className="px-3 py-2 border border-gray-300 rounded-md text-black" min="0" step="0.01" required />
                    <input type="number" name="precioMediano" value={addForm.precioMediano} onChange={handleAddFormChange} placeholder="Precio Doble" className="px-3 py-2 border border-gray-300 rounded-md text-black" min="0" step="0.01" required />
                  </>
                );
              }
              return (
                <>
                  <input type="number" name="precioChico" value={addForm.precioChico} onChange={handleAddFormChange} placeholder="Precio Único" className="px-3 py-2 border border-gray-300 rounded-md text-black md:col-span-2" min="0" step="0.01" required />
                </>
              );
            })()}

            {addError && (
              <div className="md:col-span-6 text-red-600 text-sm">{addError}</div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default MenuTable; 