export interface MenuItem {
  _id?: string;
  nombre: string;
  precioChico: number;
  precioMediano: number;
  precioGrande: number;
  precioFamiliar: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MenuItemFormData {
  nombre: string;
  precioChico: number;
  precioMediano: number;
  precioGrande: number;
  precioFamiliar: number;
} 