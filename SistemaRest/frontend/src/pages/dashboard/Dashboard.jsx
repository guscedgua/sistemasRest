// frontend/src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { getDashboardMetric } from '../../api/settings'; // Asegúrate de que esta ruta y función son correctas
import Spinner from '../../components/ui/Spinner';
import useNotification from '../../hooks/useNotification'; 


const Dashboard = () => {
    const [ordersToday, setOrdersToday] = useState(0);
    const [totalSales, setTotalSales] = useState(0);
    const [tablesStatus, setTablesStatus] = useState({ occupied: 0, total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { showNotification } = useNotification();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);

                // --- Obtener todas las métricas en paralelo usando Promise.all ---
                const [ordersRes, salesRes, tablesRes] = await Promise.all([
                    getDashboardMetric('ordersToday', 1), // Asegúrate si el '1' es un parámetro siempre necesario
                    getDashboardMetric('totalSales'),
                    getDashboardMetric('tablesStatus')
                ]);

                // ACCESO CORREGIDO: ordersRes.data.data.value
                setOrdersToday(ordersRes.data.data.value || 0); 
                // ACCESO CORREGIDO: salesRes.data.data.value
                setTotalSales(salesRes.data.data.value || 0); 
                // ACCESO CORREGIDO: tablesRes.data.data.occupied y tablesRes.data.data.total
                setTablesStatus({
                    occupied: tablesRes.data.data.occupied || 0, 
                    total: tablesRes.data.data.total || 0 
                });

            } catch (err) {
                console.error("Error al cargar datos del dashboard:", err);
                const errorMessage = err.response?.data?.message || err.message || "Error desconocido al cargar el dashboard.";
                setError(errorMessage);
                showNotification(errorMessage, 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Manejo de estados de carga y error para la UI
    if (loading) {
        return (
            <div className="flex justify-center items-center h-full min-h-[500px]">
                <Spinner />
                <p className="text-gray-600 ml-3">Cargando datos del dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-full min-h-[500px] text-red-600 font-semibold text-lg">
                <p>Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-extrabold mb-8 text-gray-900 border-b pb-4">Panel de Control del Restaurante</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Tarjeta de Órdenes Hoy */}
                <div className="bg-white p-6 rounded-lg shadow-lg transform hover:scale-105 transition duration-300 ease-in-out border-l-4 border-blue-500">
                    <h2 className="text-lg font-semibold text-gray-700 mb-2">Órdenes Hoy</h2>
                    <p className="text-5xl font-bold text-blue-700">{ordersToday}</p>
                    <p className="text-sm text-gray-500 mt-2">Número de órdenes procesadas hoy.</p>
                </div>

                {/* Tarjeta de Ventas Totales */}
                <div className="bg-white p-6 rounded-lg shadow-lg transform hover:scale-105 transition duration-300 ease-in-out border-l-4 border-green-500">
                    <h2 className="text-lg font-semibold text-gray-700 mb-2">Ventas Totales</h2>
                    <p className="text-5xl font-bold text-green-700">${(totalSales || 0).toFixed(2)}</p>
                    <p className="text-sm text-gray-500 mt-2">Ingresos totales por órdenes completadas.</p>
                </div>

                {/* Tarjeta de Mesas Ocupadas */}
                <div className="bg-white p-6 rounded-lg shadow-lg transform hover:scale-105 transition duration-300 ease-in-out border-l-4 border-purple-500">
                    <h2 className="text-lg font-semibold text-gray-700 mb-2">Mesas Ocupadas</h2>
                    <p className="text-5xl font-bold text-purple-700">{tablesStatus.occupied}/{tablesStatus.total}</p>
                    <p className="text-sm text-gray-500 mt-2">Mesas actualmente ocupadas.</p>
                </div>
            </div>

            <div className="mt-10 p-6 bg-white rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Resumen Detallado</h2>
                <p className="text-gray-600">
                    Este panel proporciona una visión general del rendimiento actual de tu restaurante.
                    Asegúrate de que tu base de datos contenga datos para que las métricas se muestren correctamente.
                </p>
            </div>
        </div>
    );
};

export default Dashboard;