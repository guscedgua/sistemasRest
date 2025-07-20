import { useState, useEffect } from 'react';
import { getSettings, updateSettings } from '../../api/settings';
import Spinner from '../../components/ui/Spinner';
import useNotification from '../../hooks/useNotification';

const Settings = () => {
  const [formData, setFormData] = useState({
    restaurantName: '',
    currency: '$',
    taxRate: 0,
    useInventoryModule: false,
    useRecipeModule: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await getSettings();
        setFormData(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar configuración');
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateSettings(formData);
      showNotification('Configuración actualizada con éxito', 'success');
    } catch (err) {
      showNotification('Error al actualizar configuración', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Configuración del Sistema</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        {/* ... rest of form ... */}
      </form>
    </div>
  );
};

export default Settings;