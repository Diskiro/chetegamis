// Script para poblar la base de datos con datos de ejemplo
// Ejecutar con: node scripts/seed-data.js

const { MongoClient } = require('mongodb');

// Configuración - Reemplaza con tu URI de MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://username:password@cluster.mongodb.net/chetegamis?retryWrites=true&w=majority';

async function seedData() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Conectado a MongoDB Atlas');

    const db = client.db('chetegamis');

    // Poblar colección de clientes
    const clientesCollection = db.collection('clientes');
    const clientesEjemplo = [
      {
        telefono: '5551234567',
        nombre: 'Juan Pérez',
        direccion: 'Av. Principal 123, Col. Centro',
        referencia: 'Frente al parque, casa de dos pisos',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        telefono: '5559876543',
        nombre: 'María García',
        direccion: 'Calle Secundaria 456, Col. Norte',
        referencia: 'Esquina con calle de los árboles',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        telefono: '5551112233',
        nombre: 'Carlos López',
        direccion: 'Blvd. Reforma 789, Col. Sur',
        referencia: 'Cerca del centro comercial',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Limpiar colección existente
    await clientesCollection.deleteMany({});
    console.log('Colección de clientes limpiada');

    // Insertar clientes de ejemplo
    const clientesResult = await clientesCollection.insertMany(clientesEjemplo);
    console.log(`${clientesResult.insertedCount} clientes insertados`);

    // Poblar colección de menú
    const menuCollection = db.collection('menu');
    const menuEjemplo = [
      {
        nombre: 'Pizza Margherita',
        precioChico: 120.00,
        precioMediano: 180.00,
        precioGrande: 240.00,
        precioFamiliar: 320.00,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Pizza Pepperoni',
        precioChico: 140.00,
        precioMediano: 200.00,
        precioGrande: 260.00,
        precioFamiliar: 340.00,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Pizza Hawaiana',
        precioChico: 150.00,
        precioMediano: 220.00,
        precioGrande: 280.00,
        precioFamiliar: 360.00,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Pizza Cuatro Quesos',
        precioChico: 160.00,
        precioMediano: 240.00,
        precioGrande: 300.00,
        precioFamiliar: 380.00,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Pizza Mexicana',
        precioChico: 130.00,
        precioMediano: 190.00,
        precioGrande: 250.00,
        precioFamiliar: 330.00,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Pizza Vegetariana',
        precioChico: 125.00,
        precioMediano: 185.00,
        precioGrande: 245.00,
        precioFamiliar: 325.00,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Limpiar colección existente
    await menuCollection.deleteMany({});
    console.log('Colección de menú limpiada');

    // Insertar menú de ejemplo
    const menuResult = await menuCollection.insertMany(menuEjemplo);
    console.log(`${menuResult.insertedCount} items de menú insertados`);

    console.log('\n✅ Base de datos poblada exitosamente!');
    console.log('\n📋 Datos insertados:');
    console.log(`   - ${clientesResult.insertedCount} clientes`);
    console.log(`   - ${menuResult.insertedCount} pizzas en el menú`);
    
    console.log('\n🔍 Puedes probar con estos números de teléfono:');
    clientesEjemplo.forEach(cliente => {
      console.log(`   - ${cliente.telefono} (${cliente.nombre})`);
    });

  } catch (error) {
    console.error('Error poblando la base de datos:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

// Ejecutar el script
seedData().catch(console.error); 