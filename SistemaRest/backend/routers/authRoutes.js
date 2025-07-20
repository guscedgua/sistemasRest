// backend/routes/authRoutes.js
import { Router } from 'express';
// Importa las funciones del controlador de autenticación
import { login, refreshTokenMiddleware, logout, getProfile, registerUser } from '../controllers/authController.js';
// CORRECCIÓN: Importa el middleware 'auth' desde el archivo correcto
import { auth } from '../middleware/auth.js'; 

const router = Router();

// Rutas de autenticación
router.post('/register', registerUser);
router.post('/login', login);
router.post('/refresh-token', refreshTokenMiddleware); // Apunta a tu función correcta
router.post('/logout', logout);
router.get('/profile', auth, getProfile); // Ruta protegida con el middleware 'auth'

export default router;
