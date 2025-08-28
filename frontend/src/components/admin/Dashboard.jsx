// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  getOrdersTodaySummary, 
  getTotalSalesSummary, 
  getTablesStatusSummary,
  getProductsCount,
  checkBackendConnection,
} from '../../services/api';

// Componente de tarjeta para mostrar cada métrica
const MetricCard = ({ title, value, icon, bgColor, textColor }) => (
    <div className={`flex flex-col items-start p-6 rounded-xl shadow-lg transition-transform transform hover:scale-105 ${bgColor} ${textColor}`}>
        <div className={`p-3 rounded-full mb-4 shadow-md ${bgColor} bg-opacity-50`}>
            {icon}
        </div>
        <div className="text-2xl font-bold mb-1">{value}</div>
        <div className="text-sm font-medium opacity-80">{title}</div>
    </div>
);

// Iconos SVG en línea para reemplazar bibliotecas de iconos externas
const UtensilsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
        <path d="M5.5 0A1.5 1.5 0 0 1 7 1.5V14a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5V1a1.5 1.5 0 0 1 1.5-1m3 0a1.5 1.5 0 0 1 1.5 1.5V14a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5V1a1.5 1.5 0 0 1 1.5-1m3 0A1.5 1.5 0 0 1 13 1.5V14a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5V1a1.5 1.5 0 0 1 1.5-1"/>
    </svg>
);

const ShoppingCartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
        <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M3.102 4l1.313 7h8.17l1.313-7zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/>
    </svg>
);

const BoxIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5l2.459 1.416-.707.707-.128.128-.707-.707-1.583 1.583 4.185 4.185.707-.707.128-.128.707.707 1.414 1.414.707-.707L13.156 5.5l-1.583-1.583-.707.707-.128-.128-.707-.707-2.459-1.416zM2 4.186v7.628l-1 1V4.186zM14 4.186V12.87l-1 1V4.186z"/>
    </svg>
);

const DollarSignIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
        <path d="M4 14v-4h3a2 2 0 0 1 2 2h4V8a2 2 0 0 1-2-2H7a2 2 0 0 1-2-2H3V2h4a4 4 0 1 1 0 8H5v2h2a4 4 0 1 1 0-8H3a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2v4a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1h2v-2h-2a1 1 0 0 0-1 1v4h-4a2 2 0 1 1 0-4h4a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H7a2 2 0 1 1 0-4h4a1 1 0 0 0 1 1v2a1 1 0 0 0-1 1h-2a2 2 0 1 1-2 2v2a2 2 0 1 1 2 2h2v-2a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1z"/>
    </svg>
);

const Dashboard = () => {
  const [ordersToday, setOrdersToday] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [tablesStatus, setTablesStatus] = useState({ occupied: 0, total: 0 });
  const [productsCount, setProductsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');

  // Función para verificar la conexión con el backend y obtener los datos
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      setBackendStatus('checking');

      const isConnected = await checkBackendConnection();
      if (!isConnected) {
        throw new Error('No se puede conectar al servidor. Verifica que el backend esté ejecutándose.');
      }

      setBackendStatus('connected');

      const [ordersResponse, salesResponse, tablesResponse, productsResponse] = await Promise.all([
        getOrdersTodaySummary(),
        getTotalSalesSummary(),
        getTablesStatusSummary(),
        getProductsCount()
      ]);

      if (ordersResponse.success) setOrdersToday(ordersResponse.value);
      if (salesResponse.success) setTotalSales(salesResponse.value);
      if (tablesResponse.success) setTablesStatus(tablesResponse.data);
      if (productsResponse.success) setProductsCount(productsResponse.count);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message || 'Error al cargar los datos del dashboard.');
      setBackendStatus('disconnected');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Función para reintentar la conexión
  const retryConnection = () => {
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 md:ml-64">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-4 h-4 rounded-full animate-pulse bg-indigo-600"></div>
            <div className="w-4 h-4 rounded-full animate-pulse bg-indigo-600"></div>
            <div className="w-4 h-4 rounded-full animate-pulse bg-indigo-600"></div>
          </div>
          <p className="text-gray-600">
            {backendStatus === 'checking' 
              ? 'Verificando conexión con el servidor...' 
              : 'Cargando datos...'}
          </p>
        </div>
      </div>
    );
  }

  if (error || backendStatus === 'disconnected') {
    return (
      <div className="p-8 bg-gray-100 min-h-screen md:ml-64 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md text-center max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error de conexión</h2>
          <p className="text-gray-600 mb-4">
            {error || 'No se puede conectar al servidor. Verifica que el backend esté ejecutándose.'}
          </p>
          <div className="mb-4 p-3 bg-gray-100 rounded text-sm text-left">
            <p className="font-semibold">Para solucionar este problema:</p>
            <ol className="list-decimal pl-5 mt-2 space-y-1">
              <li>Asegúrate de que el servidor backend esté ejecutándose.</li>
              <li>Verifica que el puerto 5000 esté disponible.</li>
              <li>Revisa la consola del backend para posibles errores.</li>
            </ol>
          </div>
          <button 
            onClick={retryConnection}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center mx-auto"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reintentar conexión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-gray-100 min-h-screen font-sans md:ml-64">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Resumen de las métricas clave de tu restaurante.
          </p>
        </div>
        <div className="flex items-center text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          Conectado al servidor
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        <MetricCard 
          title="Órdenes Hoy"
          value={ordersToday}
          icon={<ShoppingCartIcon />}
          bgColor="bg-indigo-500"
          textColor="text-white"
        />
        <MetricCard 
          title="Ventas Totales"
          value={`$${totalSales.toFixed(2)}`}
          icon={<DollarSignIcon />}
          bgColor="bg-green-500"
          textColor="text-white"
        />
        <MetricCard 
          title="Mesas Ocupadas"
          value={`${tablesStatus.occupied}/${tablesStatus.total}`}
          icon={<BoxIcon />}
          bgColor="bg-blue-500"
          textColor="text-white"
        />
        <MetricCard 
          title="Productos"
          value={productsCount}
          icon={<UtensilsIcon />}
          bgColor="bg-red-500"
          textColor="text-white"
        />
      </div>
      
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Acciones Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition duration-300 transform hover:-translate-y-1 shadow-md">
            Crear Orden
          </button>
          <button className="bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition duration-300 transform hover:-translate-y-1 shadow-md">
            Gestionar Productos
          </button>
          <button className="bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-300 transform hover:-translate-y-1 shadow-md">
            Ver Inventario
          </button>
          <button className="bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition duration-300 transform hover:-translate-y-1 shadow-md">
            Generar Reporte
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;