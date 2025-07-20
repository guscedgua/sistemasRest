// frontend/src/api/inventory.js
// CAMBIO: Importa tu instancia configurada de axios
import axiosInstance from './axios'; // Asegúrate de que la ruta sea correcta
import { showToast } from '../components/ui/Toast';
// REMOVIDO: Ya no necesitas importar getToken aquí, el interceptor lo hace.
// import { getToken } from '../utils/auth';

// REMOVIDO: Ya no necesitas esta URL base aquí, axiosInstance ya la tiene configurada.
// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Obtener items de inventario
export const getInventoryItems = async () => {
  try {
    // REMOVIDO: Ya no necesitas obtener el token manualmente aquí.
    // const token = getToken();
    // CAMBIO: Usa axiosInstance en lugar de axios por defecto
    const response = await axiosInstance.get('/inventory', {
      // REMOVIDO: El encabezado Authorization se añade automáticamente por el interceptor de axiosInstance.
      // headers: {
      //   Authorization: `Bearer ${token}`
      // }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching inventory:', error);
    showToast('Error al cargar el inventario', 'error');
    throw error;
  }
};

// Añadir más funciones según sea necesario
export const updateInventoryItem = async (itemId, data) => {
  try {
    // REMOVIDO: Ya no necesitas obtener el token manualmente aquí.
    // const token = getToken();
    // CAMBIO: Usa axiosInstance en lugar de axios por defecto
    const response = await axiosInstance.put(`/inventory/${itemId}`, data, {
      // REMOVIDO: El encabezado Authorization se añade automáticamente por el interceptor de axiosInstance.
      // headers: {
      //   Authorization: `Bearer ${token}`
      // }
    });
    showToast('Ítem actualizado correctamente', 'success');
    return response.data;
  } catch (error) {
    console.error('Error updating inventory item:', error);
    showToast('Error al actualizar el ítem', 'error');
    throw error;
  }
};