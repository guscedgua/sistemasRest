import React, { useState, useEffect } from 'react';
import { getTables, updateTableStatus } from '../../services/api';

const Tables = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTables();
    
    // Poll for table updates every 30 seconds
    const interval = setInterval(fetchTables, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const response = await getTables();
      if (response.success) {
        setTables(response.tables);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTableStatus = async (tableId, newStatus) => {
    try {
      const response = await updateTableStatus(tableId, { status: newStatus });
      if (response.success) {
        fetchTables(); // Refresh tables
      }
    } catch (error) {
      console.error('Error updating table status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'occupied':
        return 'bg-red-100 text-red-800';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800';
      case 'cleaning':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available':
        return 'Disponible';
      case 'occupied':
        return 'Ocupada';
      case 'reserved':
        return 'Reservada';
      case 'cleaning':
        return 'Limpieza';
      default:
        return status;
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Cargando mesas...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Mesas</h1>
        <button 
          onClick={fetchTables}
          className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
        >
          Actualizar
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {tables.map(table => (
          <div key={table._id} className="bg-white p-6 rounded-lg shadow text-center">
            <h2 className="text-xl font-semibold mb-2">Mesa {table.tableNumber}</h2>
            <p className="text-sm text-gray-500 mb-4">Capacidad: {table.capacity} personas</p>
            
            <div className="mb-4">
              <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(table.status)}`}>
                {getStatusText(table.status)}
              </span>
            </div>
            
            {table.location && (
              <p className="text-sm text-gray-600 mb-4">{table.location}</p>
            )}
            
            {table.currentOrderId && (
              <p className="text-sm text-gray-600 mb-4">Orden: #{table.currentOrderId.orderNumber}</p>
            )}
            
            <div className="flex justify-center space-x-2">
              {table.status === 'available' && (
                <button
                  onClick={() => handleUpdateTableStatus(table._id, 'occupied')}
                  className="bg-red-600 text-white py-1 px-3 rounded-md hover:bg-red-700 text-sm"
                >
                  Ocupar
                </button>
              )}
              
              {table.status === 'occupied' && (
                <button
                  onClick={() => handleUpdateTableStatus(table._id, 'cleaning')}
                  className="bg-blue-600 text-white py-1 px-3 rounded-md hover:bg-blue-700 text-sm"
                >
                  Liberar
                </button>
              )}
              
              {table.status === 'cleaning' && (
                <button
                  onClick={() => handleUpdateTableStatus(table._id, 'available')}
                  className="bg-green-600 text-white py-1 px-3 rounded-md hover:bg-green-700 text-sm"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {tables.length === 0 && (
        <div className="bg-white p-8 rounded-lg shadow text-center mt-6">
          <p className="text-gray-500 text-lg">No hay mesas registradas</p>
        </div>
      )}
    </div>
  );
};

export default Tables;