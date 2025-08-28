import React, { useState, useEffect } from 'react';
import { getInventoryItems, addInventoryQuantity, removeInventoryQuantity } from '../../services/api';

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addQuantity, setAddQuantity] = useState({});
  const [removeQuantity, setRemoveQuantity] = useState({});

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await getInventoryItems();
      if (response.success) {
        setInventory(response.items);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuantity = async (itemId) => {
    if (!addQuantity[itemId] || addQuantity[itemId] <= 0) {
      alert('Por favor ingresa una cantidad válida');
      return;
    }

    try {
      const response = await addInventoryQuantity(itemId, { quantity: addQuantity[itemId] });
      if (response.success) {
        setAddQuantity({ ...addQuantity, [itemId]: '' });
        fetchInventory();
      }
    } catch (error) {
      console.error('Error adding quantity:', error);
    }
  };

  const handleRemoveQuantity = async (itemId) => {
    if (!removeQuantity[itemId] || removeQuantity[itemId] <= 0) {
      alert('Por favor ingresa una cantidad válida');
      return;
    }

    try {
      const response = await removeInventoryQuantity(itemId, { quantity: removeQuantity[itemId] });
      if (response.success) {
        setRemoveQuantity({ ...removeQuantity, [itemId]: '' });
        fetchInventory();
      }
    } catch (error) {
      console.error('Error removing quantity:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Cargando inventario...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Inventario</h1>
        <button 
          onClick={fetchInventory}
          className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
        >
          Actualizar
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock Actual
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unidad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock Mínimo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {inventory.map((item) => (
              <tr key={item._id} className={item.quantity < item.minStock ? 'bg-red-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{item.itemName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{item.quantity}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{item.unit}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{item.minStock}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <div className="flex items-center">
                      <input
                        type="number"
                        min="1"
                        placeholder="Cantidad"
                        value={addQuantity[item._id] || ''}
                        onChange={(e) => setAddQuantity({ 
                          ...addQuantity, 
                          [item._id]: parseInt(e.target.value) || '' 
                        })}
                        className="w-20 p-1 border border-gray-300 rounded-md"
                      />
                      <button
                        onClick={() => handleAddQuantity(item._id)}
                        className="ml-2 bg-green-600 text-white py-1 px-2 rounded-md hover:bg-green-700 text-xs"
                      >
                        Añadir
                      </button>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="number"
                        min="1"
                        max={item.quantity}
                        placeholder="Cantidad"
                        value={removeQuantity[item._id] || ''}
                        onChange={(e) => setRemoveQuantity({ 
                          ...removeQuantity, 
                          [item._id]: parseInt(e.target.value) || '' 
                        })}
                        className="w-20 p-1 border border-gray-300 rounded-md"
                      />
                      <button
                        onClick={() => handleRemoveQuantity(item._id)}
                        className="ml-2 bg-red-600 text-white py-1 px-2 rounded-md hover:bg-red-700 text-xs"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {inventory.length === 0 && (
        <div className="bg-white p-8 rounded-lg shadow text-center mt-6">
          <p className="text-gray-500 text-lg">No hay elementos en el inventario</p>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;