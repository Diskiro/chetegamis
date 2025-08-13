export type MenuCategoria =
  | 'Pizzas'
  | 'Especiales'
  | 'Sandwich'
  | 'Hamburguesas de arrachera'
  | 'Otros alimentos'
  | 'Pastas'
  | 'Bebidas';

export type MenuTamanio = 'individual' | 'chica' | 'mediana' | 'familiar' | 'sencilla' | 'doble' | 'unico';

export interface MenuItem {
  _id?: string;
  nombre: string;
  categoria?: MenuCategoria;
  tamaniosHabilitados?: MenuTamanio[];
  preciosPorTamanio?: Partial<Record<MenuTamanio, number>>;
  precioChico: number;
  precioMediano: number;
  precioGrande: number;
  precioFamiliar: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MenuItemFormData {
  nombre: string;
  categoria?: MenuCategoria;
  tamaniosHabilitados?: MenuTamanio[];
  preciosPorTamanio?: Partial<Record<MenuTamanio, number>>;
  precioChico: number;
  precioMediano: number;
  precioGrande: number;
  precioFamiliar: number;
} 