export interface PedidoItem {
  menuItemId: string;
  nombre: string;
  tamanio: 'individual' | 'chica' | 'mediana' | 'familiar' | 'sencilla' | 'doble' | 'unico';
  precio: number;
  cantidad: number;
}

export interface Pedido {
  _id?: string;
  numeroOrden: string; // Agregado: número de orden del 00001 al 10000
  clienteId: string;
  telefono: string;
  nombre: string;
  direccion: string;
  referencia: string;
  empleado: string;
  items: PedidoItem[];
  total: number;
  createdAt?: Date;
}

export interface PedidoFormData {
  numeroOrden: string; // Agregado: número de orden del 00001 al 10000
  clienteId: string;
  telefono: string;
  nombre: string;
  direccion: string;
  referencia: string;
  empleado: string;
  items: PedidoItem[];
  total: number;
} 