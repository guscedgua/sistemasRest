// frontend/src/pages/tables/TablesList.jsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios'; // Asumo que este es tu axios client configurado
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import TableStatusCard from '../../components/tables/TableStatus';
import TableForm from '../../pages/tables/TableForm';
import { TABLE_STATUS } from '../../utils/constants';
import { getTableStatusName } from '../../utils/helpers';
import { showToast } from '../../components/ui/Toast';
import { getTables, createTable, updateTable, deleteTable } from '../../api/tables';

// ASUMIMOS que tienes un AuthContext que proporciona el estado de autenticación
// Si no lo tienes, deberás crear uno o adaptar esta lógica a cómo manejas el estado global de tu usuario.
import { useAuth } from '../../context/AuthContext'; // <--- IMPORTANTE: Asegúrate de que esta ruta sea correcta

const TablesList = () => {
  // --- CAMBIO CLAVE AQUÍ: Usar 'isLoggedIn' en lugar de 'isAuthenticated' ---
  const { isLoggedIn, user, isLoading: authLoading } = useAuth(); // Obtén el estado de autenticación
  // --- FIN CAMBIO CLAVE ---
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showTableFormModal, setShowTableFormModal] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [tableToDelete, setTableToDelete] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Función para obtener las mesas
  const fetchTables = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getTables();
      // --- CAMBIO CLAVE AQUÍ: Asegurar que 'response.tables' sea un array ---
      setTables(Array.isArray(response.tables) ? response.tables : []);
      // --- FIN CAMBIO CLAVE ---
      console.log("Mesas cargadas:", response.tables);
    } catch (err) {
      let errorMessage = 'Error al cargar las mesas';
      if (err.response) {
        if (err.response.status === 401 || err.response.status === 403) {
          errorMessage = 'No tienes permiso o tu sesión ha expirado. Por favor, inicia sesión.';
          // El interceptor de Axios ya debería redirigir si el refresh falla.
          // Aquí solo mostramos el mensaje.
        } else {
          errorMessage = err.response.data?.message || `Error del servidor: ${err.response.status}`;
        }
      } else if (err.request) {
        errorMessage = 'No se pudo conectar al servidor. Verifica tu conexión.';
      } else {
        errorMessage = `Error inesperado: ${err.message}`;
      }
      setError(errorMessage);
      if (retryCount < 2) { // Limita los reintentos para evitar bucles infinitos
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 3000);
      }
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Solo intenta cargar las mesas si la autenticación ha terminado y el usuario está autenticado
    // --- CAMBIO CLAVE AQUÍ: Usar 'isLoggedIn' en lugar de 'isAuthenticated' ---
    if (!authLoading && isLoggedIn) { 
      fetchTables();
    }
    // --- FIN CAMBIO CLAVE ---
    // Si authLoading es false y no está autenticado, no hacemos nada aquí,
    // el usuario debería ser redirigido por el sistema de autenticación.
  }, [isLoggedIn, authLoading, retryCount]); // Dependencias: isLoggedIn, authLoading y retryCount

  // ----- Lógica para el modal de CAMBIO DE ESTADO (existente) -----
  const handleTableClick = (table) => {
    setSelectedTable(table);
    setNewStatus(table.status);
    setShowStatusModal(true);
  };

  const handleStatusChange = async () => {
    if (!selectedTable || !newStatus) return;
    
    setIsUpdating(true);
    try {
      await updateTable(selectedTable._id, { status: newStatus });
      
      setTables(prevTables => 
        prevTables.map(table => 
          table._id === selectedTable._id ? { ...table, status: newStatus } : table
        )
      );
      
      setShowStatusModal(false);
      showToast(`Estado de mesa #${selectedTable.number} actualizado a: ${getTableStatusName(newStatus)}`, 'success');
    } catch (err) {
      console.error('Error updating table status:', err);
      let errorMessage = 'Error al actualizar el estado de la mesa';
      if (err.response?.status === 401 || err.response?.status === 403) {
        errorMessage = 'No tienes permiso o tu sesión ha expirado.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      showToast(errorMessage, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  // ----- Lógica para el modal de CREAR/EDITAR MESA -----
  const handleOpenNewTableModal = () => {
    setEditingTable(null);
    setShowTableFormModal(true);
  };

  const handleEditTable = (table) => {
    setEditingTable(table);
    setShowTableFormModal(true);
  };

  const handleTableFormSubmit = async (tableData) => {
    setIsSubmittingForm(true);
    try {
      if (editingTable) {
        await updateTable(editingTable._id, tableData);
        showToast('Mesa actualizada exitosamente!', 'success');
      } else {
        await createTable(tableData);
        showToast('Mesa creada exitosamente!', 'success');
      }
      setShowTableFormModal(false);
      fetchTables();
    } catch (err) {
      console.error('Error al guardar la mesa:', err);
      let errorMessage = 'Error al guardar la mesa';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        errorMessage = 'No tienes permiso para realizar esta acción.';
      }
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmittingForm(false);
    }
  };

  // Lógica para el modal de eliminación
  const handleDeleteTableClick = (tableId) => {
    setTableToDelete(tableId);
  };

  const handleConfirmDelete = async () => {
    setIsSubmittingForm(true);
    try {
      await deleteTable(tableToDelete);
      showToast('Mesa eliminada exitosamente!', 'success');
      setTableToDelete(null);
      fetchTables();
    } catch (err) {
      console.error('Error al eliminar la mesa:', err);
      let errorMessage = 'Error al eliminar la mesa';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        errorMessage = 'No tienes permiso para eliminar mesas.';
      }
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmittingForm(false);
    }
  };

  // Renderizar diferentes estados
  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600">Verificando autenticación...</p>
      </div>
    );
  }

  // Si no está autenticado y authLoading es false, el interceptor de Axios ya debería haber redirigido
  // o el usuario necesita iniciar sesión manualmente.
  // --- CAMBIO CLAVE AQUÍ: Usar 'isLoggedIn' en lugar de 'isAuthenticated' ---
  if (!isLoggedIn) { 
  // --- FIN CAMBIO CLAVE ---
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-red-600">
        <p className="text-xl font-semibold">Acceso denegado. Por favor, inicie sesión.</p>
        {/* Aquí podrías añadir un botón para redirigir al login si no se redirige automáticamente */}
        <Button variant="primary" onClick={() => window.location.href = '/login'} className="mt-4">
          Ir a Iniciar Sesión
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600">Cargando mesas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-800 mb-2">Error al cargar mesas</h2>
          <p className="text-red-700 mb-4">{error}</p>
          
          {retryCount < 2 ? (
            <div className="flex items-center">
              <Spinner size="sm" />
              <span className="ml-2 text-gray-600">Reintentando en 3 segundos...</span>
            </div>
          ) : (
            <Button variant="primary" onClick={() => {
              setRetryCount(0);
              fetchTables();
            }}>
              Reintentar
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Mesas</h1>
          <p className="text-gray-600 mt-1">
            {tables.length} {tables.length === 1 ? 'mesa registrada' : 'mesas registradas'}
          </p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="primary"
            onClick={handleOpenNewTableModal}
            icon="plus"
          >
            Nueva Mesa
          </Button>
          <Button 
            variant="secondary"
            onClick={fetchTables}
            icon="refresh"
          >
            Actualizar lista
          </Button>
        </div>
      </div>
      
      {tables.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {tables.map(table => (
            <div 
              key={table._id} 
              className="cursor-pointer transition-transform duration-200 hover:scale-[1.02]"
              onClick={() => handleTableClick(table)} 
              data-testid={`table-${table.number}`}
            >
              <TableStatusCard table={table} />
              <div className="mt-2 flex justify-end space-x-2">
                <Button 
                  variant="info" 
                  size="sm" 
                  onClick={(e) => { e.stopPropagation(); handleEditTable(table); }}
                >
                  Editar
                </Button>
                <Button 
                  variant="danger" 
                  size="sm" 
                  onClick={(e) => { e.stopPropagation(); handleDeleteTableClick(table._id); }}
                >
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
          <div className="mx-auto bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No hay mesas registradas</h3>
          <p className="text-gray-500 mb-4">
            Parece que no hay mesas disponibles en este momento.
          </p>
          <Button variant="primary" onClick={handleOpenNewTableModal}>
            Crear Primera Mesa
          </Button>
        </div>
      )}
      
      {/* Modal para cambiar estado de la mesa */}
      <Modal 
        isOpen={showStatusModal}
        onClose={() => !isUpdating && setShowStatusModal(false)}
        title={`Mesa #${selectedTable?.number}`}
        size="md"
      >
        <div className="p-5">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado actual
            </label>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              selectedTable?.status === TABLE_STATUS.AVAILABLE 
                ? 'bg-green-100 text-green-800' 
                : selectedTable?.status === TABLE_STATUS.OCCUPIED 
                  ? 'bg-yellow-100 text-yellow-800'
                  : selectedTable?.status === TABLE_STATUS.RESERVED 
                    ? 'bg-blue-100 text-blue-800'
                    : selectedTable?.status === TABLE_STATUS.CLEANING 
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-red-100 text-red-800'
            }`}>
              <span className="w-2 h-2 rounded-full mr-2 bg-current"></span>
              {getTableStatusName(selectedTable?.status)}
            </div>
          </div>
          
          <div className="mb-7">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cambiar a
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              disabled={isUpdating}
            >
              {Object.values(TABLE_STATUS).map(status => (
                <option key={status} value={status}>
                  {getTableStatusName(status)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button 
              variant="secondary"
              onClick={() => setShowStatusModal(false)}
              disabled={isUpdating}
            >
              Cancelar
            </Button>
            <Button 
              variant="primary"
              onClick={handleStatusChange}
              disabled={newStatus === selectedTable?.status || isUpdating}
              isLoading={isUpdating}
              loadingText="Actualizando..."
            >
              Confirmar cambio
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal para CREAR o EDITAR Mesa (usando TableForm) */}
      <Modal
        isOpen={showTableFormModal}
        onClose={() => !isSubmittingForm && setShowTableFormModal(false)}
        title={editingTable ? 'Editar Mesa' : 'Crear Nueva Mesa'}
      >
        <TableForm
          table={editingTable}
          onSubmit={handleTableFormSubmit}
          onClose={() => setShowTableFormModal(false)}
          isSubmitting={isSubmittingForm}
        />
      </Modal>

      {/* Modal de Confirmación de Eliminación */}
      <Modal
        isOpen={!!tableToDelete}
        onClose={() => !isSubmittingForm && setTableToDelete(null)}
        title="Confirmar Eliminación de Mesa"
      >
        <p className="text-gray-700 mb-4">¿Estás seguro de que deseas eliminar la mesa #{tables.find(t => t._id === tableToDelete)?.number || ''}?</p>
        <div className="flex justify-end space-x-3">
          <Button
            variant="secondary"
            onClick={() => setTableToDelete(null)}
            disabled={isSubmittingForm}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirmDelete}
            isLoading={isSubmittingForm}
            loadingText="Eliminando..."
          >
            Eliminar
          </Button>
        </div>
      </Modal>

    </div>
  );
};

export default TablesList;
