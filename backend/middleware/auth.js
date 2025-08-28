// backend/middlewares/auth.js
import admin from 'firebase-admin';
import User from '../models/User.js';
import { ROLES } from '../config/roles.js';



export const auth = async (req, res, next) => {
  try {
    console.log('Headers recibidos:', req.headers);
    
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No se proporcionó token o formato incorrecto');
      return res.status(401).json({ 
        success: false,
        message: 'Acceso denegado. Token no proporcionado.' 
      });
    }

    const token = authHeader.split(' ')[1];
    console.log('Token recibido:', token.substring(0, 50) + '...');
    
    // Verificar el token con Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log('Token decodificado:', decodedToken);
    
    // Buscar el usuario en la base de datos por Firebase UID
    const user = await User.findOne({ firebaseUid: decodedToken.uid });
    
    if (!user) {
      console.log('Usuario no encontrado en la base de datos para UID:', decodedToken.uid);
      return res.status(401).json({ 
        success: false,
        message: 'Usuario no encontrado en la base de datos.' 
      });
    }
    
    // Adjuntar información del usuario al request
    req.user = {
      id: user._id,
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: user.name,
      role: user.role
    };
    
    console.log('Usuario autenticado:', req.user);
    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    
    // Mensajes de error más específicos
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ 
        success: false,
        message: 'Token expirado. Por favor, inicie sesión nuevamente.' 
      });
    } else if (error.code === 'auth/id-token-revoked') {
      return res.status(401).json({ 
        success: false,
        message: 'Token revocado. Por favor, inicie sesión nuevamente.' 
      });
    } else if (error.code === 'auth/argument-error') {
      return res.status(401).json({ 
        success: false,
        message: 'Token malformado.' 
      });
    }
    
    res.status(401).json({ 
      success: false,
      message: 'Token inválido.',
      error: error.message
    });
  }
};

export const verifyTokenAndGetProfile = async (req, res) => {
    try {
        // Los datos del usuario ya están disponibles gracias al middleware auth
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Usuario no autenticado.' });
        }

        res.status(200).json({
            success: true,
            user: {
                id: req.user.id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
            },
        });
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor.',
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};

/**
 * Middleware para verificar roles de usuario
 */
export const roleCheck = (allowedRoles = []) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({
                success: false,
                message: 'No autenticado. El token no pudo ser validado o no se encontró el rol.'
            });
        }

        const userRole = req.user.role.toLowerCase();
        const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase());

        if (normalizedAllowedRoles.includes(userRole)) {
            return next();
        }

        res.status(403).json({
            success: false,
            message: `Acceso denegado. Tu rol ('${req.user.role}') no tiene permiso para esta acción.`,
            requiredRoles: allowedRoles
        });
    };
};

// Middlewares específicos por rol
export const adminCheck = roleCheck([ROLES.ADMIN]);
export const supervisorCheck = roleCheck([ROLES.ADMIN, ROLES.SUPERVISOR]);
export const meseroCheck = roleCheck([ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.MESERO]);
export const cocineroCheck = roleCheck([ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.COCINERO]);
export const staffCheck = roleCheck([ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.MESERO, ROLES.COCINERO]);
export const clientCheck = roleCheck([ROLES.CLIENTE]);