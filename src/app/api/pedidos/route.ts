import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Pedido, PedidoFormData } from '@/models/Pedido';

export async function POST(request: NextRequest) {
  try {
    const body: PedidoFormData = await request.json();
    const { clienteId, telefono, nombre, direccion, referencia, items, total } = body;

    if (!clienteId || !telefono || !nombre || !direccion || !referencia || !items || total === undefined) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
    }

    if (items.length === 0) {
      return NextResponse.json({ error: 'El pedido debe tener al menos un item' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('chetegamis');
    const collection = db.collection('pedidos');

    const nuevoPedido = {
      clienteId,
      telefono,
      nombre,
      direccion,
      referencia,
      items,
      total,
      createdAt: new Date(),
    };

    const result = await collection.insertOne(nuevoPedido);
    
    // Crear el objeto de respuesta con el ID convertido a string
    const pedidoCreado: Pedido = {
      _id: result.insertedId.toString(),
      clienteId,
      telefono,
      nombre,
      direccion,
      referencia,
      items,
      total,
      createdAt: nuevoPedido.createdAt,
    };

    return NextResponse.json({ pedido: pedidoCreado }, { status: 201 });
  } catch (error) {
    console.error('Error creando pedido:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 