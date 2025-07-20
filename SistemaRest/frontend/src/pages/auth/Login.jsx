import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Asegúrate que la ruta sea correcta
import Spinner from '../../components/ui/Spinner'; // Asumiendo que tienes un componente Spinner
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUtensils, FaReceipt, FaChartLine } from 'react-icons/fa'; // Asegúrate de importar todos los iconos que usas

const RestaurantLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();
  const { login } = useAuth(); // Usamos la función 'login' del AuthContext

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // --- CAMBIO CLAVE AQUÍ: Pasar 'email' y 'password' como argumentos SEPARADOS ---
      // La función 'login' en AuthContext espera dos strings: email y password.
      await login(email, password); // Correcto: pasa las cadenas 'email' y 'password'

      setSuccess('¡Inicio de sesión exitoso! Redirigiendo...');
      // Si AuthContext no maneja la redirección internamente para el login,
      // mantén esta línea. Si sí lo hace, puedes eliminarla.
      // Basado en tu AuthContext.jsx anterior, el login no redirige, así que esta línea es necesaria.
      setTimeout(() => navigate('/dashboard'), 1500); 

    } catch (err) {
      // Maneja diferentes tipos de errores
      let errorMessage = 'Error desconocido al iniciar sesión.';
      
      if (err.response) {
        // Error de respuesta del servidor
        if (err.response.status === 401) {
          errorMessage = 'Credenciales inválidas. Verifica tu email y contraseña.';
        } else if (err.response.status === 500) {
          errorMessage = 'Error del servidor. Intenta nuevamente más tarde.';
        } else {
          errorMessage = `Error ${err.response.status}: ${err.response.data.message || 'Error de autenticación'}`;
        }
      } else if (err.request) {
        // Error de red (sin respuesta del servidor)
        errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
      } else {
        // Error en el código
        errorMessage = err.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-300 to-purple-400">
      <Spinner size="lg" />
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-300 to-purple-400">
      <div className="max-w-5xl w-full bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col lg:flex-row border-none">
        {/* Panel Izquierdo - Contenido de marketing/informativo */}
        <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col items-center justify-center bg-white border-b lg:border-r border-gray-100">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-blue-700 mb-4 animate-fadeInDown">
              ¡Bienvenido a <span className="text-purple-600">Restaurante POS</span>!
            </h1>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed animate-fadeIn">
              Gestiona tus órdenes, inventario y recetas de forma eficiente.
            </p>
            <div className="grid grid-cols-2 gap-6 text-gray-600 animate-fadeInUp">
              <div className="flex items-center justify-center flex-col p-4 bg-blue-50 rounded-lg shadow-sm transform hover:scale-105 transition-transform duration-300">
                <FaUtensils className="text-blue-500 text-3xl mb-2" />
                <span className="text-sm font-semibold">Órdenes Rápidas</span>
              </div>
              <div className="flex items-center justify-center flex-col p-4 bg-purple-50 rounded-lg shadow-sm transform hover:scale-105 transition-transform duration-300">
                <FaReceipt className="text-purple-500 text-3xl mb-2" />
                <span className="text-sm font-semibold">Gestión de Inventario</span>
              </div>
              <div className="flex items-center justify-center flex-col p-4 bg-green-50 rounded-lg shadow-sm transform hover:scale-105 transition-transform duration-300">
                <FaChartLine className="text-green-500 text-3xl mb-2" />
                <span className="text-sm font-semibold">Reportes Detallados</span>
              </div>
              <div className="flex items-center justify-center flex-col p-4 bg-yellow-50 rounded-lg shadow-sm transform hover:scale-105 transition-transform duration-300">
                <FaLock className="text-yellow-500 text-3xl mb-2" />
                <span className="text-sm font-semibold">Seguridad Robusta</span>
              </div>
            </div>
            <p className="mt-8 text-gray-500 text-sm">
              ¿Eres nuevo? <a href="/register" className="text-blue-600 hover:underline font-medium">Regístrate aquí</a>
            </p>
          </div>
        </div>

        {/* Panel Derecho - Formulario de Inicio de Sesión */}
        <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col items-center justify-center bg-white">
          <div className="w-full max-w-lg">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Iniciar sesión</h2>
              <p className="text-gray-600">Ingresa tus credenciales para acceder al panel</p>
            </div>

            {/* Mensajes de error y éxito */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-md" role="alert">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4 rounded-md" role="alert">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700 font-medium">{success}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-colors duration-200"
                    placeholder="tu@ejemplo.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-colors duration-200"
                    placeholder="Contraseña"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={togglePasswordVisibility}>
                    {showPassword ? (
                      <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors duration-200" />
                    ) : (
                      <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors duration-200" />
                    )}
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out"
                >
                  {loading ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Iniciando sesión...
                    </>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </button>
              </div>
            </form>
            
            <p className="mt-6 text-center text-sm text-gray-600">
              ¿Olvidaste tu contraseña? <a href="#" className="font-medium text-blue-600 hover:underline">Restablecer</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantLogin;