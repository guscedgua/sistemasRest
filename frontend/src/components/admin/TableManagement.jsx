import React, { useState, useEffect } from 'react';
import { getTables, createTable, updateTable, deleteTable } from '../../services/api';
import TableForm from '../modals/TableForm';

const TableManagement = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTable, setEditingTable] = useState(null);

  useEffect(() => {
    fetchTables();
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

  const handleCreateTable = () => {
    setEditingTable(null);
    setShowForm(true);
  };

  const handleEditTable = (table) => {
    setEditingTable(table);
    setShowForm(true);
  };

  const handleDeleteTable = async (tableId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta mesa?')) {
      try {
        const response = await deleteTable(tableId);
        if (response.success) {
          fetchTables();
        }
      } catch (error) {
        console.error('Error deleting table:', error);
      }
    }
  };

  const handleSubmitTable = async (tableData) => {
    try {
      let response;
      if (editingTable) {
        response = await updateTable(editingTable._id, tableData);
      } else {
        response = await createTable(tableData);
      }
      
      if (response.success) {
        setShowForm(false);
        fetchTables();
      }
    } catch (error) {
      console.error('Error saving table:', error);
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
          onClick={handleCreateTable}
          className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
        >
          Crear Mesa
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Número de Mesa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Capacidad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tables.map((table) => (
              <tr key={table._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{table.tableNumber}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{table.capacity}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    table.status === 'Disponible' ? 'bg-green-100 text-green-800' :
                    table.status === 'Ocupada' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {table.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEditTable(table)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteTable(table._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {tables.length === 0 && (
        <div className="bg-white p-8 rounded-lg shadow text-center mt-6">
          <p className="text-gray-500 text-lg">No hay mesas registradas</p>
        </div>
      )}

      {showForm && (
        <TableForm
          table={editingTable}
          onSubmit={handleSubmitTable}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default TableManagement;