// backend/routers/adminRoutes.js
import express from 'express';
import {
    auth,
    adminCheck,
    supervisorCheck
} from '../middleware/auth.js'; // Importación corregida de los middlewares

import {
    updateSystemSettings
} from '../controllers/adminController.js'; // Ajusta la ruta si es diferente
import {
    getUsers, // CAMBIO: Importa 'getUsers'
    getUserById,
    updateUser,
    deleteUser,
    createUser
} from '../controllers/userController.js';

const router = express.Router();

// @desc    Ruta de ejemplo para administradores
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
router.get('/dashboard', auth, adminCheck, (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Acceso concedido al dashboard de admin.'
    });
});


// Rutas para la gestión de usuarios por parte del administrador
router.route('/users')
    .post(auth, adminCheck, createUser)
    .get(auth, adminCheck, getUsers);

router.route('/users/:id')
    .get(auth, adminCheck, getUserById)
    .put(auth, adminCheck, updateUser)
    .delete(auth, adminCheck, deleteUser);

// Rutas para la configuración del sistema
router.route('/settings')
    .put(auth, adminCheck, updateSystemSettings);


export default router;