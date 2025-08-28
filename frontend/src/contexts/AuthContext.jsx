// frontend/src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChange, 
  loginWithEmailAndPassword, 
  logoutUser, 
  getCurrentUser
} from '../services/firebase';
import { getProfile } from '../services/api'; // Importa la función 'getProfile'

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false); // Nuevo estado

  // Función para iniciar sesión
  const login = async (email, password) => {
  try {
    setIsLoggingIn(true);
    setError('');

    // Limpia cualquier sesión previa
    await logoutUser();
    
    const result = await loginWithEmailAndPassword(email, password);

    if (!result.success) {
      setError(result.error);
      setIsLoggingIn(false); 
      return { success: false, error: result.error };
    }

    const user = getCurrentUser();
    const idToken = await user.getIdToken(true);
    console.log('Firebase login successful, token:', idToken);

    // Almacenar el token en localStorage
    localStorage.setItem('token', idToken);

    try {
      const profileResponse = await getProfile();
      console.log('Profile response:', profileResponse);

      if (profileResponse.success) {
        setUserProfile(profileResponse.user); 
        setCurrentUser(user);
        setIsLoggingIn(false);
        return { success: true };
      } else {
        throw new Error('Error al obtener perfil: ' + profileResponse.message);
      }
    } catch (profileError) {
      console.error('Error getting profile:', profileError);
      await logoutUser();
      localStorage.removeItem('token'); // Limpiar token en caso de error
      setError(profileError.message);
      setIsLoggingIn(false);
      return { success: false, error: profileError.message };
    }
  } catch (error) {
    console.error('Error en login:', error);
    await logoutUser();
    localStorage.removeItem('token'); // Limpiar token en caso de error
    setError(error.message);
    setIsLoggingIn(false);
    return { success: false, error: error.message };
  }
};


  // Función para cerrar sesión
  const logout = async () => {
  try {
    setLoading(true);
    await logoutUser();
    setCurrentUser(null);
    setUserProfile(null);
    setError('');
    localStorage.removeItem('token'); // Limpiar token al cerrar sesión
    return { success: true };
  } catch (error) {
    console.error('Error en logout:', error);
    setError(error.message);
    return { success: false, error: error.message };
  } finally {
    setLoading(false);
  }
};

// Efecto para observar cambios en el estado de autenticación
useEffect(() => {
  const unsubscribe = onAuthStateChange(async (user) => {
    if (isLoggingIn) {
      return;
    }
    
    setLoading(true);
    setCurrentUser(user);
    
    if (user) {
      try {
        const idToken = await user.getIdToken(true);
        localStorage.setItem('token', idToken); // Almacenar token
        const profileResponse = await getProfile();
        
        if (profileResponse.success) {
          setUserProfile(profileResponse.user);
        } else {
          await logoutUser();
          localStorage.removeItem('token'); // Limpiar token en caso de error
          setCurrentUser(null);
          setUserProfile(null);
        }
      } catch (error) {
        console.error('Error al obtener perfil en useEffect:', error);
        await logoutUser();
        localStorage.removeItem('token'); // Limpiar token en caso de error
        setCurrentUser(null);
        setUserProfile(null);
      }
    } else {
      setUserProfile(null);
      localStorage.removeItem('token'); // Limpiar token cuando no hay usuario
    }
    
    setLoading(false);
  });

  return unsubscribe;
}, [isLoggingIn]);

  // Función para obtener el token de autenticación
  const getAuthToken = async () => {
    try {
      const user = getCurrentUser();
      if (user) {
        return await user.getIdToken();
      }
      return null;
    } catch (error) {
      console.error('Error al obtener token:', error);
      return null;
    }
  };

  // Efecto para observar cambios en el estado de autenticación (sólo para recargas de página)
  useEffect(() => {
  const unsubscribe = onAuthStateChange(async (user) => {
    // Si estamos en proceso de login activo, salimos de este efecto
    if (isLoggingIn) {
      // ✅ No hacemos nada si el login ya está en curso
      return;
    }
    
    setLoading(true);
    setCurrentUser(user);
    
    if (user) {
      try {
        const idToken = await user.getIdToken(true); 
        const profileResponse = await getProfile(idToken);
        
        if (profileResponse.success) {
          setUserProfile(profileResponse.user);
        } else {
          // Si el token es inválido o expirado, se fuerza el logout
          await logoutUser();
          setCurrentUser(null);
          setUserProfile(null);
        }
      } catch (error) {
        console.error('Error al obtener perfil en useEffect:', error);
        await logoutUser();
        setCurrentUser(null);
        setUserProfile(null);
      }
    } else {
      setUserProfile(null);
    }
    
    setLoading(false);
  });

  return unsubscribe;
}, [isLoggingIn]); // Esto es correcto.

  // Valores que estarán disponibles a través del contexto
  const value = {
    currentUser,
    userProfile,
    loading,
    error,
    login,
    logout,
    getAuthToken,
    isAuthenticated: !!userProfile,
    hasRole: (role) => {
      if (!userProfile) return false;
      return userProfile.role === role || userProfile.role === 'admin';
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

const testToken = async (token) => {
  try {
    const response = await api.post('/test/test-token', { token });
    return response.data;
  } catch (error) {
    console.error('Error testing token:', error);
    throw error;
  }
};

// Función para iniciar sesión
const login = async (email, password) => {
  try {
    setIsLoggingIn(true);
    setError('');

    // Limpia cualquier sesión previa
    await logoutUser();
    
    const result = await loginWithEmailAndPassword(email, password);

    if (!result.success) {
      setError(result.error);
      setIsLoggingIn(false); 
      return { success: false, error: result.error };
    }

    const user = getCurrentUser();
    const idToken = await user.getIdToken(true);
    console.log('Firebase login successful, token:', idToken);

    // Probar el token con el backend
    try {
      const testResult = await testToken(idToken);
      console.log('Token test result:', testResult);
    } catch (testError) {
      console.error('Token test failed:', testError);
      throw new Error('El token no es válido en el backend: ' + testError.message);
    }

    // Almacenar el token en localStorage
    localStorage.setItem('token', idToken);

    try {
      const profileResponse = await getProfile();
      console.log('Profile response:', profileResponse);

      if (profileResponse.success) {
        setUserProfile(profileResponse.user); 
        setCurrentUser(user);
        setIsLoggingIn(false);
        return { success: true };
      } else {
        throw new Error('Error al obtener perfil: ' + profileResponse.message);
      }
    } catch (profileError) {
      console.error('Error getting profile:', profileError);
      await logoutUser();
      localStorage.removeItem('token');
      setError(profileError.message);
      setIsLoggingIn(false);
      return { success: false, error: profileError.message };
    }
  } catch (error) {
    console.error('Error en login:', error);
    await logoutUser();
    localStorage.removeItem('token');
    setError(error.message);
    setIsLoggingIn(false);
    return { success: false, error: error.message };
  }
};
export default AuthContext;