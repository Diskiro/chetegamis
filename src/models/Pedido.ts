export interface PedidoItem {
  menuItemId: string;
  nombre: string;
  tamanio: 'individual' | 'chica' | 'mediana' | 'familiar';
  precio: number;
  cantidad: number;
}

export interface Pedido {
  _id?: string;
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
  clienteId: string;
  telefono: string;
  nombre: string;
  direccion: string;
  referencia: string;
  empleado: string;
  items: PedidoItem[];
  total: number;
} 