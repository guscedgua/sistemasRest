// backend/routers/userRoutes.js
import express from 'express';
const router = express.Router();
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
} from '../controllers/userController.js';

// Importa tus middlewares de autenticación y autorización
import { auth, adminCheck, roleCheck } from '../middleware/auth.js';

// Rutas para /api/users
router.route('/')
  .post(auth, adminCheck, createUser) // Solo admin puede crear usuarios
  .get(auth, adminCheck, getUsers); // Solo admin puede obtener todos los usuarios

// Rutas para /api/users/:id
router.route('/:id')
  .get(auth, roleCheck(['admin', 'supervisor', 'mesero', 'cocinero', 'cliente']), getUserById) // Acceso controlado, el propio usuario o admin/supervisor
  .put(auth, roleCheck(['admin', 'supervisor', 'mesero', 'cocinero', 'cliente']), updateUser) // Acceso controlado para actualizar (admin o el propio usuario)
  .delete(auth, adminCheck, deleteUser); // Solo admin puede eliminar usuarios

export default router;
