// frontend/src/context/SettingsContext.jsx
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getSettings, updateSettings as updateSettingsAPI } from '../api/settings';
import { useAuth } from './AuthContext';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user, isLoggedIn, loading: authLoading } = useAuth(); 

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await getSettings();
            setSettings(response.data.settings);
            setError(null);
        } catch (err) {
            console.error('Error al cargar la configuración del sistema:', err);
            if (!authLoading && isLoggedIn) {
                setError('Error al cargar la configuración del sistema. Por favor, inténtelo de nuevo.');
            } else if (!authLoading && !isLoggedIn) {
                setError('No está autenticado o no tiene permisos para cargar la configuración.');
            } else {
                setError(null);
            }
        } finally {
            setLoading(false);
        }
    };

    const updateSystemSettings = async (newSettingsData) => {
        try {
            const response = await updateSettingsAPI(newSettingsData);
            setSettings(response.data.settings);
            setError(null);
            return response.data.settings;
        } catch (err) {
            console.error('Error al actualizar configuración:', err);
            setError('Error al actualizar configuración. Por favor, inténtelo de nuevo.');
            throw err;
        }
    };

    // --- CORRECCIÓN CRÍTICA AQUÍ ---
    useEffect(() => {
        // Carga la configuración solo después de que se resuelva el estado de autenticación inicial
        // Y SOLO SI el usuario está autenticado.
        if (!authLoading && isLoggedIn) { // <-- ¡DESCOMENTADO Y EN USO!
            console.log('SettingsContext: Auth listo e isLoggedIn es TRUE. Cargando settings...');
            fetchSettings();
        } else if (!authLoading && !isLoggedIn) {
             console.log('SettingsContext: Auth listo e isLoggedIn es FALSE. No se cargan settings.');
             // Puedes limpiar settings si el usuario se desloguea
             setSettings(null); 
             setLoading(false);
        }
    }, [authLoading, isLoggedIn]); // Dependencias: se ejecuta cuando authLoading o isLoggedIn cambian

    const isModuleEnabled = useCallback((moduleName) => {
        // --- CONSOLE.LOGS DE DEPURACIÓN (MANTÉNLOS PARA VERIFICAR) ---
        console.groupCollapsed(`isModuleEnabled('${moduleName}')`);
        console.log('  1. Estado actual del Contexto Settings:', { settings, loading, error });
        console.log('  2. Estado actual del Contexto Auth:', { user, isLoggedIn, authLoading });
        console.log('  3. Rol del usuario (user?.role):', user?.role);

        if (!settings || !settings.moduleAccess) {
            console.log(`  4. Módulo ${moduleName} NO habilitado: 'settings' o 'settings.moduleAccess' es nulo/indefinido.`);
            console.groupEnd();
            return false;
        }

        const rolesAllowed = settings.moduleAccess[moduleName] || [];
        console.log(`  5. 'rolesAllowed' para '${moduleName}':`, rolesAllowed);

        if (!Array.isArray(rolesAllowed)) {
            console.warn(`  6. moduleAccess.${moduleName} NO es un array en la configuración. Revisa el backend.`);
            console.groupEnd();
            return false;
        }

        if (rolesAllowed.includes('*')) {
            console.log(`  7. Módulo ${moduleName} HABILITADO: Contiene comodín '*'.`);
            console.groupEnd();
            return true;
        }

        if (!isLoggedIn) {
            console.log(`  8. Módulo ${moduleName} NO habilitado: Usuario NO logueado.`);
            console.groupEnd();
            return false;
        }

        const enabled = rolesAllowed.includes(user?.role);
        console.log(`  9. ¿Rol '${user?.role}' incluido en [${rolesAllowed.join(', ')}]? -> ${enabled}`);
        console.groupEnd();
        return enabled;
    }, [settings, isLoggedIn, user, loading, authLoading]);

    const value = {
        settings,
        loading,
        error,
        updateSystemSettings,
        refreshSettings: fetchSettings,
        isModuleEnabled
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings debe usarse dentro de un SettingsProvider');
    }
    return context;
};