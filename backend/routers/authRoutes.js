// backend/routers/authRoutes.js

import { Router } from 'express';
// 💡 Es crucial importar el modelo User para poder usarlo en este archivo.
import User from '../models/User.js'; 

import { 
  registerUser, 
  logout, 
  logoutAllSessions 
} from '../config/authController.js';

import { 
  auth, 
  verifyTokenAndGetProfile
} from '../middleware/auth.js';


const router = Router();

// Rutas de autenticación
router.post('/register', registerUser);

// La ruta de perfil usa el middleware 'auth' y luego su lógica
router.get('/profile', auth, async (req, res) => {
  try {
    // Ahora 'User' está definido y la búsqueda funcionará correctamente
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado en la base de datos'
      });
    }
    
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener el perfil'
    });
  }
});

router.post('/logout', logout); 
router.post('/logoutAll', auth, logoutAllSessions);

// La ruta de verificación es correcta
router.post('/verify', auth, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user
  });
});

export default router;