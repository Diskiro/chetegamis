export interface PedidoItem {
  menuItemId: string;
  nombre: string;
  tamanio: 'chico' | 'mediano' | 'grande' | 'familiar';
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
  items: PedidoItem[];
  total: number;
} 