// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axiosInstance from '../api/axios'; // Importa tu instancia de axios configurada
import { showToast } from '../components/ui/Toast'; // Asumiendo que tienes un componente Toast para notificaciones
import { useNavigate } from 'react-router-dom'; // Importa useNavigate para redirección

// Crea el Contexto de Autenticación
const AuthContext = createContext(null);

// Hook personalizado para consumir el Contexto de Autenticación
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Componente Proveedor de Autenticación
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true); // Para gestionar el estado de carga inicial

    const navigate = useNavigate(); // Inicializa useNavigate

    // Memoriza setAuthData para prevenir renderizados innecesarios en componentes dependientes
    const setAuthData = useCallback((userData, accessToken) => {
        try {
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', accessToken);
            setUser(userData);
            setToken(accessToken);
            setIsLoggedIn(true);
            console.log('AuthContext: Datos de autenticación establecidos. Usuario:', userData, 'Token (primeros 10 chars):', accessToken?.substring(0, 10));
        } catch (error) {
            console.error('AuthContext: Fallo al guardar los datos de autenticación en localStorage:', error);
            // Fallback para limpiar si falla el guardado
            clearAuthData();
        }
    }, []); // Sin dependencias ya que está configurando el estado interno

    // Memoriza clearAuthData
    const clearAuthData = useCallback(() => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
        setIsLoggedIn(false);
        console.log('AuthContext: Datos de autenticación limpiados.');
    }, []); // Sin dependencias ya que está limpiando el estado interno

    // Carga los datos de autenticación de localStorage al montaje inicial
    useEffect(() => {
        console.log('AuthContext: Inicializando desde localStorage...');
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        if (storedUser && storedToken) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setAuthData(parsedUser, storedToken);
                // >>> LÍNEA ELIMINADA: Ya no se establece el encabezado predeterminado de Axios aquí.
                // El interceptor de solicitudes en axios.js se encarga de esto dinámicamente.
                console.log('AuthContext: Datos de autenticación cargados desde localStorage.');
            } catch (error) {
                console.error('AuthContext: Error al analizar el usuario o token almacenado, limpiando datos:', error);
                clearAuthData();
            }
        } else {
            console.log('AuthContext: No se encontraron datos de autenticación en localStorage.');
        }
        setLoading(false); // Establece loading a false una vez que la inicialización se completa
    }, [setAuthData, clearAuthData]); // Depende de los setters memorizados

    // Función de inicio de sesión
    const login = useCallback(async (email, password) => {
        try {
            console.log('AuthContext: Attempting login with (args):', { email, password });
            const dataToSend = { email, password };
            console.log('AuthContext: Data to be sent to backend:', dataToSend);

            const response = await axiosInstance.post('/auth/login', dataToSend);
            const { user: userData, token } = response.data;

            setAuthData(userData, token); // Almacena los datos y actualiza el estado
            showToast('Inicio de sesión exitoso!', 'success');
            console.log('AuthContext: ¡Inicio de sesión exitoso! El usuario ahora es:', userData);
            return userData;

        } catch (error) {
            console.error('AuthContext: Error durante el inicio de sesión:', error.response?.data?.message || error.message);
            const errorMessage = error.response?.data?.message || 'Error de conexión. Inténtalo de nuevo.';
            showToast(errorMessage, 'error');
            clearAuthData(); // Limpia cualquier dato de autenticación parcial o antiguo
            throw new Error(errorMessage);
        }
    }, [setAuthData, clearAuthData]);

    // Función de cierre de sesión
    const logout = useCallback(async () => {
        try {
            await axiosInstance.post('/auth/logout');
            showToast('Sesión cerrada exitosamente.', 'info');
        } catch (error) {
            console.error('AuthContext: Error durante la llamada a la API de cierre de sesión:', error);
            showToast('Error al cerrar sesión en el servidor. Intentando limpieza local.', 'error');
        } finally {
            clearAuthData(); // Siempre limpia los datos locales
            navigate('/login'); // Redirige a la página de inicio de sesión después del cierre de sesión
        }
    }, [clearAuthData, navigate]);

    // Valor proporcionado por el contexto
    const authContextValue = {
        user,
        token,
        isLoggedIn,
        loading, // Proporciona el estado de carga
        login,
        logout,
        setAuthData,
        clearAuthData,
    };

    if (loading) {
        // Podrías querer renderizar un spinner o cargador global aquí
        return <div>Cargando autenticación...</div>;
    }

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};