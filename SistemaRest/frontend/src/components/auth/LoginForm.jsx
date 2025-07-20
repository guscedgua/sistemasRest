import React, { useState } from 'react';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUtensils, FaReceipt, FaChartLine } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/ui/Spinner';

const RestaurantLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();
  const { login } = useAuth(); // Destructure the login function from useAuth

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('RestaurantLogin: Attempting login with:', { email, password }); // Confirm values before sending
      await login(email, password); // Call the login function from AuthContext

      setSuccess('¡Inicio de sesión exitoso! Redirigiendo...');
      setTimeout(() => navigate('/dashboard'), 1500);

    } catch (err) {
      console.error('RestaurantLogin: Login failed:', err.message); // Log the error message
      setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  if (loading) return <Spinner />;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      background: 'linear-gradient(to bottom right, #93c5fd, #d8b4fe)'
    }}>
      <div style={{
        maxWidth: '80rem',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        border: 'none'
      }}>
        {/* Panel Izquierdo: Información del Producto/App */}
        <div style={{
          padding: '2rem 3rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h1 style={{
              fontSize: '2.25rem',
              fontWeight: 800,
              color: '#7e22ce',
              marginBottom: '0.5rem'
            }}>
              RestaurantApp
            </h1>
            <p style={{ color: '#4b5563', fontWeight: 600 }}>
              Gestión integral para restaurantes
            </p>
          </div>

          <div style={{ width: '100%', maxWidth: '28rem', display: 'grid', gap: '2.5rem' }}>
            {[
              {
                icon: <FaUtensils style={{ color: '#2563eb', fontSize: '1.5rem' }} />,
                title: 'Gestión de Menú',
                description: 'Actualiza tu menú en tiempo real'
              },
              {
                icon: <FaReceipt style={{ color: '#22c55e', fontSize: '1.5rem' }} />,
                title: 'Pedidos Automatizados',
                description: 'Sistema de pedidos simplificado'
              },
              {
                icon: <FaChartLine style={{ color: '#eab308', fontSize: '1.5rem' }} />,
                title: 'Reportes en Tiempo Real',
                description: 'Analiza tus ventas y tendencias'
              }
            ].map((feature, index) => (
              <div key={index} style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                  {feature.icon}
                </div>
                <h3 style={{
                  fontWeight: 'bold',
                  fontSize: '1.25rem',
                  color: '#1f2937',
                  marginBottom: '0.25rem'
                }}>
                  {feature.title}
                </h3>
                <p style={{ color: '#4b5563' }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Panel Derecho - Formulario de Inicio de Sesión */}
        <div style={{
          padding: '2rem 3rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'white'
        }}>
          <div style={{ width: '100%', maxWidth: '32rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{
                fontSize: '1.875rem',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '0.5rem'
              }}>
                Iniciar sesión
              </h2>
              <p style={{ color: '#4b5563' }}>
                Ingresa tus credenciales para acceder al panel
              </p>
            </div>

            {/* Mensajes de error y éxito */}
            {error && (
              <div style={{
                backgroundColor: '#fee2e2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                padding: '0.75rem 1rem',
                borderRadius: '0.375rem',
                position: 'relative',
                marginBottom: '1rem'
              }}>
                <span>{error}</span>
              </div>
            )}
            
            {success && (
              <div style={{
                backgroundColor: '#dcfce7',
                border: '1px solid #bbf7d0',
                color: '#15803d',
                padding: '0.75rem 1rem',
                borderRadius: '0.375rem',
                position: 'relative',
                marginBottom: '1rem'
              }}>
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
              {/* Campo de Email */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#374151',
                  marginBottom: '0.5rem',
                  textAlign: 'center'
                }}>
                  Ingresa tu email
                </label>
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  justifyContent: 'center',
                  margin: '0 auto',
                  maxWidth: '24rem'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none'
                  }}>
                    <FaEnvelope style={{ color: '#9ca3af' }} />
                  </div>
                  <input
                    type="email"
                    style={{
                      width: '100%',
                      paddingLeft: '2.5rem',
                      paddingRight: '1rem',
                      paddingTop: '0.75rem',
                      paddingBottom: '0.75rem',
                      borderRadius: '0.5rem',
                      border: '1px solid #d8b4fe',
                      outline: 'none',
                      boxShadow: '0 0 0 2px rgba(216, 180, 254, 0.5)'
                    }}
                    placeholder="ejemplo@restaurante.com"
                    value={email}
                    // *** CORRECCIÓN CLAVE AQUÍ ***
                    // Asegúrate de que estás usando e.target.value
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Campo de Contraseña */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#374151',
                  marginBottom: '0.5rem',
                  textAlign: 'center'
                }}>
                  Contraseña
                </label>
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  justifyContent: 'center',
                  margin: '0 auto',
                  maxWidth: '24rem'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none'
                  }}>
                    <FaLock style={{ color: '#9ca3af' }} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    style={{
                      width: '100%',
                      paddingLeft: '2.5rem',
                      paddingRight: '2.5rem',
                      paddingTop: '0.75rem',
                      paddingBottom: '0.75rem',
                      borderRadius: '0.5rem',
                      border: '1px solid #d8b4fe',
                      outline: 'none',
                      boxShadow: '0 0 0 2px rgba(216, 180, 254, 0.5)'
                    }}
                    placeholder="••••••••"
                    value={password}
                    // *** CORRECCIÓN CLAVE AQUÍ ***
                    // Asegúrate de que estás usando e.target.value
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    right: '0.75rem',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <button
                      type="button"
                      style={{
                        color: '#9ca3af',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                      onClick={togglePasswordVisibility}
                      disabled={loading}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Botón de Iniciar Sesión */}
              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    maxWidth: '24rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.5rem',
                    fontWeight: 600,
                    color: 'white',
                    background: 'linear-gradient(to right, #22c55e, #3b82f6)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease-in-out',
                    opacity: loading ? 0.75 : 1
                  }}
                  disabled={loading}
                >
                  {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantLogin;