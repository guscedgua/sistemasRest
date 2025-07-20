// backend/routers/dashboardRoutes.js
import express from 'express';
const router = express.Router();

// CORRECCIÓN: Importa el controlador principal que maneja todas las métricas
import { getDashboardMetrics } from '../controllers/dashboardController.js';
// Importa los middlewares de autenticación y autorización
import { auth, roleCheck, adminCheck, supervisorCheck, meseroCheck, cocineroCheck } from '../middleware/auth.js';

/**
 * @route GET /api/dashboard?metric=<metricName>
 * @desc Obtener métricas del dashboard (órdenes hoy, ventas, estado de mesas, etc.)
 * @access Private (roles específicos)
 */
router.get(
  '/',
  auth, // Asegura que el usuario esté autenticado
  roleCheck([
    // Define los roles que pueden acceder a las métricas del dashboard
    // Puedes ajustar esto según tus necesidades de seguridad
    'admin',
    'supervisor',
    'mesero',
    'cocinero'
  ]),
  getDashboardMetrics // CORRECCIÓN: El controlador que maneja la lógica de las métricas
);

export default router;
