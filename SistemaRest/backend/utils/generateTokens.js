// backend/utils/generateTokens.js
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid'; // Importa uuid para generar IDs únicos

export const generateAccessToken = (user, sessionId) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role,
            sessionId,
            type: 'access'
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m' }
    );
};

export const generateRefreshToken = (user, sessionId) => {
    // Usar JWT_REFRESH_COOKIE_EXPIRE para la expiración del JWT
    const refreshExpiresDays = parseInt(process.env.JWT_REFRESH_COOKIE_EXPIRE || 7);
    return jwt.sign(
        {
            id: user._id,
            sessionId,
            type: 'refresh',
            jti: uuidv4() // Añade un ID único al JWT para asegurar que cada token sea distinto
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: `${refreshExpiresDays}d` } // Ejemplo: '7d'
    );
};

export const createSessionId = () => {
    return crypto.randomBytes(16).toString('hex');
};

// Esta función es necesaria si la usas en tu refreshTokenMiddleware para establecer cookies
// Si no la usas, puedes omitirla. La he añadido basándome en el código que me proporcionaste anteriormente.
export const setAuthCookies = (res, tokens, userDetails) => {
    const refreshExpiresDays = parseInt(process.env.JWT_REFRESH_COOKIE_EXPIRE || 7);
    const cookieOptions = {
        expires: new Date(Date.now() + refreshExpiresDays * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        path: '/'
    };
    res.cookie('refreshToken', tokens.refreshToken, cookieOptions);
    // Nota: El accessToken generalmente no se guarda en cookies httpOnly por seguridad,
    // sino que se envía en el header Authorization. Esta función es más para el refreshToken.
    // Si tu frontend espera el accessToken en la respuesta JSON, ya lo estás enviando.
};