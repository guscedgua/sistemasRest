import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/ui/Spinner'; // Asumiendo que tienes un componente Spinner

const AdminRoute = () => {
  const { user, loading } = useAuth(); // Usar 'user' y 'loading' del AuthContext

  // Muestra un spinner mientras se carga el estado de autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner size="lg" />
      </div>
    );
  }

  // Si no hay usuario logueado, redirige a la página de login
  if (!user) {
    console.log("AdminRoute: Usuario no logueado, redirigiendo a /login");
    return <Navigate to="/login" replace />;
  }

  // Si el usuario no tiene el rol 'admin', redirige a la página de no autorizado
  if (user.role !== 'admin') {
    console.log(`AdminRoute: Usuario '${user.email}' con rol '${user.role}' no es admin, redirigiendo a /unauthorized`);
    return <Navigate to="/unauthorized" replace />;
  }

  // Si el usuario es admin, renderiza las rutas anidadas
  console.log(`AdminRoute: Usuario '${user.email}' con rol 'admin', permitiendo acceso.`);
  return <Outlet />;
};

export default AdminRoute;