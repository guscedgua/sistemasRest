// frontend/src/components/layout/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
    // Obtiene la función isModuleEnabled y el estado de carga de la configuración del contexto de Settings
    const { isModuleEnabled, loading: settingsLoading } = useSettings();
    // Obtiene el usuario, el estado de autenticación (isLoggedIn) y el estado de carga del AuthContext
    const { user, isLoggedIn, loading: authLoading } = useAuth(); // ¡IMPORTANTE: Usar isLoggedIn!

    // --- Lógica de Carga y Autenticación ---
    // Muestra un estado de carga mientras se obtienen los settings o el usuario
    if (settingsLoading || authLoading) {
        return (
            // CORREGIDO: Eliminado 'fixed' y 'z-20'
            <div className="w-64 bg-gray-900 text-white h-full flex flex-col shadow-lg">
                <div className="p-4 text-2xl font-extrabold border-b border-gray-700 text-blue-400">
                    RestaurantApp
                </div>
                <nav className="flex-1 py-5 overflow-y-auto">
                    <div className="flex items-center px-6 py-3 text-gray-300">
                        <span className="mr-3 text-xl">⏳</span>
                        <span className="font-medium text-lg">Cargando módulos...</span>
                    </div>
                </nav>
            </div>
        );
    }

    // Si no está autenticado o no hay usuario después de cargar,
    // se muestra una versión limitada de la barra lateral (solo Dashboard).
    // Esto previene que se muestren enlaces no autorizados si hay un problema con la autenticación.
    if (!isLoggedIn || !user) {
        return (
            // CORREGIDO: Eliminado 'fixed' y 'z-20'
            <div className="w-64 bg-gray-900 text-white h-full flex flex-col shadow-lg">
                <div className="p-4 text-2xl font-extrabold border-b border-gray-700 text-blue-400">
                    RestaurantApp
                </div>
                <nav className="flex-1 py-5 overflow-y-auto">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200 ease-in-out
                            ${isActive ? 'bg-gray-700 text-blue-300 border-l-4 border-blue-400' : 'border-l-4 border-transparent'}`
                        }
                    >
                        <span className="mr-3 text-xl">📊</span>
                        <span className="font-medium text-lg">Dashboard</span>
                    </NavLink>
                    {/* Aquí podrías añadir otros módulos que sean accesibles sin autenticación si los hubiera */}
                </nav>
            </div>
        );
    }

    // --- Renderizado de Módulos (Usuario Autenticado) ---
    return (
        // CORREGIDO: Eliminado 'fixed' y 'z-20'
        <div className="w-64 bg-gray-900 text-white h-full flex flex-col shadow-lg">
            <div className="p-4 text-2xl font-extrabold border-b border-gray-700 text-blue-400">
                RestaurantApp
            </div>
            <nav className="flex-1 py-5 overflow-y-auto">
                {/* Enlace Dashboard - normalmente siempre visible */}
                {isModuleEnabled('dashboard') && (
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200 ease-in-out
                            ${isActive ? 'bg-gray-700 text-blue-300 border-l-4 border-blue-400' : 'border-l-4 border-transparent'}`
                        }
                    >
                        <span className="mr-3 text-xl">📊</span>
                        <span className="font-medium text-lg">Dashboard</span>
                    </NavLink>
                )}

                {/* Enlace Pedidos */}
                {isModuleEnabled('pedidos') && (
                    <NavLink
                        to="/orders"
                        className={({ isActive }) =>
                            `flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200 ease-in-out
                            ${isActive ? 'bg-gray-700 text-blue-300 border-l-4 border-blue-400' : 'border-l-4 border-transparent'}`
                        }
                    >
                        <span className="mr-3 text-xl">📋</span>
                        <span className="font-medium text-lg">Pedidos</span>
                    </NavLink>
                )}

                {/* Enlace Productos */}
                {isModuleEnabled('products') && (
                    <NavLink
                        to="/products"
                        className={({ isActive }) =>
                            `flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200 ease-in-out
                            ${isActive ? 'bg-gray-700 text-blue-300 border-l-4 border-blue-400' : 'border-l-4 border-transparent'}`
                        }
                    >
                        <span className="mr-3 text-xl">🍔</span>
                        <span className="font-medium text-lg">Productos</span>
                    </NavLink>
                )}

                {/* Enlace Recetas */}
                {isModuleEnabled('recipes') && (
                    <NavLink
                        to="/recipes"
                        className={({ isActive }) =>
                            `flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200 ease-in-out
                            ${isActive ? 'bg-gray-700 text-blue-300 border-l-4 border-blue-400' : 'border-l-4 border-transparent'}`
                        }
                    >
                        <span className="mr-3 text-xl">📝</span>
                        <span className="font-medium text-lg">Recetas</span>
                    </NavLink>
                )}

                {/* Enlace Inventario */}
                {isModuleEnabled('inventory') && (
                    <NavLink
                        to="/inventory"
                        className={({ isActive }) =>
                            `flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200 ease-in-out
                            ${isActive ? 'bg-gray-700 text-blue-300 border-l-4 border-blue-400' : 'border-l-4 border-transparent'}`
                        }
                    >
                        <span className="mr-3 text-xl">📦</span>
                        <span className="font-medium text-lg">Inventario</span>
                    </NavLink>
                )}

                {/* Enlace Mesas */}
                {isModuleEnabled('mesas') && (
                    <NavLink
                        to="/tables"
                        className={({ isActive }) =>
                            `flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200 ease-in-out
                            ${isActive ? 'bg-gray-700 text-blue-300 border-l-4 border-blue-400' : 'border-l-4 border-transparent'}`
                        }
                    >
                        <span className="mr-3 text-xl">🪑</span>
                        <span className="font-medium text-lg">Mesas</span>
                    </NavLink>
                )}

                {/* Enlace Usuarios */}
                {isModuleEnabled('users') && (
                    <NavLink
                        to="/users"
                        className={({ isActive }) =>
                            `flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200 ease-in-out
                            ${isActive ? 'bg-gray-700 text-blue-300 border-l-4 border-blue-400' : 'border-l-4 border-transparent'}`
                        }
                    >
                        <span className="mr-3 text-xl">👥</span>
                        <span className="font-medium text-lg">Usuarios</span>
                    </NavLink>
                )}

                {/* Enlace Reportes */}
                {isModuleEnabled('reports') && (
                    <NavLink
                        to="/reports"
                        className={({ isActive }) =>
                            `flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200 ease-in-out
                            ${isActive ? 'bg-gray-700 text-blue-300 border-l-4 border-blue-400' : 'border-l-4 border-transparent'}`
                        }
                    >
                        <span className="mr-3 text-xl">📈</span>
                        <span className="font-medium text-lg">Reportes</span>
                    </NavLink>
                )}

                {/* Enlace Proveedores */}
                {isModuleEnabled('suppliers') && (
                    <NavLink
                        to="/suppliers"
                        className={({ isActive }) =>
                            `flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200 ease-in-out
                            ${isActive ? 'bg-gray-700 text-blue-300 border-l-4 border-blue-400' : 'border-l-4 border-transparent'}`
                        }
                    >
                        <span className="mr-3 text-xl">🚚</span>
                        <span className="font-medium text-lg">Proveedores</span>
                    </NavLink>
                )}

                {/* Enlace Configuración */}
                {isModuleEnabled('settings') && (
                    <NavLink
                        to="/settings"
                        className={({ isActive }) =>
                            `flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200 ease-in-out
                            ${isActive ? 'bg-gray-700 text-blue-300 border-l-4 border-blue-400' : 'border-l-4 border-transparent'}`
                        }
                    >
                        <span className="mr-3 text-xl">⚙️</span>
                        <span className="font-medium text-lg">Configuración</span>
                    </NavLink>
                )}
            </nav>
        </div>
    );
};

export default Sidebar;