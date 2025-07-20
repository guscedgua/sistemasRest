import axios from 'axios';
import { getToken } from '../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Obtener todos los usuarios
export const getUsers = async () => {
  try {
    const token = getToken();
    const response = await axios.get(`${API_URL}/admin/users`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    showToast('Error al obtener los usuarios', 'error');
    throw error;
  }
};

// Actualizar el rol de un usuario
export const updateUserRole = async (userId, role) => {
  try {
    const token = getToken();
    const response = await axios.patch(
      `${API_URL}/admin/users/${userId}/role`,
      { role },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    showToast('Rol actualizado correctamente', 'success');
    return response.data;
  } catch (error) {
    console.error('Error updating user role:', error);
    showToast('Error al actualizar el rol', 'error');
    throw error;
  }
};

// Otras funciones de administración...

// Bloquear/Desbloquear usuario
export const toggleUserStatus = async (userId, isActive) => {
  try {
    const token = getToken();
    const response = await axios.patch(
      `${API_URL}/admin/users/${userId}/status`,
      { isActive },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    const message = isActive ? 
      'Usuario activado correctamente' : 
      'Usuario desactivado correctamente';
      
    showToast(message, 'success');
    return response.data;
  } catch (error) {
    console.error('Error updating user status:', error);
    showToast('Error al actualizar estado del usuario', 'error');
    throw error;
  }
};

// Eliminar usuario
export const deleteUser = async (userId) => {
  try {
    const token = getToken();
    const response = await axios.delete(
      `${API_URL}/admin/users/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    showToast('Usuario eliminado correctamente', 'success');
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    showToast('Error al eliminar usuario', 'error');
    throw error;
  }
};