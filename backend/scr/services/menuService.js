import api from '../api/restaurantApi';

/**
 * Obtiene items del menú con soporte para filtros avanzados
 * @param {Object} filters - Filtros opcionales (categoría, disponibilidad, etc.)
 * @returns {Promise<Array>} Lista de items del menú
 */
export const getMenuItems = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    // Añadir filtros válidos a los parámetros
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });

    const response = await api.get('/menu', { params });
    
    return {
      success: true,
      data: response.data,
      pagination: response.headers['x-pagination'] 
        ? JSON.parse(response.headers['x-pagination']) 
        : null
    };
    
  } catch (error) {
    console.error('Error fetching menu items:', error);
    
    return {
      success: false,
      error: error.response?.data?.message || 'Error al cargar el menú',
      status: error.response?.status
    };
  }
};