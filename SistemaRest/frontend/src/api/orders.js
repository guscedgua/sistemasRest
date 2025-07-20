// frontend/src/api/orders.js
import api from './axios'; // Asegúrate de que esta importación apunte a tu instancia de Axios configurada
import { showToast } from '../components/ui/Toast'; // Para mostrar notificaciones

// Función auxiliar para obtener el token del localStorage
const getAuthToken = () => {
    return localStorage.getItem('token'); 
};

/**
 * @desc Crear una nueva orden
 * @route POST /api/orders
 * @access Private (mesero, admin, supervisor)
 */
export const createOrder = async (orderData) => {
    const token = getAuthToken();
    if (!token) {
        console.error('Authentication required. No token found.');
        showToast('Sesión expirada. Por favor inicie sesión nuevamente', 'error');
        throw new Error('Authentication required. Please log in.');
    }
    try {
        // CORRECCIÓN CLAVE: Eliminado el prefijo '/api/' de la ruta
        // La baseURL en axios.js ya añade el prefijo '/api'
        const response = await api.post('/orders', orderData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }); 
        showToast('Orden creada correctamente', 'success');
        return response.data;
    } catch (error) {
        console.error('Error creating order:', error);
        if (error.response?.status === 401) {
            showToast('Sesión expirada. Por favor inicie sesión nuevamente', 'error');
        } else {
            showToast('Error al crear la orden', 'error');
        }
        throw error;
    }
};

/**
 * @desc Obtener una orden por ID
 * @route GET /api/orders/:id
 * @access Private (admin, supervisor, mesero, cocinero)
 */
export const getOrderById = async (orderId) => {
    const token = getAuthToken();
    if (!token) {
        console.error('Authentication required. No token found.');
        showToast('Sesión expirada. Por favor inicie sesión nuevamente', 'error');
        throw new Error('Authentication required. Please log in.');
    }
    try {
        // CORRECCIÓN CLAVE: Eliminado el prefijo '/api/' de la ruta
        const response = await api.get(`/orders/${orderId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }); 
        return response.data;
    } catch (error) {
        console.error('Error fetching order:', error);
        if (error.response?.status === 401) {
            showToast('Sesión expirada. Por favor inicie sesión nuevamente', 'error');
        } else {
            showToast('Error al cargar la orden', 'error');
        }
        throw error;
    }
};

/**
 * @desc Actualizar el estado de una orden
 * @route PATCH /api/orders/:id/status
 * @access Private (mesero, cocinero, admin, supervisor)
 */
export const updateOrderStatus = async (orderId, status) => {
    const token = getAuthToken();
    if (!token) {
        console.error('Authentication required. No token found.');
        showToast('Sesión expirada. Por favor inicie sesión nuevamente', 'error');
        throw new Error('Authentication required. Please log in.');
    }
    try {
        // CORRECCIÓN CLAVE: Eliminado el prefijo '/api/' de la ruta
        const response = await api.patch(`/orders/${orderId}/status`, { status }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }); 
        showToast('Estado actualizado correctamente', 'success');
        return response.data;
    } catch (error) {
        console.error('Error updating order status:', error);
        if (error.response?.status === 401) {
            showToast('Sesión expirada. Por favor inicie sesión nuevamente', 'error');
        } else {
            showToast('Error al actualizar el estado', 'error');
        }
        throw error;
    }
};

/**
 * @desc Eliminar una orden por ID
 * @route DELETE /api/orders/:id
 * @access Private (admin)
 */
export const deleteOrder = async (orderId) => {
    const token = getAuthToken();
    if (!token) {
        console.error('Authentication required. No token found.');
        showToast('Sesión expirada. Por favor inicie sesión nuevamente', 'error');
        throw new Error('Authentication required. Please log in.');
    }
    try {
        // CORRECCIÓN CLAVE: Eliminado el prefijo '/api/' de la ruta
        await api.delete(`/orders/${orderId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }); 
        showToast('Orden eliminada correctamente', 'success');
        return true;
    } catch (error) {
        console.error('Error deleting order:', error);
        if (error.response?.status === 401) {
            showToast('Sesión expirada. Por favor inicie sesión nuevamente', 'error');
        } else {
            showToast('Error al eliminar la orden', 'error');
        }
        throw error;
    }
};

/**
 * @desc Obtener todas las órdenes (con parámetros de filtro opcionales)
 * @route GET /api/orders
 * @access Private (admin, supervisor, mesero)
 */
// CORRECCIÓN: Se mantuvo solo esta versión de getOrders, que es más flexible
export const getOrders = async (params = {}) => {
    const token = getAuthToken();
    if (!token) {
        console.error('Authentication required. No token found.');
        showToast('Sesión expirada. Por favor inicie sesión nuevamente', 'error');
        throw new Error('Authentication required. Please log in.');
    }
    try {
        // CORRECCIÓN CLAVE: Eliminado el prefijo '/api/' de la ruta
        const response = await api.get('/orders', { 
            params, // Pasa los parámetros de filtro
            headers: {
                Authorization: `Bearer ${token}`
            }
        }); 
        return response.data;
    } catch (error) {
        console.error('Error fetching orders:', error);
        if (error.response?.status === 401) {
            showToast('Sesión expirada. Por favor inicie sesión nuevamente', 'error');
        } else {
            showToast('Error al cargar las órdenes', 'error');
        }
        throw error;
    }
};

// Las siguientes funciones se mantienen de tu código anterior,
// pero asegúrate de que también usen la instancia 'api' y no incluyan '/api/' en la ruta.

export const getSystemModules = async () => {
    const token = getAuthToken();
    if (!token) {
        console.error('Authentication required. No token found.');
        showToast('Sesión expirada. Por favor inicie sesión nuevamente', 'error');
        throw new Error('Authentication required. Please log in.');
    }
    try {
        // CORRECCIÓN CLAVE: Eliminado el prefijo '/api/' de la ruta
        const response = await api.get('/admin/system-modules', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching system modules:', error);
        if (error.response?.status === 401) {
            showToast('Sesión expirada. Por favor inicie sesión nuevamente', 'error');
        } else {
            showToast('Error al cargar los módulos del sistema', 'error');
        }
        throw error;
    }
};

export const getDashboardData = async () => {
    const token = getAuthToken();
    if (!token) {
        console.error('Authentication required. No token found.');
        showToast('Sesión expirada. Por favor inicie sesión nuevamente', 'error');
        throw new Error('Authentication required. Please log in.');
    }
    try {
        // CORRECCIÓN CLAVE: Eliminado el prefijo '/api/' de la ruta
        const response = await api.get('/admin/dashboard', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        if (error.response?.status === 401) {
            showToast('Sesión expirada. Por favor inicie sesión nuevamente', 'error');
        } else {
            showToast('Error al cargar los datos del dashboard', 'error');
        }
        throw error;
    }
};

export const getSettings = async () => {
    const token = getAuthToken();
    if (!token) {
        console.error('Authentication required. No token found.');
        showToast('Sesión expirada. Por favor inicie sesión nuevamente', 'error');
        throw new Error('Authentication required. Please log in.');
    }
    try {
        // CORRECCIÓN CLAVE: Eliminado el prefijo '/api/' de la ruta
        const response = await api.get('/settings', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching settings:', error);
        if (error.response?.status === 401) {
            showToast('Sesión expirada. Por favor inicie sesión nuevamente', 'error');
        } else {
            showToast('Error al cargar la configuración', 'error');
        }
        throw error;
    }
};

export const updateSettings = async (settingsData) => {
    const token = getAuthToken();
    if (!token) {
        console.error('Authentication required. No token found.');
        showToast('Sesión expirada. Por favor inicie sesión nuevamente', 'error');
        throw new Error('Authentication required. Please log in.');
    }
    try {
        // CORRECCIÓN CLAVE: Eliminado el prefijo '/api/' de la ruta
        const response = await api.patch('/settings', settingsData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        showToast('Configuración actualizada correctamente', 'success');
        return response.data;
    } catch (error) {
        console.error('Error updating settings:', error);
        if (error.response?.status === 401) {
            showToast('Sesión expirada. Por favor inicie sesión nuevamente', 'error');
        } else {
            showToast('Error al actualizar la configuración', 'error');
        }
        throw error;
    }
};

export const assignOrderToTable = async (orderId, tableId) => {
    const token = getAuthToken();
    if (!token) {
        console.error('Authentication required. No token found.');
        showToast('Sesión expirada. Por favor inicie sesión nuevamente', 'error');
        throw new Error('Authentication required. Please log in.');
    }
    try {
        // CORRECCIÓN CLAVE: Eliminado el prefijo '/api/' de la ruta
        const response = await api.patch(`/orders/${orderId}/assign-table`, { tableId }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        showToast('Orden asignada a mesa correctamente', 'success');
        return response.data;
    } catch (error) {
        console.error('Error assigning order to table:', error);
        if (error.response?.status === 401) {
            showToast('Sesión expirada. Por favor inicie sesión nuevamente', 'error');
        } else {
            showToast('Error al asignar la orden a la mesa', 'error');
        }
        throw error;
    }
};

export const getOrdersByStatus = async (status) => {
    const token = getAuthToken();
    if (!token) {
        console.error('Authentication required. No token found.');
        showToast('Sesión expirada. Por favor inicie sesión nuevamente', 'error');
        throw new Error('Authentication required. Please log in.');
    }
    try {
        // CORRECCIÓN CLAVE: Eliminado el prefijo '/api/' de la ruta
        const response = await api.get(`/orders/status/${status}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching orders by status:', error);
        if (error.response?.status === 401) {
            showToast('Sesión expirada. Por favor inicie sesión nuevamente', 'error');
        } else {
            showToast('Error al cargar las órdenes por estado', 'error');
        }
        throw error;
    }
};
