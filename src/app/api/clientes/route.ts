import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Cliente, ClienteFormData } from '@/models/Cliente';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const telefono = searchParams.get('telefono');

    if (!telefono) {
      return NextResponse.json({ error: 'Teléfono es requerido' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('chetegamis');
    const collection = db.collection('clientes');

    const cliente = await collection.findOne({ telefono });

    if (!cliente) {
      return NextResponse.json({ found: false });
    }

    return NextResponse.json({ found: true, cliente });
  } catch (error) {
    console.error('Error buscando cliente:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ClienteFormData = await request.json();
    const { telefono, nombre, direccion, referencia } = body;

    if (!telefono || !nombre || !direccion || !referencia) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
    }

    if (telefono.length !== 10) {
      return NextResponse.json({ error: 'El teléfono debe tener 10 dígitos' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('chetegamis');
    const collection = db.collection('clientes');

    // Verificar si ya existe un cliente con ese teléfono
    const existingCliente = await collection.findOne({ telefono });
    if (existingCliente) {
      return NextResponse.json({ error: 'Ya existe un cliente con ese teléfono' }, { status: 409 });
    }

    const nuevoCliente = {
      telefono,
      nombre,
      direccion,
      referencia,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(nuevoCliente);
    
    // Crear el objeto de respuesta con el ID convertido a string
    const clienteCreado: Cliente = {
      _id: result.insertedId.toString(),
      telefono,
      nombre,
      direccion,
      referencia,
      createdAt: nuevoCliente.createdAt,
      updatedAt: nuevoCliente.updatedAt,
    };

    return NextResponse.json({ cliente: clienteCreado }, { status: 201 });
  } catch (error) {
    console.error('Error creando cliente:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 