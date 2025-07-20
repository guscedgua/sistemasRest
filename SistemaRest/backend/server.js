// backend/server.js
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
// CORRECCIÓN: Se eliminó el '=' extra en la importación de fileURLToPath
import { fileURLToPath } from 'url'; 

// Importar conexión a la base de datos
import connectDB from './config/db.js';

// Importar rutas
import authRoutes from './routers/authRoutes.js';
import adminRoutes from './routers/adminRoutes.js';
import configRoutes from './routers/configRoutes.js';
import ingredientRoutes from './routers/ingredientRoutes.js';
import inventoryRoutes from './routers/inventoryRoutes.js';
import kitchenRoutes from './routers/kitchenRoutes.js';
import orderRoutes from './routers/orderRoutes.js';
import productRoutes from './routers/productRoutes.js';
import recipeRoutes from './routers/recipeRoutes.js';
import tableRoutes from './routers/tableRoutes.js';
import dashboardRoutes from './routers/dashboardRoutes.js';
// CORRECTED: Using the singular variable 'settingRoutes' for consistency
import settingRoutes from './routers/settingRoutes.js'; 
import reportRoutes from './routers/reportRoutes.js';
import supplierRoutes from './routers/supplierRoutes.js';
import userRoutes from './routers/userRoutes.js'; 

// Importar middlewares de error
import { errorHandler } from './middleware/errorHandler.js'; // CORRECCIÓN: Asegura que no haya '=' extra

dotenv.config();
connectDB();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Middlewares globales (CORS, JSON, URL-encoded, CookieParser) ---
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];
        // Si el origen no está presente (ej. para solicitudes directas o de Postman), o está en la lista permitida
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`Not allowed by CORS: ${origin}`), false);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// CORRECCIÓN CLAVE: Se cambió '/{*any}' a '*' para compatibilidad con Express v4
app.options('*', cors({
    origin: (origin, callback) => {
        const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];
        // Si el origen no está presente (ej. para solicitudes directas o de Postman), o está en la lista permitida
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`Not allowed by CORS: ${origin}`), false);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// --- Definición de Rutas API ---
console.log('--- Aplicando rutas API ---');
app.use('/api/auth', authRoutes);
console.log('Ruta /api/auth aplicada.');
app.use('/api/admin', adminRoutes);
console.log('Ruta /api/admin aplicada.');
app.use('/api/config', configRoutes);
console.log('Ruta /api/config aplicada.');
app.use('/api/ingredients', ingredientRoutes);
console.log('Ruta /api/ingredients aplicada.');
app.use('/api/inventory', inventoryRoutes);
console.log('Ruta /api/inventory aplicada.');
app.use('/api/kitchen', kitchenRoutes);
console.log('Ruta /api/kitchen aplicada.');
app.use('/api/orders', orderRoutes);
console.log('Ruta /api/orders aplicada.');
app.use('/api/products', productRoutes);
console.log('Ruta /api/products aplicada.');
app.use('/api/recipes', recipeRoutes);
console.log('Ruta /api/recipes aplicada.');
app.use('/api/tables', tableRoutes);
console.log('Ruta /api/tables aplicada.');
app.use('/api/dashboard', dashboardRoutes);
console.log('Ruta /api/dashboard aplicada.');
// CORRECTED: Using the singular variable 'settingRoutes'
app.use('/api/settings', settingRoutes); 
console.log('Ruta /api/settings aplicada.');
app.use('/api/reports', reportRoutes);
console.log('Ruta /api/reports aplicada.');
app.use('/api/suppliers', supplierRoutes);
console.log('Ruta /api/suppliers aplicada.');
app.use('/api/users', userRoutes);
console.log('Ruta /api/users aplicada.');
console.log('Rutas API aplicadas.');


// --- Configuración para producción y ruta de bienvenida para desarrollo ---
const NODE_ENV = process.env.NODE_ENV || 'development';
if (NODE_ENV === 'production') {
    // Servir archivos estáticos del frontend
    app.use(express.static(path.join(__dirname, '../frontend/dist')));
    
    // CORRECCIÓN CLAVE: Se cambió '/{*any}' a '*' para compatibilidad con Express v4
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
    });
} else {
    // --- Ruta de bienvenida para desarrollo (MOVIDA DESPUÉS DE LAS RUTAS API) ---
    app.get('/', (req, res) => { 
        res.send('API del Sistema de Gestión de Restaurante está funcionando en modo desarrollo...');
    });
}

// --- Manejo de rutas no encontradas (404) ---
app.all('*', (req, res) => {
    // Añadir logs para depuración
    console.log(`DEBUG 404 Handler: Original URL: ${req.originalUrl}`);
    console.log(`DEBUG 404 Handler: Starts with /api: ${req.originalUrl.startsWith('/api')}`);

    if (req.originalUrl.startsWith('/api')) {
        // Respuesta JSON para rutas API no encontradas
        res.status(404).json({ 
            success: false,
            message: `Ruta API no encontrada: ${req.method} ${req.originalUrl}`
        });
    } else {
        // Respuesta HTML para rutas frontend no encontradas
        res.status(404).sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
    }
});

// --- Middlewares de manejo de errores ---
app.use(errorHandler);

const PORT = process.env.PORT || 5000; // Puerto configurado en 5000
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT} en modo ${NODE_ENV}`);
});
