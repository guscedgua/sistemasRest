// backend/config/authController.js

// Importa las dependencias necesarias
import admin from 'firebase-admin';
import User from '../models/User.js';
import { ROLES } from '../config/roles.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Token de acceso requerido' });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Adjuntar información del usuario al request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      // Agregar más campos si son necesarios
    };
    
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(403).json({ success: false, message: 'Token inválido o expirado' });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios.' });
    }

    if (!Object.values(ROLES).includes(role)) {
      return res.status(400).json({ success: false, message: 'Rol de usuario inválido.' });
    }

    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: name,
    });

    const newUser = await User.create({
      firebaseUid: userRecord.uid,
      name,
      email,
      role
    });

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });

  } catch (error) {
    console.error('Error al registrar usuario:', error);
    if (error.code === 'auth/email-already-in-use') {
      return res.status(409).json({ success: false, message: 'El usuario ya existe con este correo electrónico.' });
    }
    res.status(500).json({
      success: false,
      message: 'Error en el servidor al registrar usuario',
      systemError: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor',
    });
  }
};



export const logout = async (req, res) => {
    // La sesión se maneja en el frontend.
    // Simplemente respondemos que la acción ha sido exitosa.
    res.status(200).json({ success: true, message: 'Sesión cerrada exitosamente.' });
};

/**
 * @desc Cerrar sesión de todas las sesiones de un usuario
 * @route POST /api/auth/logoutAll
 * @access Private
 */
export const logoutAllSessions = async (req, res) => {
  try {
    await admin.auth().revokeRefreshTokens(req.user.uid);
    res.status(200).json({ success: true, message: 'Todas las sesiones han sido cerradas.' });
  } catch (error) {
    console.error('Error al cerrar todas las sesiones:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor al cerrar todas las sesiones.' });
  }
};
