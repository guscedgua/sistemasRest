import { useState } from 'react';
import useApi from '../../hooks/useApi';
import { getInventoryItems } from '../../api/inventory';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom'; // <-- ¡Añade esta línea!

const Inventory = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const { data, loading, error, execute } = useApi(getInventoryItems, { immediate: true });
  
  const filteredItems = data?.items?.filter(item => 
    item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Gestión de Inventario</h1>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Buscar artículo..."
            className="px-4 py-2 border rounded"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {user?.role === 'admin' && (
            <Button variant="primary" as={Link} to="/inventory/new">
              Nuevo Artículo
            </Button>
          )}
          <Button variant="secondary" onClick={execute}>
            Actualizar
          </Button>
        </div>
      </div>
      
      {loading && <Spinner />}
      {error && <div className="text-red-500">Error: {error}</div>}
      
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Artículo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proveedor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems?.map(item => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{item.itemName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      item.quantity < item.minStock ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {item.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.supplier?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link to={`/inventory/${item._id}`} className="text-blue-600 hover:text-blue-900 mr-3">
                      Editar
                    </Link>
                    {user?.role === 'admin' && (
                      <button className="text-red-600 hover:text-red-900">
                        Eliminar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredItems?.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No se encontraron artículos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Inventory;