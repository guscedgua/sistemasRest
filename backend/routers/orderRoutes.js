// backend/routers/orderRoutes.js
// Rutas para la gestión de órdenes.
import express from 'express';
import {
    createOrder,
    getAllOrders, // Now correctly used for GET /
    getOrderById,
    updateOrderStatus,
    markOrderPaid,
    deleteOrder,
    getTodaySummary // Already imported
} from '../controllers/orderController.js';

// Importamos los middlewares de autenticación y autorización desde tu archivo auth.js
import { auth, adminCheck, supervisorCheck, meseroCheck, cocineroCheck, roleCheck } from '../middleware/auth.js';
import { ROLES } from '../config/roles.js'; // Importamos los roles definidos

const router = express.Router();

console.log('--- Order Routes Loaded (Versión Final) ---'); // LOG para confirmar la carga del archivo de rutas

// Ruta para crear una nueva orden
// Requiere autenticación y roles: mesero, administrador, supervisor
router.post(
    '/',
    auth, // Middleware de autenticación principal
    meseroCheck, // Middleware de autorización (permite mesero, admin, supervisor según tu auth.js)
    (req, res, next) => { // Pequeño middleware para depuración
        console.log('Petición POST /api/orders recibida en la ruta. Pasando a createOrder.');
        next();
    },
    createOrder
);

// Ruta para obtener TODAS las órdenes
// Requiere autenticación y roles: administrador, supervisor, mesero
router.get(
    '/', // Correctly defines the root path for fetching all orders
    auth,
    roleCheck([ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.MESERO]), // Allow these roles to view all orders
    getAllOrders
);

// Ruta para obtener una orden por ID
// Requiere autenticación y roles: administrador, supervisor, mesero
router.get(
    '/:id', // Parámetro de ID correctamente nombrado
    auth,
    meseroCheck,
    getOrderById
);

// Ruta para actualizar el estado de una orden (ej. de 'pendiente' a 'en preparación', 'lista')
// Requiere autenticación y roles: cocinero, administrador
router.patch(
    '/:id/status', // Parámetro de ID correctamente nombrado
    auth,
    cocineroCheck,
    updateOrderStatus
);

// Ruta para marcar una orden como pagada
// Requiere autenticación y roles: mesero, administrador, supervisor
router.patch(
    '/:id/pay', // Parámetro de ID correctamente nombrado
    auth,
    meseroCheck,
    markOrderPaid
);

// Ruta para eliminar una orden
// Requiere autenticación y roles: administrador
router.delete(
    '/:id', // Parámetro de ID correctamente nombrado
    auth,
    adminCheck,
    deleteOrder
);

// Ruta para el resumen diario de órdenes
// Requiere autenticación y roles: mesero, administrador, supervisor
router.get('/summary/today', auth, meseroCheck, getTodaySummary);

export default router;
