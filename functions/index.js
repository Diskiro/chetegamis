const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();

// Función para buscar cliente por teléfono
exports.buscarCliente = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method === 'GET') {
    try {
      const { telefono } = req.query;
      
      if (!telefono) {
        res.status(400).json({ error: 'Teléfono es requerido' });
        return;
      }

      const clientesRef = db.collection('clientes');
      const snapshot = await clientesRef.where('telefono', '==', telefono).get();

      if (snapshot.empty) {
        res.json({ found: false });
        return;
      }

      const cliente = snapshot.docs[0].data();
      cliente._id = snapshot.docs[0].id;
      
      res.json({ found: true, cliente });
    } catch (error) {
      console.error('Error buscando cliente:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  } else if (req.method === 'POST') {
    try {
      const { telefono, nombre, direccion, referencia } = req.body;

      if (!telefono || !nombre || !direccion || !referencia) {
        res.status(400).json({ error: 'Todos los campos son requeridos' });
        return;
      }

      if (telefono.length !== 10) {
        res.status(400).json({ error: 'El teléfono debe tener 10 dígitos' });
        return;
      }

      // Verificar si ya existe un cliente con ese teléfono
      const clientesRef = db.collection('clientes');
      const snapshot = await clientesRef.where('telefono', '==', telefono).get();

      if (!snapshot.empty) {
        res.status(409).json({ error: 'Ya existe un cliente con ese teléfono' });
        return;
      }

      const nuevoCliente = {
        telefono,
        nombre,
        direccion,
        referencia,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const docRef = await clientesRef.add(nuevoCliente);
      nuevoCliente._id = docRef.id;

      res.status(201).json({ cliente: nuevoCliente });
    } catch (error) {
      console.error('Error creando cliente:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
});

// Función para obtener menú
exports.obtenerMenu = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method === 'GET') {
    try {
      const menuRef = db.collection('menu');
      const snapshot = await menuRef.orderBy('nombre').get();
      
      const menuItems = [];
      snapshot.forEach(doc => {
        const item = doc.data();
        item._id = doc.id;
        menuItems.push(item);
      });

      res.json({ menuItems });
    } catch (error) {
      console.error('Error obteniendo menú:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  } else if (req.method === 'POST') {
    try {
      const { nombre, precioChico, precioMediano, precioGrande, precioFamiliar } = req.body;

      if (!nombre || precioChico === undefined || precioMediano === undefined || 
          precioGrande === undefined || precioFamiliar === undefined) {
        res.status(400).json({ error: 'Todos los campos son requeridos' });
        return;
      }

      const nuevoMenuItem = {
        nombre: nombre.trim(),
        precioChico: Number(precioChico),
        precioMediano: Number(precioMediano),
        precioGrande: Number(precioGrande),
        precioFamiliar: Number(precioFamiliar),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const menuRef = db.collection('menu');
      const docRef = await menuRef.add(nuevoMenuItem);
      nuevoMenuItem._id = docRef.id;

      res.status(201).json({ menuItem: nuevoMenuItem });
    } catch (error) {
      console.error('Error creando item del menú:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
});

// Función para crear pedidos
exports.crearPedido = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method === 'POST') {
    try {
      const { clienteId, telefono, nombre, direccion, referencia, items, total } = req.body;

      if (!clienteId || !telefono || !nombre || !direccion || !referencia || !items || total === undefined) {
        res.status(400).json({ error: 'Todos los campos son requeridos' });
        return;
      }

      if (items.length === 0) {
        res.status(400).json({ error: 'El pedido debe tener al menos un item' });
        return;
      }

      const nuevoPedido = {
        clienteId,
        telefono,
        nombre,
        direccion,
        referencia,
        items,
        total: Number(total),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        estado: 'pendiente'
      };

      const pedidosRef = db.collection('pedidos');
      const docRef = await pedidosRef.add(nuevoPedido);
      nuevoPedido._id = docRef.id;

      res.status(201).json({ pedido: nuevoPedido });
    } catch (error) {
      console.error('Error creando pedido:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
});

// Función para poblar datos iniciales
exports.poblarDatosIniciales = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'POST') {
    try {
      // Verificar si ya existen datos
      const menuSnapshot = await db.collection('menu').get();
      const clientesSnapshot = await db.collection('clientes').get();

      if (!menuSnapshot.empty || !clientesSnapshot.empty) {
        res.status(409).json({ error: 'Ya existen datos en la base de datos' });
        return;
      }

      // Datos de ejemplo para el menú
      const menuEjemplo = [
        {
          nombre: 'Pizza Margherita',
          precioChico: 120.00,
          precioMediano: 180.00,
          precioGrande: 240.00,
          precioFamiliar: 320.00,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        {
          nombre: 'Pizza Pepperoni',
          precioChico: 140.00,
          precioMediano: 200.00,
          precioGrande: 260.00,
          precioFamiliar: 340.00,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        {
          nombre: 'Pizza Hawaiana',
          precioChico: 150.00,
          precioMediano: 220.00,
          precioGrande: 280.00,
          precioFamiliar: 360.00,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }
      ];

      // Datos de ejemplo para clientes
      const clientesEjemplo = [
        {
          telefono: '1234567890',
          nombre: 'Juan Pérez',
          direccion: 'Av. Principal 123, Col. Centro',
          referencia: 'Frente al parque',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }
      ];

      // Insertar menú
      const menuRef = db.collection('menu');
      for (const item of menuEjemplo) {
        await menuRef.add(item);
      }

      // Insertar clientes
      const clientesRef = db.collection('clientes');
      for (const cliente of clientesEjemplo) {
        await clientesRef.add(cliente);
      }

      res.json({ 
        message: 'Datos iniciales poblados correctamente',
        menuItems: menuEjemplo.length,
        clientes: clientesEjemplo.length
      });
    } catch (error) {
      console.error('Error poblando datos iniciales:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}); 