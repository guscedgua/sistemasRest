import React, { useState, useEffect } from 'react';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../../services/api';
import SupplierForm from '../modals/SupplierForm';

const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getSuppliers();
      if (response.success) {
        setSuppliers(response.suppliers);
      } else {
        setError('No se pudieron cargar los proveedores. Inténtalo de nuevo.');
      }
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      setError('Error de conexión con el servidor. Por favor, revisa tu red.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSupplier = () => {
    setEditingSupplier(null);
    setShowForm(true);
  };

  const handleEditSupplier = (supplier) => {
    setEditingSupplier(supplier);
    setShowForm(true);
  };

  const handleDeleteSupplier = async (supplierId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este proveedor?')) {
      try {
        const response = await deleteSupplier(supplierId);
        if (response.success) {
          // Mejorar la eficiencia: eliminar el proveedor del estado local en lugar de re-cargar todo
          setSuppliers(suppliers.filter(supplier => supplier._id !== supplierId));
        } else {
          setError('Error al eliminar el proveedor.');
        }
      } catch (err) {
        console.error('Error deleting supplier:', err);
        setError('Error de red al eliminar el proveedor.');
      }
    }
  };

  const handleSubmitSupplier = async (supplierData) => {
    try {
      let response;
      if (editingSupplier) {
        response = await updateSupplier(editingSupplier._id, supplierData);
        if (response.success) {
          // Mejorar la eficiencia: actualizar el proveedor en el estado local
          setSuppliers(suppliers.map(sup => sup._id === editingSupplier._id ? response.supplier : sup));
        }
      } else {
        response = await createSupplier(supplierData);
        if (response.success) {
          // Mejorar la eficiencia: agregar el nuevo proveedor al estado local
          setSuppliers([...suppliers, response.supplier]);
        }
      }
      
      if (response.success) {
        setShowForm(false);
        setError(null);
      } else {
        setError('Error al guardar el proveedor. Por favor, revisa los datos.');
      }
    } catch (err) {
      console.error('Error saving supplier:', err);
      setError('Error de red al guardar el proveedor.');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Cargando proveedores...</div>;
  }
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Proveedores</h1>
        <button 
          onClick={handleCreateSupplier}
          className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
        >
          Crear Proveedor
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}

      {suppliers.length === 0 && !loading ? (
        <div className="bg-white p-8 rounded-lg shadow text-center mt-6">
          <p className="text-gray-500 text-lg">No hay proveedores registrados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map((supplier) => (
            <div key={supplier._id} className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">{supplier.name}</h3>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700">Información de contacto:</h4>
                <p className="text-sm text-gray-600">{supplier.contact?.email}</p>
                <p className="text-sm text-gray-600">{supplier.contact?.phone}</p>
              </div>
              
              {supplier.address && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700">Dirección:</h4>
                  <p className="text-sm text-gray-600">{supplier.address.street}</p>
                  <p className="text-sm text-gray-600">{supplier.address.city}, {supplier.address.state}</p>
                </div>
              )}
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700">Términos de pago:</h4>
                <p className="text-sm text-gray-600">{supplier.paymentTerms}</p>
              </div>
              
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  supplier.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {supplier.isActive ? 'Activo' : 'Inactivo'}
                </span>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditSupplier(supplier)}
                    className="text-indigo-600 hover:text-indigo-900 text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteSupplier(supplier._id)}
                    className="text-red-600 hover:text-red-900 text-sm"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <SupplierForm
          supplier={editingSupplier}
          onSubmit={handleSubmitSupplier}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default SupplierManagement;