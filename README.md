# CHETEGAMIS - Sistema de Pizzería

Sistema de pedidos para la pizzería CHETEGAMIS desarrollado con Next.js 15, TypeScript y MongoDB Atlas.

## 🚀 Características

- **Búsqueda de clientes** por número de teléfono
- **Registro de nuevos clientes** si no existen
- **Menú de pizzas** con 4 tamaños y precios
- **Sistema de pedidos** con selección de items y cantidades
- **Cálculo automático** de totales
- **Impresión de órdenes** con formato profesional
- **Diseño responsivo** con colores de pizzería

## 🎨 Colores del Tema

- **Rojo llamativo**: `#DC2626` (pizza-red)
- **Amarillo**: `#F59E0B` (pizza-yellow) 
- **Crema**: `#FEF3C7` (pizza-cream)
- **Rojo oscuro**: `#991B1B` (pizza-dark)
- **Rojo claro**: `#FEE2E2` (pizza-light)

## 🛠️ Tecnologías

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS con colores personalizados
- **Base de Datos**: MongoDB Atlas
- **Deployment**: Vercel (recomendado)

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Cuenta de MongoDB Atlas
- Cuenta de Vercel (opcional, para deployment)

## 🚀 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/Diskiro/chetegamis.git
   cd chetegamis
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   
   Crea un archivo `.env.local` en la raíz del proyecto:
   ```env
   MONGODB_URI=mongodb+srv://joshuamedel1994:Chetegamis654@chetegamis.bmhhpvn.mongodb.net/?retryWrites=true&w=majority&appName=Chetegamis
   NODE_ENV=development
   ```

   **Importante**: Reemplaza `username`, `password` y `cluster` con tus credenciales de MongoDB Atlas.

4. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

5. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 🗄️ Configuración de MongoDB Atlas

### 1. Crear Cluster
- Ve a [MongoDB Atlas](https://cloud.mongodb.com)
- Crea un nuevo cluster (gratuito disponible)
- Selecciona tu región preferida

### 2. Configurar Usuario de Base de Datos
- En "Database Access", crea un nuevo usuario
- Asigna permisos de "Read and write to any database"
- Guarda las credenciales

### 3. Configurar Red
- En "Network Access", agrega tu IP o `0.0.0.0/0` para acceso global
- Para Vercel, agrega `0.0.0.0/0`

### 4. Obtener Connection String
- En "Connect", selecciona "Connect your application"
- Copia la cadena de conexión
- Reemplaza `<password>` con la contraseña del usuario

## 📊 Estructura de la Base de Datos

### Colección: `clientes`
```typescript
{
  _id: ObjectId,
  telefono: string,      // 10 dígitos, único
  nombre: string,        // Nombre completo
  direccion: string,     // Dirección completa
  referencia: string,    // Puntos de referencia
  createdAt: Date,
  updatedAt: Date
}
```

### Colección: `menu`
```typescript
{
  _id: ObjectId,
  nombre: string,        // Nombre de la pizza
  precioChico: number,   // Precio tamaño chico
  precioMediano: number, // Precio tamaño mediano
  precioGrande: number,  // Precio tamaño grande
  precioFamiliar: number,// Precio tamaño familiar
  createdAt: Date,
  updatedAt: Date
}
```

### Colección: `pedidos`
```typescript
{
  _id: ObjectId,
  clienteId: string,     // ID del cliente
  telefono: string,      // Teléfono del cliente
  nombre: string,        // Nombre del cliente
  direccion: string,     // Dirección del cliente
  referencia: string,    // Referencia del cliente
  items: PedidoItem[],   // Array de items del pedido
  total: number,         // Total del pedido
  createdAt: Date
}
```

## 🌐 Deployment en Vercel

1. **Conectar repositorio**
   - Ve a [Vercel](https://vercel.com)
   - Conecta tu repositorio de GitHub/GitLab

2. **Configurar variables de entorno**
   - En el dashboard de Vercel, ve a Settings > Environment Variables
   - Agrega `MONGODB_URI` con tu cadena de conexión de MongoDB Atlas

3. **Deploy**
   - Vercel detectará automáticamente que es un proyecto Next.js
   - Haz commit y push para trigger automático del deploy

## 📱 Uso del Sistema

### 1. Búsqueda de Cliente
- Ingresa un número de teléfono de 10 dígitos
- El botón "Buscar" se activa automáticamente
- Si el cliente existe, se muestran sus datos

### 2. Registro de Nuevo Cliente
- Si el cliente no existe, se despliega un formulario
- Completa: nombre, dirección y referencia
- Guarda los datos en la base de datos

### 3. Realización del Pedido
- Se muestra la tabla del menú con todos los items
- Selecciona pizzas y tamaños con checkboxes
- Ajusta cantidades según necesites
- El total se calcula automáticamente

### 4. Impresión de Orden
- Al hacer clic en "Imprimir Orden":
  - Se guarda el pedido en la base de datos
  - Se abre una ventana de impresión
  - Se imprime la orden con formato profesional
  - El sistema se reinicia automáticamente

## 🔧 Personalización

### Agregar Nuevas Pizzas al Menú
1. Ve a la colección `menu` en MongoDB Atlas
2. Agrega un nuevo documento con la estructura del menú
3. Los cambios se reflejan automáticamente en la aplicación

### Modificar Colores
1. Edita `tailwind.config.ts`
2. Modifica los colores en la sección `extend.colors`
3. Reinicia el servidor de desarrollo

### Cambiar Logo
1. Reemplaza el emoji 🍕 en `Header.tsx`
2. O agrega una imagen en `public/` y referenciala

## 🐛 Solución de Problemas

### Error de Conexión a MongoDB
- Verifica que `MONGODB_URI` esté correctamente configurado
- Asegúrate de que tu IP esté en la whitelist de MongoDB Atlas
- Verifica que el usuario tenga permisos correctos

### Error de Build en Vercel
- Verifica que todas las variables de entorno estén configuradas
- Revisa los logs de build en Vercel
- Asegúrate de que el proyecto compile localmente

### Problemas de Rendimiento
- La aplicación está optimizada para Next.js 15
- Considera usar MongoDB Atlas M10+ para producción
- Implementa caching si es necesario

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Para soporte técnico o preguntas:
- Abre un issue en GitHub
- Contacta al equipo de desarrollo

---

**CHETEGAMIS** - La mejor pizza de la ciudad 🍕
