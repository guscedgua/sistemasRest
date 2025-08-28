// backend/routers/kitchenRoutes.js
import express from 'express';

// --- ¡CAMBIOS AQUÍ! ---
// 1. Importa 'auth' y 'roleCheck' como exportaciones con nombre (entre llaves {})
import { auth, roleCheck } from '../middleware/auth.js';
// 2. Importa el objeto 'kitchenController' completo
import { kitchenController } from '../controllers/kitchenController.js';


const router = express.Router();

// @desc    Obtener pedidos pendientes para la cocina
// @route   GET /api/kitchen/pending-orders
// @access  Private (roles como 'cocinero', 'mesero', 'admin')
router.get(
    '/pending-orders', // Una ruta más específica para los pedidos pendientes
    auth, // Asegura que el usuario esté autenticado
    // Solo roles que manejan la cocina (cocinero, mesero) o un admin
    roleCheck(['cocinero', 'mesero', 'admin']),
    kitchenController.getPendingOrders // <-- Accede a la función a través del objeto importado
);

// @desc    Marcar un pedido como listo
// @route   PUT /api/kitchen/orders/:id/ready
// @access  Private (roles como 'cocinero', 'admin')
router.put(
    '/orders/:id/ready', // Usa un parámetro de ID para identificar el pedido
    auth, // Asegura que el usuario esté autenticado
    // Solo roles que pueden marcar pedidos como listos
    roleCheck(['cocinero', 'admin']),
    kitchenController.markOrderReady // <-- Accede a la función a través del objeto importado
);


export default router;