# 🍕 CHETEGAMIS - Sistema de Pizzería

Sistema completo de gestión de pedidos para la pizzería CHETEGAMIS, construido con **Next.js 15**, **TypeScript**, **Tailwind CSS** y **Firebase**.

## ✨ Características Principales

- 🔍 **Búsqueda de Clientes** por número de teléfono
- 👤 **Gestión de Clientes** (crear nuevos, ver existentes)
- 🍕 **Menú Dinámico** con precios por tamaños
- 📝 **Sistema de Pedidos** completo
- 🖨️ **Impresión de Órdenes** automática
- 📱 **Diseño Responsivo** para todos los dispositivos
- 🎨 **UI/UX Moderna** con colores de pizzería

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Next.js 15, React 19, TypeScript
- **Estilos**: Tailwind CSS con paleta personalizada
- **Backend**: Firebase Functions
- **Base de Datos**: Firestore (Firebase)
- **Hosting**: Firebase Hosting
- **Autenticación**: Firebase Auth (preparado para futuro)

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+ 
- npm o yarn
- Cuenta de Firebase

### 1. Clonar el Proyecto

```bash
git clone <tu-repositorio>
cd chetegamis
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Firebase

#### 3.1 Crear Proyecto en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto llamado "chetegamis"
3. Habilita **Firestore Database** y **Hosting**

#### 3.2 Configurar Firestore

1. En Firestore, crea las siguientes colecciones:
   - `clientes` - Para almacenar información de clientes
   - `menu` - Para almacenar items del menú
   - `pedidos` - Para almacenar historial de pedidos

#### 3.3 Configurar Reglas de Seguridad

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // Para desarrollo - cambiar en producción
    }
  }
}
```

#### 3.4 Obtener Configuración

1. En Configuración del Proyecto > General
2. Copia la configuración de Firebase
3. Actualiza `src/lib/firebase.ts` con tus credenciales

### 4. Configurar Variables de Entorno

Crea un archivo `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
```

### 5. Inicializar Firebase

```bash
firebase login
firebase init
```

**Selecciona:**
- Hosting
- Functions
- Firestore
- Usa tu proyecto existente

### 6. Poblar Datos Iniciales

```bash
# Después del deploy, ejecuta esta función para crear datos de ejemplo
curl -X POST https://us-central1-tu-proyecto.cloudfunctions.net/poblarDatosIniciales
```

## 🏗️ Estructura del Proyecto

```
chetegamis/
├── src/
│   ├── app/                 # App Router de Next.js
│   ├── components/          # Componentes React
│   ├── lib/                 # Utilidades y configuración
│   └── models/              # Interfaces TypeScript
├── functions/               # Firebase Functions
├── public/                  # Archivos estáticos
├── firebase.json           # Configuración de Firebase
├── firestore.rules         # Reglas de seguridad de Firestore
└── firestore.indexes.json  # Índices de Firestore
```

## 📊 Estructura de la Base de Datos (Firestore)

### Colección: `clientes`
```typescript
{
  _id: string;           // ID único del documento (Firestore)
  telefono: string;      // Número de teléfono (10 dígitos)
  nombre: string;        // Nombre completo del cliente
  direccion: string;     // Dirección de entrega
  referencia: string;    // Puntos de referencia
  createdAt: Timestamp;  // Fecha de creación (Firestore Timestamp)
  updatedAt: Timestamp;  // Fecha de última actualización
}
```

### Colección: `menu`
```typescript
{
  _id: string;           // ID único del documento (Firestore)
  nombre: string;        // Nombre del item
  precioChico: number;   // Precio tamaño chico
  precioMediano: number; // Precio tamaño mediano
  precioGrande: number;  // Precio tamaño grande
  precioFamiliar: number; // Precio tamaño familiar
  createdAt: Timestamp;  // Fecha de creación (Firestore Timestamp)
  updatedAt: Timestamp;  // Fecha de última actualización
}
```

### Colección: `pedidos`
```typescript
{
  _id: string;           // ID único del documento (Firestore)
  clienteId: string;     // ID del cliente
  telefono: string;      // Teléfono del cliente
  nombre: string;        // Nombre del cliente
  direccion: string;     // Dirección del cliente
  referencia: string;    // Referencia del cliente
  items: PedidoItem[];   // Array de items del pedido
  total: number;         // Total del pedido
  estado: string;        // Estado del pedido ('pendiente', 'en_proceso', 'entregado')
  createdAt: Timestamp;  // Fecha de creación (Firestore Timestamp)
}
```

## 🚀 Despliegue

### Desplegar a Firebase

```bash
# Build del proyecto
npm run build:firebase

# Deploy completo
firebase deploy

# Solo hosting
firebase deploy --only hosting

# Solo functions
firebase deploy --only functions

# Solo Firestore
firebase deploy --only firestore
```

### URLs de Despliegue

- **Hosting**: `https://tu-proyecto.web.app`
- **Functions**: `https://us-central1-tu-proyecto.cloudfunctions.net`
- **Firestore**: Accesible desde Firebase Console

## 🎨 Personalización

### Colores de la Pizzería

Los colores están definidos en `tailwind.config.ts`:

```typescript
colors: {
  'pizza-red': '#DC2626',      // Rojo llamativo
  'pizza-yellow': '#F59E0B',   // Amarillo que combina
  'pizza-cream': '#FEF3C7',    // Color crema
  'pizza-dark': '#991B1B',     // Rojo oscuro
  'pizza-light': '#FEE2E2',    // Rojo claro
}
```

### Modificar el Logo

Reemplaza el emoji 🍕 en `src/components/Header.tsx` con tu logo personalizado.

## 🔧 Funciones de Firebase

### `buscarCliente`
- **GET**: Busca cliente por teléfono en Firestore
- **POST**: Crea nuevo cliente en Firestore

### `obtenerMenu`
- **GET**: Obtiene todos los items del menú desde Firestore
- **POST**: Agrega nuevo item al menú en Firestore

### `crearPedido`
- **POST**: Crea nuevo pedido en Firestore

### `poblarDatosIniciales`
- **POST**: Crea datos de ejemplo en Firestore (solo una vez)

## 🐛 Solución de Problemas

### Error: "Functions not found"
```bash
firebase deploy --only functions
```

### Error: "Hosting not configured"
```bash
firebase init hosting
```

### Error: "Firestore rules not set"
```bash
firebase deploy --only firestore:rules
```

### Error: "Build failed"
```bash
npm run build:firebase
# Verifica que no haya errores de TypeScript
```

## 📱 Uso de la Aplicación

### 1. Búsqueda de Cliente
- Ingresa un número de teléfono de 10 dígitos
- Si existe, se muestra la información desde Firestore
- Si no existe, se abre formulario de creación

### 2. Creación de Cliente
- Completa nombre, dirección y referencia
- El teléfono se pre-llena automáticamente
- Los datos se guardan en Firestore

### 3. Selección de Menú
- Marca los items que quieres ordenar
- Selecciona el tamaño (chico, mediano, grande, familiar)
- Ajusta la cantidad
- Los datos del menú vienen de Firestore

### 4. Finalización del Pedido
- Revisa el resumen del pedido
- Imprime la orden
- El pedido se guarda en Firestore
- La aplicación se reinicia automáticamente

## 🔒 Seguridad

### Reglas de Firestore (Producción)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /clientes/{clienteId} {
      allow read, write: if request.auth != null;
    }
    match /menu/{menuId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /pedidos/{pedidoId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🚀 Próximas Funcionalidades

- [ ] **Autenticación de Usuarios** con Firebase Auth
- [ ] **Panel de Administración** para empleados
- [ ] **Historial de Pedidos** por cliente
- [ ] **Notificaciones Push** para estado del pedido
- [ ] **Sistema de Pagos** integrado
- [ ] **Reportes y Estadísticas** de ventas

## 📞 Soporte

Para soporte técnico o preguntas sobre el proyecto:

- **Email**: [tu-email@ejemplo.com]
- **GitHub**: [tu-usuario/chetegamis]

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

---

**🍕 CHETEGAMIS - La mejor pizza de la ciudad 🍕**
