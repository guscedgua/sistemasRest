import axios from 'axios';

export const getMenuItems = async () => {
  try {
    const response = await axios.get('/api/menu'); // Ajusta la ruta según tu API
    return response.data;
  } catch (error) {
    console.error('Error fetching menu:', error);
    throw error;
  }
};