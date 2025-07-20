// frontend/src/api/settings.js
import api from './axios';

// Función auxiliar para obtener el token del localStorage
// ¡Asegúrate de que la clave 'token' sea la misma que usas en AuthContext.js para guardar el token!
const getAuthToken = () => {
    return localStorage.getItem('token'); 
};

// Esta función debe aceptar el tipo de métrica
export const getDashboardMetric = (metricType) => {
    const token = getAuthToken();
    if (!token) {
        console.error('Authentication required. No token found.');
        throw new Error('Authentication required. Please log in.');
    }
    // Llama a /api/dashboard?metric=ordersToday, etc.
    return api.get(`/dashboard?metric=${metricType}`, { 
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

export const getSettings = () => {
  const token = getAuthToken();
  if (!token) {
    // Es crucial manejar la ausencia del token. Puedes lanzar un error,
    // redirigir al login o mostrar una notificación.
    console.error('Authentication required. No token found.');
    throw new Error('Authentication required. Please log in.');
  }
  return api.get('/settings', {
    headers: {
      Authorization: `Bearer ${token}` // Formato correcto: "Bearer " + token
    }
  });
};

export const updateSettings = (settingsData) => {
  const token = getAuthToken();
  if (!token) {
    console.error('Authentication required. No token found.');
    throw new Error('Authentication required. Please log in.');
  }
  return api.patch('/settings', settingsData, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const getSystemModules = () => {
    const token = getAuthToken();
    if (!token) {
        console.error('Authentication required. No token found.');
        throw new Error('Authentication required. No token found.');
    }
    return api.get('/admin/system-modules', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

export const getDashboardData = () => {
    const token = getAuthToken();
    if (!token) {
        console.error('Authentication required. No token found.');
        throw new Error('Authentication required. No token found.');
    }
    return api.get('/admin/dashboard', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};