// frontend/src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Interceptor para manejar errores de autenticación globalmente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Función para verificar la conexión con el backend
export const checkBackendConnection = async () => {
  try {
    // Usamos la instancia 'api' en lugar de 'axios' directamente
    const response = await api.get('/health', {
      timeout: 5000 // Timeout de 5 segundos
    });
    return response.status === 200;
  } catch (error) {
    console.error('Error checking backend connection:', error);
    return false;
  }
};

// Auth endpoints
export const getProfile = async () => {
  try {
    const response = await api.get('/auth/profile', {
      timeout: 10000
    });
    
    console.log('Profile response received:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in getProfile:', error);
    
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Error de conexión: El servidor no está respondiendo');
    } else if (error.response?.status === 401) {
      throw new Error('Token inválido o expirado');
    } else if (error.response?.status === 404) {
      throw new Error('Endpoint no encontrado. Verifica la configuración del servidor.');
    } else {
      throw new Error('Error de red: ' + error.message);
    }
  }
};

// Health check endpoint
export const healthCheck = () => {
  return api.get('/health').then(response => response.data);
};

// User endpoints
export const getUsers = () => {
  return api.get('/admin/users').then(response => response.data);
};

export const createUser = (userData) => {
  return api.post('/admin/users', userData).then(response => response.data);
};

export const updateUser = (userId, userData) => {
  return api.put(`/admin/users/${userId}`, userData).then(response => response.data);
};

export const deleteUser = (userId) => {
  return api.delete(`/admin/users/${userId}`).then(response => response.data);
};

// Product endpoints
export const getProducts = () => {
  return api.get('/products').then(response => response.data);
};

export const createProduct = (productData) => {
  return api.post('/admin/products', productData).then(response => response.data);
};

export const updateProduct = (productId, productData) => {
  return api.put(`/admin/products/${productId}`, productData).then(response => response.data);
};

export const deleteProduct = (productId) => {
  return api.delete(`/admin/products/${productId}`).then(response => response.data);
};

// Order endpoints
export const createOrder = (orderData) => {
  return api.post('/orders', orderData).then(response => response.data);
};

export const getOrdersByStatus = (status) => {
  return api.get(`/orders/status/${status}`).then(response => response.data);
};

export const getProductsCount = () => {
  return api.get('/products/count').then(response => response.data);
};

export const updateOrderStatus = (orderId, statusData) => {
  return api.patch(`/orders/${orderId}/status`, statusData).then(response => response.data);
};

// Table endpoints
export const getTables = () => {
  return api.get('/tables').then(response => response.data);
};

// Dashboard endpoints
export const getOrdersTodaySummary = () => {
  return api.get('/dashboard/orders-today').then(response => response.data);
};

export const getTotalSalesSummary = () => {
  return api.get('/dashboard/total-sales').then(response => response.data);
};

export const getTablesStatusSummary = () => {
  return api.get('/dashboard/tables-status').then(response => response.data);
};

// Inventory endpoints
export const getInventoryItems = () => {
  return api.get('/inventory').then(response => response.data);
};

export const addInventoryQuantity = (itemId, quantityData) => {
  return api.patch(`/inventory/${itemId}/add`, quantityData).then(response => response.data);
};

export const removeInventoryQuantity = (itemId, quantityData) => {
  return api.patch(`/inventory/${itemId}/remove`, quantityData).then(response => response.data);
};

// Supplier endpoints
export const getSuppliers = () => {
  return api.get('/suppliers').then(response => response.data);
};

export const createSupplier = (supplierData) => {
  return api.post('/suppliers', supplierData).then(response => response.data);
};

export const updateSupplier = (supplierId, supplierData) => {
  return api.put(`/suppliers/${supplierId}`, supplierData).then(response => response.data);
};

export const deleteSupplier = (supplierId) => {
  return api.delete(`/suppliers/${supplierId}`).then(response => response.data);
};

// Recipe endpoints
export const getRecipes = () => {
  return api.get('/recipes').then(response => response.data);
};

export const createRecipe = (recipeData) => {
  return api.post('/recipes', recipeData).then(response => response.data);
};

export const updateRecipe = (recipeId, recipeData) => {
  return api.put(`/recipes/${recipeId}`, recipeData).then(response => response.data);
};

export const deleteRecipe = (recipeId) => {
  return api.delete(`/recipes/${recipeId}`).then(response => response.data);
};

// Report endpoints
export const getSalesReport = (startDate, endDate) => {
  return api.get(`/reports/sales?startDate=${startDate}&endDate=${endDate}`).then(response => response.data);
};

export const getInventoryReport = () => {
  return api.get('/reports/inventory').then(response => response.data);
};

// Table endpoints
export const updateTableStatus = (tableId, statusData) => {
  return api.patch(`/tables/${tableId}/status`, statusData).then(response => response.data);
};

export const setAuthToken = (token) => {
    if (token) {
        // Aplica el token de autenticación a todas las futuras solicitudes
        api.defaults.headers.common['x-auth-token'] = token;
        localStorage.setItem('token', token);
    } else {
        // Elimina el token si se desloguea
        delete api.defaults.headers.common['x-auth-token'];
        localStorage.removeItem('token');
    }
};

export default api;