const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();

// Utilidades comunes
const allowCors = (res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
};

const buildPreciosPorTamanio = ({ categoria, precioChico, precioMediano, precioGrande, precioFamiliar }) => {
  const mapa = {};
  if (categoria === 'Pizzas' || categoria === 'Especiales') {
    mapa['individual'] = Number(precioChico);
    mapa['chica'] = Number(precioMediano);
    mapa['mediana'] = Number(precioGrande);
    mapa['familiar'] = Number(precioFamiliar);
  } else if (categoria === 'Sandwich' || categoria === 'Hamburguesas de arrachera') {
    mapa['sencilla'] = Number(precioChico);
    mapa['doble'] = Number(precioMediano);
  } else {
    mapa['unico'] = Number(precioChico);
  }
  return mapa;
};

// Buscar/crear cliente (igual)
exports.buscarCliente = functions.https.onRequest(async (req, res) => {
  allowCors(res);
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
  if (req.method === 'GET') {
    try {
      const { telefono } = req.query;
      if (!telefono) { res.status(400).json({ error: 'Teléfono es requerido' }); return; }
      const clientesRef = db.collection('clientes');
      const snapshot = await clientesRef.where('telefono', '==', telefono).get();
      if (snapshot.empty) { res.json({ found: false }); return; }
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
      if (!telefono || !nombre || !direccion || !referencia) { res.status(400).json({ error: 'Todos los campos son requeridos' }); return; }
      if (telefono.length !== 10) { res.status(400).json({ error: 'El teléfono debe tener 10 dígitos' }); return; }
      const clientesRef = db.collection('clientes');
      const snapshot = await clientesRef.where('telefono', '==', telefono).get();
      if (!snapshot.empty) { res.status(409).json({ error: 'Ya existe un cliente con ese teléfono' }); return; }
      const nuevoCliente = { telefono, nombre, direccion, referencia, createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp() };
      const docRef = await clientesRef.add(nuevoCliente);
      nuevoCliente._id = docRef.id;
      res.status(201).json({ cliente: nuevoCliente });
    } catch (error) {
      console.error('Error creando cliente:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  } else { res.status(405).json({ error: 'Método no permitido' }); }
});

// Endpoints de menú por tabla
const createMenuHandlers = (collectionName, categoriaDefaultOrSet) => functions.https.onRequest(async (req, res) => {
  allowCors(res);
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }

  if (req.method === 'GET') {
    try {
      const ref = db.collection(collectionName);
      const snapshot = await ref.orderBy('nombre').get();
      const menuItems = [];
      snapshot.forEach(doc => { const item = doc.data(); item._id = doc.id; menuItems.push(item); });
      res.json({ menuItems });
    } catch (error) {
      console.error('Error obteniendo menú:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  } else if (req.method === 'POST') {
    try {
      const { nombre, precioChico, precioMediano, precioGrande, precioFamiliar, categoria, tamaniosHabilitados } = req.body;
      if (!nombre) { res.status(400).json({ error: 'Nombre es requerido' }); return; }
      // Validaciones por colección
      const categoriaEfectiva = categoria || categoriaDefaultOrSet;
      if (Array.isArray(categoriaDefaultOrSet)) {
        if (!categoria || !categoriaDefaultOrSet.includes(categoria)) {
          res.status(400).json({ error: `Categoria inválida. Debe ser una de: ${categoriaDefaultOrSet.join(', ')}` });
          return;
        }
      }

      // Reglas de precios según la categoría
      let requiere = 'uno';
      if (categoriaEfectiva === 'Pizzas' || categoriaEfectiva === 'Especiales') requiere = 'cuatro';
      else if (categoriaEfectiva === 'Sandwich' || categoriaEfectiva === 'Hamburguesas de arrachera') requiere = 'dos';

      if (requiere === 'cuatro' && (precioChico === undefined || precioMediano === undefined || precioGrande === undefined || precioFamiliar === undefined)) {
        res.status(400).json({ error: 'Faltan precios para los 4 tamaños' }); return;
      }
      if (requiere === 'dos' && (precioChico === undefined || precioMediano === undefined)) {
        res.status(400).json({ error: 'Faltan precios para Sencillo y Doble' }); return;
      }
      if (requiere === 'uno' && (precioChico === undefined)) {
        res.status(400).json({ error: 'Falta precio Único' }); return;
      }

      const preciosPorTamanio = buildPreciosPorTamanio({ categoria: categoriaEfectiva, precioChico, precioMediano, precioGrande, precioFamiliar });
      const tamaniosAuto = Array.isArray(tamaniosHabilitados) && tamaniosHabilitados.length > 0 ? tamaniosHabilitados : (
        requiere === 'cuatro' ? ['individual','chica','mediana','familiar'] : requiere === 'dos' ? ['sencilla','doble'] : ['unico']
      );

      const nuevoMenuItem = {
        nombre: nombre.trim(),
        categoria: categoriaEfectiva,
        tamaniosHabilitados: tamaniosAuto,
        preciosPorTamanio,
        precioChico: Number(precioChico || 0),
        precioMediano: Number(precioMediano || 0),
        precioGrande: Number(precioGrande || 0),
        precioFamiliar: Number(precioFamiliar || 0),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const ref = db.collection(collectionName);
      const docRef = await ref.add(nuevoMenuItem);
      nuevoMenuItem._id = docRef.id;
      res.status(201).json({ menuItem: nuevoMenuItem });
    } catch (error) {
      console.error('Error creando item del menú:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  } else { res.status(405).json({ error: 'Método no permitido' }); }
});

exports.obtenerMenuPizzasEspeciales = createMenuHandlers('menu_pizzas_especiales', ['Pizzas','Especiales']);
exports.obtenerMenuSandwichesHamburguesas = createMenuHandlers('menu_sandwiches_hamburguesas', ['Sandwich','Hamburguesas de arrachera']);
exports.obtenerMenuOtrosAlimentos = createMenuHandlers('menu_otros_alimentos', 'Otros alimentos');
exports.obtenerMenuBebidas = createMenuHandlers('menu_bebidas', 'Bebidas');
exports.obtenerMenuPastas = createMenuHandlers('menu_pastas', 'Pastas');

// Legacy obtenerMenu (se mantiene por compatibilidad)
exports.obtenerMenu = functions.https.onRequest(async (req, res) => {
  allowCors(res);
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }

  if (req.method === 'GET') {
    try {
      const menuRef = db.collection('menu');
      const snapshot = await menuRef.orderBy('nombre').get();
      const menuItems = [];
      snapshot.forEach(doc => { const item = doc.data(); item._id = doc.id; menuItems.push(item); });
      res.json({ menuItems });
    } catch (error) {
      console.error('Error obteniendo menú:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  } else if (req.method === 'POST') {
    try {
      const { nombre, precioChico, precioMediano, precioGrande, precioFamiliar, categoria, tamaniosHabilitados } = req.body;
      if (!nombre || precioChico === undefined || precioMediano === undefined || precioGrande === undefined || precioFamiliar === undefined) {
        res.status(400).json({ error: 'Todos los campos de precio son requeridos' }); return;
      }
      const preciosPorTamanio = buildPreciosPorTamanio({ categoria, precioChico, precioMediano, precioGrande, precioFamiliar });
      const nuevoMenuItem = {
        nombre: nombre.trim(),
        categoria: categoria || null,
        tamaniosHabilitados: Array.isArray(tamaniosHabilitados) ? tamaniosHabilitados : null,
        preciosPorTamanio,
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
  } else { res.status(405).json({ error: 'Método no permitido' }); }
});

// Crear pedido (igual)
exports.crearPedido = functions.https.onRequest(async (req, res) => {
  allowCors(res);
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
  if (req.method === 'POST') {
    try {
      const { numeroOrden, clienteId, telefono, nombre, direccion, referencia, empleado, items, total } = req.body;
      if (!numeroOrden || !clienteId || !telefono || !nombre || !direccion || !referencia || !empleado || !items || total === undefined) { 
        res.status(400).json({ error: 'Todos los campos son requeridos' }); 
        return; 
      }
      if (items.length === 0) { res.status(400).json({ error: 'El pedido debe tener al menos un item' }); return; }
      const nuevoPedido = { 
        numeroOrden, 
        clienteId, 
        telefono, 
        nombre, 
        direccion, 
        referencia, 
        empleado, 
        items, 
        total: Number(total), 
        createdAt: admin.firestore.FieldValue.serverTimestamp(), 
        estado: 'pendiente' 
      };
      const pedidosRef = db.collection('pedidos');
      const docRef = await pedidosRef.add(nuevoPedido);
      nuevoPedido._id = docRef.id;
      res.status(201).json({ pedido: nuevoPedido });
    } catch (error) { console.error('Error creando pedido:', error); res.status(500).json({ error: 'Error interno del servidor' }); }
  } else { res.status(405).json({ error: 'Método no permitido' }); }
});

// Poblar datos (sin cambios)
exports.poblarDatosIniciales = functions.https.onRequest(async (req, res) => {
  allowCors(res);
  if (req.method === 'POST') {
    try {
      const menuSnapshot = await db.collection('menu').get();
      const clientesSnapshot = await db.collection('clientes').get();
      if (!menuSnapshot.empty || !clientesSnapshot.empty) { res.status(409).json({ error: 'Ya existen datos en la base de datos' }); return; }
      const menuEjemplo = [
        { nombre: 'Pizza Margherita', precioChico: 120.00, precioMediano: 180.00, precioGrande: 240.00, precioFamiliar: 320.00, createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp() },
      ];
      const clientesEjemplo = [ { telefono: '1234567890', nombre: 'Juan Pérez', direccion: 'Av. Principal 123, Col. Centro', referencia: 'Frente al parque', createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp() } ];
      const menuRef = db.collection('menu');
      for (const item of menuEjemplo) { await menuRef.add(item); }
      const clientesRef = db.collection('clientes');
      for (const cliente of clientesEjemplo) { await clientesRef.add(cliente); }
      res.json({ message: 'Datos iniciales poblados correctamente', menuItems: menuEjemplo.length, clientes: clientesEjemplo.length });
    } catch (error) { console.error('Error poblando datos iniciales:', error); res.status(500).json({ error: 'Error interno del servidor' }); }
  } else { res.status(405).json({ error: 'Método no permitido' }); }
}); 