// frontend/src/api/axios.js
import axios from 'axios';
import { refreshToken } from './auth'; // Importa la función refreshToken desde auth.js
import { showToast } from '../components/ui/Toast'; // Para mostrar notificaciones

// Define la URL base de la API.
// Preferirá VITE_API_URL del .env, si no, usará http://localhost:5000/api.
// Asegúrate de que el puerto (5000) coincida con el puerto de tu backend.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Importante para enviar y recibir cookies (refresh token)
    timeout: 10000, // Opcional: tiempo de espera para las solicitudes
    headers: {
        'Content-Type': 'application/json',
    },
});

// DEBUG: Log the actual baseURL being used
console.log('DEBUG Axios: Using baseURL:', axiosInstance.defaults.baseURL);

// Flag para evitar múltiples solicitudes de refresco concurrentes
let isRefreshing = false;
// Cola para almacenar las solicitudes fallidas que necesitan reintentarse después del refresco
let failedQueue = [];

// Función para procesar la cola de solicitudes fallidas
const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// --- Interceptor de Solicitudes ---
// Añade el token de acceso a cada solicitud saliente
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        // DEBUG: Log para ver el estado del token justo antes de la solicitud
        console.log(`DEBUG Axios Request Interceptor: Token para ${config.url}: ${token ? 'EXISTE' : 'NULL'}`);

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        } else {
            // Advertencia si no se encuentra el token
            console.warn(`DEBUG Axios Request Interceptor: No se encontró token en localStorage para la solicitud a ${config.url}`);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// --- Interceptor de Respuestas ---
// Maneja errores de autenticación y refresco de token
axiosInstance.interceptors.response.use(
    (response) => response, // Si la respuesta es exitosa, simplemente la devuelve
    async (error) => {
        const originalRequest = error.config;

        // Si el error es una respuesta 401 y no es la solicitud de refresh token en sí misma
        // y la solicitud original no ha sido reintentada ya
        if (error.response?.status === 401 && originalRequest.url !== '/auth/refresh-token' && !originalRequest._retry) {
            originalRequest._retry = true;

            console.log("DEBUG Axios Interceptor: Recibido 401. Intentando refrescar token...");

            if (isRefreshing) {
                return new Promise(function(resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                .then(token => {
                    originalRequest.headers['Authorization'] = 'Bearer ' + token;
                    return axiosInstance(originalRequest);
                })
                .catch(err => {
                    return Promise.reject(err);
                });
            }

            isRefreshing = true;

            return new Promise(async (resolve, reject) => {
                try {
                    // La URL para el refresh token también debe usar la baseURL configurada
                    const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {}, { withCredentials: true });
                    const newAccessToken = refreshResponse.data.accessToken;
                    const user = refreshResponse.data.user;

                    // Guarda el nuevo token y usuario en localStorage.
                    // El interceptor de solicitudes lo leerá automáticamente para las próximas peticiones.
                    localStorage.setItem('token', newAccessToken);
                    localStorage.setItem('user', JSON.stringify(user));

                    // ELIMINADA: La línea axiosInstance.defaults.headers.common['Authorization'] = ...
                    // Ya no es necesaria aquí, el interceptor de solicitudes se encarga dinámicamente.

                    // Asegura que la solicitud original reintentada use el nuevo token
                    originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;

                    // Procesa las solicitudes que estaban en cola esperando el nuevo token
                    processQueue(null, newAccessToken);

                    // Reintenta la solicitud original con el nuevo token
                    resolve(axiosInstance(originalRequest));
                    showToast('Sesión refrescada exitosamente!', 'success');

                } catch (refreshError) {
                    console.error("DEBUG Axios Interceptor: Fallo al refrescar el token:", refreshError);
                    // Limpia la sesión si el refresco falla
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    processQueue(refreshError, null); // Rechaza las solicitudes en cola
                    showToast('Tu sesión ha expirado o es inválida. Por favor, inicia sesión de nuevo.', 'error');
                    window.location.href = '/login'; // Redirige al login
                    reject(refreshError); // Rechaza la promesa de la solicitud original
                } finally {
                    isRefreshing = false; // Restablece el flag
                }
            });
        }

        // Logs para otros errores que no sean 401
        if (error.response) {
            console.log('DEBUG Axios Interceptor: Recibido', error.response.status, '. No se intentará refrescar token.');
        } else {
            console.error('DEBUG Axios Interceptor: Error de red o sin respuesta:', error);
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;