// backend/middleware/auth.js
// Middlewares para autenticación (verificación de token) y autorización (verificación de rol).
import jwt from 'jsonwebtoken';
import RefreshToken from '../models/RefreshToken.js';
import User from '../models/User.js';
import {
    generateAccessToken,
    generateRefreshToken,
    createSessionId,
} from '../utils/generateTokens.js';
import { ROLES } from '../config/roles.js'; // Asegúrate que este archivo existe y exporta ROLES

/**
 * @desc Registrar un nuevo usuario
 * @route POST /api/auth/register
 * @access Public
 */
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Validación básica
        if (!name || !email || !password || !role) {
            return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios.' });
        }

        // Validar si el rol es uno de los permitidos (opcional pero recomendado)
        if (!Object.values(ROLES).includes(role)) {
            return res.status(400).json({ success: false, message: 'Rol de usuario inválido.' });
        }

        // Verificar si el usuario ya existe
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'El usuario ya existe con este correo electrónico.' });
        }

        // Crear el nuevo usuario
        const user = await User.create({
            name,
            email,
            password, // El pre-save hook en tu modelo User debería hashear esto automáticamente
            role
        });

        // Generar sessionId y tokens como en el login (si quieres que inicie sesión automáticamente)
        const sessionId = createSessionId();
        user.sessionId = sessionId; // Asigna el sessionId al usuario
        await user.save(); // Guarda el usuario con el nuevo sessionId

        const accessToken = generateAccessToken(user, sessionId);
        const refreshToken = generateRefreshToken(user, sessionId);

        const refreshExpiresDays = parseInt(process.env.JWT_REFRESH_COOKIE_EXPIRE || 7);
        const expiresAtDb = new Date();
        expiresAtDb.setDate(expiresAtDb.getDate() + refreshExpiresDays);

        await RefreshToken.create({
            token: refreshToken,
            user: user._id,
            sessionId,
            expiresAt: expiresAtDb
        });

        const cookieOptions = {
            expires: new Date(Date.now() + refreshExpiresDays * 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            path: '/'
        };
        res.cookie('refreshToken', refreshToken, cookieOptions);


        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            accessToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });

    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor al registrar usuario',
            systemError: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor',
        });
    }
};


export const login = async (req, res) => {
    // --- NUEVOS LOGS DE DEPURACIÓN AL INICIO DE LA FUNCIÓN ---
    console.log('--- LOGIN CONTROLLER ---');
    console.log('DEBUG Login Controller: Request Headers:', req.headers);
    console.log('DEBUG Login Controller: Request Body (after express.json):', req.body);
    // --- FIN NUEVOS LOGS ---

    try {
        const { email, password } = req.body;
        if (!email || !password) {
            console.log('DEBUG Login: Email o contraseña faltantes.');
            return res.status(400).json({ success: false, message: "Email y contraseña son requeridos" });
        }
        console.log(`DEBUG Login: Intentando login para email: ${email}`);
        const user = await User.findOne({ email });
        if (!user) {
            console.log('DEBUG Login: Usuario no encontrado.');
            return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
        }
        console.log(`DEBUG Login: Usuario encontrado: ${user.email}`);
        console.log('Contraseña plana (candidatePassword):', password);
        console.log('Contraseña hasheada almacenada (this.password):', user.password); // No mostrar en producción
        const isMatch = await user.comparePassword(password);
        console.log('DEBUG Login: Resultado comparación contraseña (isMatch):', isMatch);
        if (!isMatch) {
            console.log('DEBUG Login: Contraseña incorrecta.');
            return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
        }
        console.log(`DEBUG Login: Contraseña correcta para usuario: ${user.email}`);

        const sessionId = createSessionId();
        user.sessionId = sessionId;
        await user.save();
        console.log('DEBUG Login: SessionId asignado y usuario guardado.');

        const accessToken = generateAccessToken(user, sessionId);
        const refreshToken = generateRefreshToken(user, sessionId);
        console.log('DEBUG Login: Access y Refresh tokens generados.');

        const refreshExpiresDays = parseInt(process.env.JWT_REFRESH_COOKIE_EXPIRE || 7);
        const expiresAtDb = new Date();
        expiresAtDb.setDate(expiresAtDb.getDate() + refreshExpiresDays);

        await RefreshToken.create({
            token: refreshToken,
            user: user._id,
            sessionId,
            expiresAt: expiresAtDb
        });
        console.log('DEBUG Login: RefreshToken guardado en DB.');

        const cookieOptions = {
            expires: new Date(Date.now() + refreshExpiresDays * 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            path: '/'
        };

        res.cookie('refreshToken', refreshToken, cookieOptions);
        console.log('DEBUG Login: Cookie de refreshToken establecida.');

        res.status(200).json({
            success: true,
            message: 'Inicio de sesión exitoso',
            accessToken,
            user: {
                id: user._id,
                role: user.role,
                name: user.name,
                email: user.email
            }
        });
        console.log('DEBUG Login: Respuesta de login enviada.');

    } catch (error) {
        console.error('Login error (Backend):', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor al iniciar sesión',
            systemError: process.ENV.NODE_ENV === 'development' ? error.message : 'Error interno del servidor',
        });
    }
};

/**
 * Middleware para refrescar tokens
 */
export const refreshTokenMiddleware = async (req, res) => {
    const storedRefreshToken = req.cookies?.refreshToken;
    console.log('--- REFRESH TOKEN MIDDLEWARE ---');
    console.log('Refresh Token recibido en cookies:', storedRefreshToken ? 'Sí' : 'No');
    if (storedRefreshToken) {
        console.log('Primeros 10 caracteres del Refresh Token:', storedRefreshToken.substring(0, 10) + '...');
    }

    const commonCookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        path: '/'
    };

    if (!storedRefreshToken) {
        console.log('ERROR: NO_REFRESH_TOKEN - No se encontró el token en las cookies.');
        return res.status(403).json({
            success: false,
            code: 'NO_REFRESH_TOKEN',
            message: 'No se encontró el token de refresco en las cookies.'
        });
    }

    try {
        const storedTokenDoc = await RefreshToken.findOne({
            token: storedRefreshToken,
            revoked: false
        }).populate('user');

        if (!storedTokenDoc || !storedTokenDoc.user) {
            res.clearCookie('refreshToken', commonCookieOptions);
            console.log('ERROR: INVALID_REFRESH_TOKEN_DB - Token no encontrado en DB, revocado o sin usuario asociado.');
            return res.status(403).json({
                success: false,
                code: 'INVALID_REFRESH_TOKEN_DB',
                message: 'Token de refresco inválido o revocado (no encontrado en DB o sin usuario asociado).'
            });
        }
        console.log('Token encontrado en DB. Usuario asociado:', storedTokenDoc.user.email);
        console.log('Token DB expira en:', storedTokenDoc.expiresAt);
        if (storedTokenDoc.expiresAt < new Date()) {
            await storedTokenDoc.deleteOne(); // Eliminar token expirado
            res.clearCookie('refreshToken', commonCookieOptions);
            console.log('ERROR: REFRESH_TOKEN_EXPIRED_DB - El token de refresco en la DB ha expirado.');
            return res.status(403).json({
                success: false,
                code: 'REFRESH_TOKEN_EXPIRED_DB',
                message: 'El token de refresco ha expirado y ha sido invalidado.'
            });
        }


        let decoded;
        try {
            decoded = jwt.verify(storedRefreshToken, process.env.REFRESH_TOKEN_SECRET);
            console.log('Token JWT verificado. Decodificado ID:', decoded.id, 'SessionId:', decoded.sessionId);
        } catch (err) {
            await storedTokenDoc.deleteOne(); // Invalida el token en DB si el JWT es inválido
            res.clearCookie('refreshToken', commonCookieOptions);

            if (err.name === 'TokenExpiredError') {
                console.log('ERROR: REFRESH_TOKEN_EXPIRED_JWT - El token JWT ha expirado.');
                return res.status(403).json({
                    success: false,
                    code: 'REFRESH_TOKEN_EXPIRED_JWT',
                    message: 'El token de refresco ha expirado y ha sido invalidado.'
                });
            }
            console.log('ERROR: INVALID_REFRESH_TOKEN_JWT_VERIFICATION - Error de verificación JWT:', err.message);
            return res.status(403).json({
                success: false,
                code: 'INVALID_REFRESH_TOKEN_JWT_VERIFICATION',
                message: 'Token de refresco inválido (firma o formato incorrecto).'
            });
        }

        if (storedTokenDoc.user._id.toString() !== decoded.id ||
            storedTokenDoc.sessionId !== decoded.sessionId) {

            await storedTokenDoc.deleteOne(); // Eliminar el token si hay un mismatch
            res.clearCookie('refreshToken', commonCookieOptions);
            console.log('ERROR: REFRESH_TOKEN_ID_MISMATCH - Mismatch de ID de usuario/sesión. Posible secuestro.');
            return res.status(403).json({
                success: false,
                code: 'REFRESH_TOKEN_ID_MISMATCH',
                message: 'Token de refresco no corresponde al usuario o sesión. Posible intento de secuestro.'
            });
        }
        console.log('Validación de ID de usuario/sesión exitosa.');

        // Generar nuevos tokens
        const newAccessToken = generateAccessToken(storedTokenDoc.user, storedTokenDoc.sessionId);
        const newRefreshToken = generateRefreshToken(storedTokenDoc.user, storedTokenDoc.sessionId);

        // Marcar el token antiguo como revocado en la DB (o eliminarlo)
        storedTokenDoc.revoked = true; // O elimina el documento: await storedTokenDoc.deleteOne();
        await storedTokenDoc.save(); // Si lo marcas como revocado y lo mantienes

        // Crear el nuevo refresh token en la DB
        const refreshExpiresDays = parseInt(process.env.JWT_REFRESH_COOKIE_EXPIRE || 7);
        const newExpiresAt = new Date();
        newExpiresAt.setDate(newExpiresAt.getDate() + refreshExpiresDays);

        await RefreshToken.create({
            token: newRefreshToken,
            user: storedTokenDoc.user._id,
            sessionId: storedTokenDoc.sessionId, // Mantener el mismo sessionId
            expiresAt: newExpiresAt
        });

        // Establecer la nueva cookie de refresh token en la respuesta
        const newCookieOptions = {
            expires: new Date(Date.now() + refreshExpiresDays * 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            path: '/'
        };
        res.cookie('refreshToken', newRefreshToken, newCookieOptions);
        console.log('Nuevos tokens generados y cookie de refresh establecida.');


        // Enviar la respuesta con el nuevo access token y la información del usuario
        res.status(200).json({
            success: true,
            message: 'Tokens refrescados exitosamente.',
            accessToken: newAccessToken,
            user: {
                id: storedTokenDoc.user._id,
                role: storedTokenDoc.user.role,
                name: storedTokenDoc.user.name,
                email: storedTokenDoc.user.email,
            }
        });

    } catch (error) {
        console.error('Refresh Token Middleware error INESPERADO:', error);
        if (!res.headersSent) { // Prevenir error "Headers already sent"
            res.status(500).json({
                success: false,
                code: 'REFRESH_TOKEN_ERROR_UNEXPECTED',
                message: 'Error inesperado al refrescar token.'
            });
        }
    }
};

/**
 * Middleware de autenticación principal
 * Exportado como 'auth'
 */
export const auth = async (req, res, next) => {
    console.log('--- AUTH MIDDLEWARE ---');
    try {
        // Verificar cabecera de autorización
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                code: 'MISSING_TOKEN',
                message: 'Token de autenticación no proporcionado'
            });
        }

        // Extraer token
        const tokenParts = authHeader.split(' ');
        let token;
        if (tokenParts.length === 2 && tokenParts[0].toLowerCase() === 'bearer') {
            token = tokenParts[1];
        } else if (tokenParts.length === 1) { // Permite token sin prefijo "Bearer"
            token = tokenParts[0];
        } else {
            return res.status(401).json({
                success: false,
                code: 'INVALID_TOKEN_FORMAT',
                message: 'Formato de token inválido'
            });
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                code: 'EMPTY_TOKEN',
                message: 'Token de autenticación vacío'
            });
        }

        // Verificar token de acceso
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        } catch (verifyError) {
            // Manejar token expirado intentando refrescar
            if (verifyError.name === 'TokenExpiredError') {
                console.log('Access Token expirado, devolviendo 401 para que el frontend lo maneje.');
                // --- CORRECCIÓN CLAVE AQUÍ ---
                // NO LLAMAR DIRECTAMENTE A refreshTokenMiddleware.
                // Devolver un 401 con un código específico para que el frontend lo intercepte.
                return res.status(401).json({
                    success: false,
                    code: 'TOKEN_EXPIRED',
                    message: 'Token de acceso expirado. Por favor, refresque la sesión.'
                });
                // --- FIN CORRECCIÓN ---
            }

            // Si no es un token expirado, pero es inválido por otra razón
            if (verifyError.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    code: 'INVALID_TOKEN',
                    message: 'Token de autenticación inválido'
                });
            }

            // Otros errores de verificación de token
            return res.status(500).json({
                success: false,
                code: 'TOKEN_VERIFY_ERROR',
                message: 'Error en la verificación del token'
            });
        }

        // Si el token de acceso es válido, procede con el resto de la lógica de 'auth'
        const user = await User.findById(decoded.id).select('role sessionId email name');

        if (!user) {
            return res.status(401).json({
                success: false,
                code: 'USER_NOT_FOUND',
                message: 'Usuario asociado al token no existe'
            });
        }

        // Es importante asignar req.sessionId aquí si lo necesitas en otros middlewares
        req.sessionId = decoded.sessionId;

        // Validar ID de sesión
        if (user.sessionId !== decoded.sessionId) {
            return res.status(401).json({
                success: false,
                code: 'INVALID_SESSION',
                message: 'Sesión inválida o terminada'
            });
        }

        // Adjuntar usuario a la solicitud
        req.user = {
            id: user._id,
            role: user.role,
            name: user.name,
            email: user.email
        };

        next(); // Continúa con la siguiente función de middleware/ruta
    } catch (error) {
        console.error('Auth Middleware error:', error);
        if (!res.headersSent) { // Prevenir error "Headers already sent"
            res.status(500).json({
                success: false,
                code: 'SERVER_ERROR',
                message: 'Error interno del servidor'
            });
        }
    }
};

/**
 * Middleware para verificar roles
 */
export const roleCheck = (allowedRoles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                code: 'UNAUTHENTICATED',
                message: 'Usuario no autenticado (no hay datos de usuario en req.user)'
            });
        }

        const userRole = req.user.role.toLowerCase();
        const normalizedAllowedRoles = new Set(allowedRoles.map(r => r.toLowerCase()));

        if (normalizedAllowedRoles.has(userRole)) {
            return next();
        }

        res.status(403).json({
            success: false,
            code: 'UNAUTHORIZED_ROLE',
            message: `Acceso denegado. Rol '${req.user.role}' no tiene permiso.`,
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


/**
 * @desc Obtener el perfil del usuario autenticado
 * @route GET /api/auth/profile
 * @access Private
 */
export const getProfile = async (req, res) => {
    try {
        // req.user ya está adjunto por el middleware 'auth'
        if (!req.user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado en la solicitud.' });
        }
        // Devuelve los datos del usuario adjuntos a req.user (sin contraseña)
        res.status(200).json({
            success: true,
            user: req.user
        });
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor al obtener perfil.' });
    }
};

/**
 * @desc Cerrar sesión de la sesión actual
 * @route POST /api/auth/logout
 * @access Private
 */
export const logout = async (req, res) => {
    // Opciones comunes para limpiar la cookie
    const commonCookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        path: '/'
    };

    // Asegúrate de que req.user y req.sessionId estén disponibles desde el middleware 'auth'
    if (!req.user || !req.user.id || !req.sessionId) {
        // Si no hay información de usuario/sesión, simplemente limpia la cookie y responde.
        // Esto puede ocurrir si el token de acceso ya no es válido y no hay refresh token,
        // o si se llama logout sin un token válido.
        res.clearCookie('refreshToken', commonCookieOptions);
        return res.status(200).json({ success: true, message: 'Sesión cerrada (sin información de usuario/sesión válida para revocar).' });
    }

    try {
        // Revocar el refresh token de la base de datos para la sesión actual
        // Aquí es donde req.sessionId es crucial.
        await RefreshToken.findOneAndUpdate(
            { user: req.user.id, sessionId: req.sessionId, revoked: false },
            { revoked: true }
        );

        // Limpiar la cookie del refresh token
        res.clearCookie('refreshToken', commonCookieOptions);

        res.status(200).json({ success: true, message: 'Sesión cerrada exitosamente.' });
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor al cerrar sesión.' });
    }
};

/**
 * @desc Cerrar sesión de todas las sesiones de un usuario
 * @route POST /api/auth/logoutAll
 * @access Private (solo ADMIN o el propio usuario si tiene permiso)
 */
export const logoutAllSessions = async (req, res) => {
    // Opciones comunes para limpiar la cookie
    const commonCookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        path: '/'
    };

    if (!req.user || !req.user.id) {
        res.clearCookie('refreshToken', commonCookieOptions); // Limpia la cookie por si acaso
        return res.status(401).json({ success: false, message: 'No autenticado para realizar esta acción.' });
    }

    try {
        // Revocar todos los refresh tokens para el usuario
        await RefreshToken.updateMany(
            { user: req.user.id, revoked: false },
            { revoked: true }
        );

        // Limpiar la cookie del refresh token de la respuesta actual, ya que todas las sesiones se cerrarán
        res.clearCookie('refreshToken', commonCookieOptions);

        res.status(200).json({ success: true, message: 'Todas las sesiones han sido cerradas.' });
    } catch (error) {
        console.error('Error al cerrar todas las sesiones:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor al cerrar todas las sesiones.' });
    }
};
