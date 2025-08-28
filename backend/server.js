// backend/server.js
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import admin from 'firebase-admin';
import fs from 'fs';

// Importar rutas
import authRoutes from './routers/authRoutes.js';
import productRoutes from './routers/productRoutes.js';
import orderRoutes from './routers/orderRoutes.js';
import tableRoutes from './routers/tableRoutes.js';
import dashboardRoutes from './routers/dashboardRoutes.js';
import healthRoutes from './routers/healthRoutes.js';
import adminRoutes from './routers/adminRoutes.js';
import ingredientRoutes from './routers/ingredientRoutes.js';
import inventoryRoutes from './routers/inventoryRoutes.js';
import kitchenRoutes from './routers/kitchenRoutes.js';
import recipeRoutes from './routers/recipeRoutes.js';
import settingRoutes from './routers/settingRoutes.js';
import reportRoutes from './routers/reportRoutes.js';
import supplierRoutes from './routers/supplierRoutes.js';
import userRoutes from './routers/userRoutes.js';

// Configurar variables de entorno
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// --- INICIALIZAR FIREBASE ADMIN SDK ---
try {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (!serviceAccountPath) {
    throw new Error('La variable de entorno FIREBASE_SERVICE_ACCOUNT_PATH no está definida.');
  }

  const absolutePath = resolve(__dirname, serviceAccountPath);
  
  if (!fs.existsSync(absolutePath)) {
      throw new Error(`El archivo de clave de servicio de Firebase no se encuentra en la ruta: ${absolutePath}`);
  }

  // Cargar el archivo de clave de servicio
  const serviceAccount = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
  console.log('Firebase Admin SDK inicializado correctamente.');
} catch (error) {
  console.error('Error al inicializar Firebase Admin SDK:', error.message);
  // Un error crítico, salimos de la aplicación
  process.exit(1); 
}
// ------------------------------------

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Conectar a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurante_db';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Conectado a MongoDB'))
.catch(err => {
  console.error('Error conectando a MongoDB:', err);
  process.exit(1);
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/kitchen', kitchenRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/users', userRoutes);

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API del Sistema de Gestión de Restaurante está funcionando',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Manejo de rutas no encontradas
app.use('/api/*', (req, res) => {
  console.log(`Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: 'Endpoint no encontrado',
    message: `La ruta ${req.method} ${req.originalUrl} no existe`
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Error interno'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
  console.log('Entorno:', process.env.NODE_ENV || 'development');
  console.log('URL de MongoDB:', MONGODB_URI);
});
