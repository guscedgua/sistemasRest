// backend/routers/configRoutes.js
import express from 'express';
// --- ¡CAMBIO AQUÍ! ---
// Importa el objeto completo 'configController'
import { configController } from '../controllers/configController.js';
// Asumo que tu middleware de autenticación/autorización sigue siendo auth.js
import { auth, roleCheck } from '../middleware/auth.js';

const router = express.Router();

// @desc    Obtener configuración actual
// @route   GET /api/config
// @access  Private (ej. admin, supervisor, o cualquier rol que pueda ver la config)
router.get(
    '/',
    auth, // Asegura que el usuario esté autenticado
    roleCheck(['admin', 'supervisor', 'empleado']), // Ajusta los roles según quién puede ver la config
    configController.getConfig // <-- Accede a la función a través del objeto importado
);

// @desc    Actualizar configuración
// @route   PUT /api/config (o PATCH)
// @access  Private (ej. admin)
router.put( // O router.patch si prefieres ese método
    '/',
    auth, // Asegura que el usuario esté autenticado
    roleCheck(['admin']), // Solo los administradores pueden actualizar la config
    configController.updateConfig // <-- Accede a la función a través del objeto importado
);

export default router;