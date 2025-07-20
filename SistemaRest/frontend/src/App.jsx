// frontend/src/App.jsx
import React from 'react';
// Quita BrowserRouter y AuthProvider de los imports aquí, ya que están en main.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
// Asegúrate de que AuthProvider ya NO se importe aquí, ni BrowserRouter
// import { AuthProvider } from './context/AuthContext'; // <--- REMOVER ESTA LÍNEA
import { SettingsProvider } from './context/SettingsContext'; // Este sí se queda
import DashboardLayout from './components/layout/DashboardLayout';
import RestaurantLogin from './pages/auth/Login';
import Register from './pages/auth/Register';
import OrdersList from './pages/orders/OrdersList';
import OrderDetail from './pages/orders/OrderDetail';
import CreateOrder from './pages/orders/CreateOrder';
import ProductsList from './pages/products/ProductsList';
import ProductEdit from './pages/products/ProductEdit';
import Inventory from './pages/inventory/Inventory';
import Recipes from './pages/recipes/Recipes';
import Settings from './pages/settings/Settings';
import TablesPage from './pages/tables/Tables';
import Unauthorized from './pages/error/Unauthorized';
import NotFound from './pages/error/NotFound';
import PrivateRoute from './routes/PrivateRoute';
import AdminRoute from './routes/AdminRoute';
import './index.css'; // Esto también podría ir en main.jsx si es global

import Dashboard from './pages/dashboard/Dashboard';
import UsersPage from './pages/user/UsersPage';
import ReportsPage from './pages/report/ReportsPage';
import SuppliersPage from './pages/suppliers/SupplierdPage';

import { useAuth } from './context/AuthContext'; // Necesitas useAuth aquí para PrivateRoute/AdminRoute

console.log("¡Este mensaje DEBE aparecer si el frontend se carga!");

function App() {
  // Ahora AuthProvider envuelve App, así que puedes acceder a useAuth aquí.
  const { loading } = useAuth(); // Necesitas esto si quieres mostrar un spinner global

  if (loading) {
    // Puedes poner un spinner o mensaje de carga aquí mientras AuthProvider se inicializa
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '24px', color: '#4CAF50' }}>
        Cargando aplicación...
      </div>
    );
  }

  return (
    // ¡REMOVIDO BrowserRouter y AuthProvider de aquí!
    <SettingsProvider> {/* SettingsProvider sí debe envolver las rutas si se usa globalmente */}
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/login" element={<RestaurantLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Rutas Protegidas */}
        {/* PrivateRoute ya usa useAuth internamente para verificar isLoggedIn */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="orders" element={<OrdersList />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="orders/new" element={<CreateOrder />} />
            <Route path="tables" element={<TablesPage />} />

            {/* Rutas de Administrador */}
            {/* AdminRoute ya usa useAuth internamente para verificar el rol */}
            <Route element={<AdminRoute />}>
              <Route path="products" element={<ProductsList />} />
              <Route path="products/:id" element={<ProductEdit />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="recipes" element={<Recipes />} />
              <Route path="settings" element={<Settings />} />

              {/* AÑADIR ESTAS RUTAS PARA USUARIOS, REPORTES Y PROVEEDORES */}
              <Route path="users" element={<UsersPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="suppliers" element={<SuppliersPage />} />
            </Route>
          </Route>
        </Route>

        {/* Manejo de errores */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </SettingsProvider>
  );
}

export default App;