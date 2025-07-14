import React from 'react';
import Button from '../../components/ui/Button';
import { logoutUser } from '../../api/auth';

const LogoutButton = () => {
  const handleLogout = async () => {
    if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      await logoutUser();
    }
  };

  return (
    <Button 
      variant="danger" 
      onClick={handleLogout}
      icon="logout"
    >
      Cerrar Sesión
    </Button>
  );
};

export default LogoutButton;