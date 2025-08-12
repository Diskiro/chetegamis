export interface Cliente {
  _id?: string;
  telefono: string;
  nombre: string;
  direccion: string;
  referencia: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ClienteFormData {
  telefono: string;
  nombre: string;
  direccion: string;
  referencia: string;
} 