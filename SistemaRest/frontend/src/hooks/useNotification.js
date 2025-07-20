// frontend/src/hooks/useNotification.js
import { useCallback } from 'react';

const useNotification = () => {
  const showNotification = useCallback((message, type = 'info') => {
    console.log(`[NOTIFICACIÓN ${type.toUpperCase()}]: ${message}`);
    // Aquí iría la lógica para mostrar un toast/banner real si tuvieras una librería
  }, []);

  return {
    showNotification,
  };
};

export default useNotification; // <-- NOTA: export default aquí