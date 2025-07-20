import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import Sidebar from '../layout/Sidebar'; // Asegúrate de que esta ruta sea correcta
import Navbar from '../layout/Navbar';   // <--- ¡IMPORTA EL NUEVO COMPONENTE NAVBAR AQUÍ!
import Spinner from '../../components/ui/Spinner'; // O cualquier componente de carga que uses
import ErrorAlert from '../../components/ui/ErrorAlert'; // O cualquier componente de error que uses
import { showToast } from '../../components/ui/Toast'; // Asegúrate de importar showToast

const DashboardLayout = () => {
    // Obtiene el estado de autenticación y la función logout
    const { isLoggedIn, user, loading: authLoading } = useAuth();
    // Obtiene el estado de configuración
    const { settings, loading: settingsLoading, error: settingsError } = useSettings();
    const navigate = useNavigate();

    // Log para ver el estado de carga
    console.log('DashboardLayout: Estado de carga -> authLoading:', authLoading, 'settingsLoading:', settingsLoading);

    // Redirige si no está logueado y la autenticación ha terminado de cargar
    useEffect(() => {
        if (!authLoading && !isLoggedIn) {
            console.log('DashboardLayout: Usuario no logueado, redirigiendo a /login');
            showToast('Tu sesión ha expirado o es inválida. Por favor, inicia sesión.', 'error');
            navigate('/login');
        }
    }, [authLoading, isLoggedIn, navigate]);

    // Manejo de errores al cargar las configuraciones
    useEffect(() => {
        if (settingsError) {
            console.error('DashboardLayout: Error al cargar la configuración:', settingsError);
            showToast("Error al cargar la configuración. Algunas funcionalidades pueden no estar disponibles.", 'error');
        }
    }, [settingsError]);

    // Muestra un spinner de carga si cualquiera de los contextos está cargando
    if (authLoading || settingsLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <Spinner />
                <p className="ml-2 text-gray-700">Cargando dashboard...</p>
            </div>
        );
    }

    // Si no está logueado después de que la carga inicial terminó, no renderiza el contenido del dashboard.
    // La redirección a /login ya se maneja en el useEffect.
    if (!isLoggedIn) {
        return null; // O podrías renderizar un mensaje de "Acceso Denegado"
    }

    // Si la configuración aún es nula después de la carga (aunque settingsLoading sea false, por alguna razón)
    if (!settings) {
        console.warn('DashboardLayout: La configuración no se ha cargado correctamente (objeto nulo). El menú podría estar vacío.');
        return (
            <div className="flex items-center justify-center min-h-screen bg-yellow-100 text-yellow-700">
                <p>Preparando el dashboard... Si esto tarda, por favor, recarga la página.</p>
            </div>
        );
    }

    console.log('DashboardLayout: Renderizando layout con usuario y configuración cargados.');
    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar /> {/* La barra lateral fija */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* ¡Aquí se renderiza el componente Navbar! */}
                {/* Asegúrate de que la ruta de importación de Navbar sea correcta */}
                <Navbar /> 
                
                {/* Contenido principal que cambian las rutas */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    <Outlet /> {/* Aquí se renderizan los componentes de tus rutas anidadas */}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;