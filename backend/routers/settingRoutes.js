// backend/routers/settingRoutes.js
import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingController.js';
import { auth, adminCheck, roleCheck } from '../middleware/auth.js'; // Asegúrate de que estas importaciones sean correctas

const router = express.Router();

// Ruta para obtener la configuración del sistema
// Requiere autenticación y el rol de 'admin' para acceder
router.get('/', auth, roleCheck(['admin']), getSettings);

// Ruta para actualizar la configuración del sistema
// Requiere autenticación y el rol de 'admin' para acceder
router.put('/', auth, roleCheck(['admin']), updateSettings);
// O si usas PATCH para actualizaciones parciales:
// router.patch('/', auth, roleCheck(['admin']), updateSettings);

export default router;
