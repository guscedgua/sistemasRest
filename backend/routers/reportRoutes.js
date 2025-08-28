// backend/routers/reportRoutes.js
import express from 'express';
import { getSalesReport, getInventoryReport } from '../controllers/reportController.js';
import { auth, roleCheck } from '../middleware/auth.js'; // Import auth and roleCheck

const router = express.Router();

// @desc    Obtener informe de ventas
// @route   GET /api/reports/sales
// @access  Private (admin, supervisor)
router.get('/sales', auth, roleCheck(['admin', 'supervisor']), getSalesReport);

// @desc    Obtener informe de inventario
// @route   GET /api/reports/inventory
// @access  Private (admin, supervisor)
router.get('/inventory', auth, roleCheck(['admin', 'supervisor']), getInventoryReport);

export default router; // 👈 Exportación por defecto
