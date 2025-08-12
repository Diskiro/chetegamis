import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { MenuItem } from '@/models/Menu';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('chetegamis');
    const collection = db.collection('menu');

    const menuItems = await collection.find({}).toArray();

    return NextResponse.json({ menuItems });
  } catch (error) {
    console.error('Error obteniendo menú:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, precioChico, precioMediano, precioGrande, precioFamiliar } = body;

    if (!nombre || precioChico === undefined || precioMediano === undefined || 
        precioGrande === undefined || precioFamiliar === undefined) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('chetegamis');
    const collection = db.collection('menu');

    const nuevoMenuItem = {
      nombre,
      precioChico: Number(precioChico),
      precioMediano: Number(precioMediano),
      precioGrande: Number(precioGrande),
      precioFamiliar: Number(precioFamiliar),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(nuevoMenuItem);
    
    // Crear el objeto de respuesta con el ID convertido a string
    const menuItemCreado: MenuItem = {
      _id: result.insertedId.toString(),
      nombre,
      precioChico: Number(precioChico),
      precioMediano: Number(precioMediano),
      precioGrande: Number(precioGrande),
      precioFamiliar: Number(precioFamiliar),
      createdAt: nuevoMenuItem.createdAt,
      updatedAt: nuevoMenuItem.updatedAt,
    };

    return NextResponse.json({ menuItem: menuItemCreado }, { status: 201 });
  } catch (error) {
    console.error('Error creando item del menú:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 