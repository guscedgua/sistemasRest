// frontend/src/api/auth.js
import axios from 'axios';
import axiosInstance from '../api/axios'; // Importa tu instancia configurada
import { showToast } from '../components/ui/Toast'; // Asume que tienes un componente Toast para notificaciones

// CORRECCIÓN: Simplificación de API_BASE_URL
// Utiliza directamente el valor de la variable de entorno.
// Asegúrate de que VITE_API_URL esté definida en tu archivo .env (ej. VITE_API_URL=http://localhost:5000/api)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('DEBUG: API_BASE_URL en auth.js:', API_BASE_URL);

/**
 * @desc Inicia sesión de un usuario.
 * @route POST /api/auth/login
 * @access Public
 * @param {object} credentials - Objeto con email y password del usuario.
 */
export const loginUser = async (credentials) => {
    try {
        const response = await axiosInstance.post('/auth/login', credentials, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * @desc Registra un nuevo usuario.
 * @route POST /api/auth/register
 * @access Public
 * @param {object} userData - Objeto con los datos del nuevo usuario (name, email, password, role).
 */
export const registerUser = async (userData) => {
    try {
        const response = await axiosInstance.post(`/auth/register`, userData);
        showToast('Registro exitoso! Por favor inicia sesión', 'success');
        return response.data;
    } catch (error) {
        console.error('Registration error:', error);
        const errorMessage = error.response?.data?.message || 'Error en el registro';
        showToast(errorMessage, 'error');
        throw error;
    }
};

// Exporta las funciones con nombres más cortos para mayor comodidad
export const login = loginUser;
export const register = registerUser;

/**
 * @desc Solicita un nuevo access token usando el refresh token.
 * @route POST /api/auth/refresh-token
 * @access Private (gestionado por interceptor de Axios)
 * @remarks Esta función es llamada **únicamente** por el interceptor de Axios.
 * NO necesita el refresh token en el body; viaja por cookie HTTP-only.
 */
export const refreshToken = async () => {
    try {
        // Usa axios directamente para evitar que el interceptor se aplique a sí mismo en un bucle
        // Asegúrate de que API_BASE_URL esté definida y sea correcta.
        const response = await axios.post(
            `${API_BASE_URL}/auth/refresh-token`,
            {}, // Cuerpo vacío: el refreshToken viaja en la cookie
            { withCredentials: true } // Importante para enviar la cookie de refresh
        );
        return response.data;
    } catch (error) {
        console.error('Token refresh error (client-side):', error);
        throw error;
    }
};

/**
 * @desc Cierra la sesión del usuario.
 * @route POST /api/auth/logout
 * @access Private
 */
export const logoutUser = async () => {
    try {
        // Llamar al endpoint de logout. El refresh token se enviará automáticamente como cookie.
        await axiosInstance.post('/auth/logout', {}, { withCredentials: true });

    } catch (error) {
        console.error('Logout error (API call failed):', error);
        // No lanzamos el error aquí para que el finally en AuthContext siempre limpie el estado
    } finally {
        // CORRECCIÓN CLAVE: Eliminar window.location.reload()
        // La limpieza de localStorage y la redirección serán manejadas por AuthContext
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};