import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/auth/Login';
import PrivateRoute from './components/auth/PrivateRoute';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import RoleSelection from './pages/RoleSelection';
import AdminRegister from './pages/AdminRegister';
import NotFound from './pages/NotFound';

// Admin components
import Dashboard from './components/admin/Dashboard';
import UserManagement from './components/admin/UserManagement';
import ProductManagement from './components/admin/ProductManagement';
import InventoryManagement from './components/admin/InventoryManagement';
import SupplierManagement from './components/admin/SupplierManagement';
import RecipeManagement from './components/admin/RecipeManagement';
import Reports from './components/admin/Reports';

// Waiter components
import OrderTaking from './components/waiter/OrderTaking';
import ActiveOrders from './components/waiter/ActiveOrders';
import Tables from './components/waiter/Table';

// Chef components
import KitchenOrders from './components/chef/KitchenOrders';

// Nuevo componente para manejar las rutas de forma centralizada
const AppRoutes = () => {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }

  // Si el usuario está autenticado, renderiza las rutas protegidas.
  if (userProfile) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            <Routes>
              {/* Redirecciona la raíz al dashboard del usuario logueado */}
              <Route path="/" element={<Navigate to={`/${userProfile.role}/dashboard`} />} />

              {/* Rutas de Administrador */}
              <Route path="/admin/dashboard" element={<PrivateRoute requiredRole="admin"><Dashboard /></PrivateRoute>} />
              <Route path="/admin/users" element={<PrivateRoute requiredRole="admin"><UserManagement /></PrivateRoute>} />
              <Route path="/admin/products" element={<PrivateRoute requiredRole="admin"><ProductManagement /></PrivateRoute>} />
              <Route path="/admin/inventory" element={<PrivateRoute requiredRole="admin"><InventoryManagement /></PrivateRoute>} />
              <Route path="/admin/suppliers" element={<PrivateRoute requiredRole="admin"><SupplierManagement /></PrivateRoute>} />
              <Route path="/admin/recipes" element={<PrivateRoute requiredRole="admin"><RecipeManagement /></PrivateRoute>} />
              <Route path="/admin/reports" element={<PrivateRoute requiredRole="admin"><Reports /></PrivateRoute>} />
              <Route path="/admin/tables" element={<PrivateRoute requiredRole="admin"><Tables /></PrivateRoute>} /> 

              {/* Rutas de Mesero */}
              <Route path="/waiter/orders" element={<PrivateRoute requiredRole="mesero"><OrderTaking /></PrivateRoute>} />
              <Route path="/waiter/active-orders" element={<PrivateRoute requiredRole="mesero"><ActiveOrders /></PrivateRoute>} />
              <Route path="/waiter/tables" element={<PrivateRoute requiredRole="mesero"><Tables /></PrivateRoute>} />
              <Route path="/admin/tables" element={<PrivateRoute requiredRole="mesero"><Tables /></PrivateRoute>} /> 

              {/* Rutas de Cocinero */}
              <Route path="/chef/orders" element={<PrivateRoute requiredRole="cocinero"><KitchenOrders /></PrivateRoute>} />
              
              {/* Ruta 404 para cualquier ruta protegida no encontrada */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
    );
  }

  // Si el usuario no está autenticado, renderiza las rutas públicas.
  return (
    <Routes>
      <Route path="/" element={<RoleSelection />} />
      <Route path="/admin-login" element={<Login role="admin" />} />
      <Route path="/waiter-login" element={<Login role="mesero" />} />
      <Route path="/chef-login" element={<Login role="cocinero" />} />
      <Route path="/admin-register" element={<AdminRegister />} />
      {/* Ruta 404 para cualquier ruta pública no encontrada */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
};

export default App;
