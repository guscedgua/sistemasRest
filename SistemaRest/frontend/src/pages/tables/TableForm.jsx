// frontend/src/components/tables/TableForm.jsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Button from '../../components/ui/Button'; 
import { TABLE_STATUS } from '../../utils/constants'; 
import { getTableStatusName } from '../../utils/helpers'; // Asegúrate de importar esto si lo usas

const TableForm = ({ table, onSubmit, onClose, isSubmitting }) => {
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    defaultValues: table || { 
      tableNumber: '', // <-- CAMBIO AQUÍ: Usar tableNumber
      capacity: '',
      status: TABLE_STATUS.AVAILABLE,
    },
  });

  useEffect(() => {
    if (table) {
      setValue('tableNumber', table.tableNumber || ''); // <-- CAMBIO AQUÍ: Usar tableNumber
      setValue('capacity', table.capacity || '');
      setValue('status', table.status || TABLE_STATUS.AVAILABLE);
      // Si tienes 'location' en tu modelo y quieres editarlo:
      // setValue('location', table.location || ''); 
    } else {
      reset({
        tableNumber: '', // <-- CAMBIO AQUÍ: Usar tableNumber
        capacity: '',
        status: TABLE_STATUS.AVAILABLE,
        // location: '', // Si tienes location
      });
    }
  }, [table, reset, setValue]);

  const handleFormSubmit = (data) => {
    const parsedData = {
      ...data,
      tableNumber: parseInt(data.tableNumber, 10), // <-- CAMBIO AQUÍ: Parsear tableNumber
      capacity: parseInt(data.capacity, 10),
    };
    onSubmit(parsedData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 p-5">
      <div>
        <label htmlFor="tableNumber" className="block text-sm font-medium text-gray-700">Número de Mesa</label>
        <input
          type="number"
          id="tableNumber" // <-- CAMBIO AQUÍ: Usar tableNumber
          {...register('tableNumber', { // <-- CAMBIO AQUÍ: Usar tableNumber
            required: 'El número de mesa es requerido',
            min: { value: 1, message: 'El número de mesa debe ser al menos 1' },
            valueAsNumber: true,
          })}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          disabled={isSubmitting}
        />
        {errors.tableNumber && <p className="text-red-500 text-xs mt-1">{errors.tableNumber.message}</p>} {/* <-- CAMBIO AQUÍ */}
      </div>

      <div>
        <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">Capacidad</label>
        <input
          type="number"
          id="capacity"
          {...register('capacity', {
            required: 'La capacidad es requerida',
            min: { value: 1, message: 'La capacidad debe ser al menos 1' },
            valueAsNumber: true,
          })}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          disabled={isSubmitting}
        />
        {errors.capacity && <p className="text-red-500 text-xs mt-1">{errors.capacity.message}</p>}
      </div>

      {/* Si tienes un campo 'location' en tu modelo y quieres que se pueda editar: */}
      {/* <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">Ubicación (Opcional)</label>
        <input
          type="text"
          id="location"
          {...register('location')}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          disabled={isSubmitting}
        />
      </div> */}

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Estado Inicial</label>
        <select
          id="status"
          {...register('status', { required: 'El estado es requerido' })}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          disabled={isSubmitting}
        >
          {Object.values(TABLE_STATUS).map(status => (
            <option key={status} value={status}>
              {getTableStatusName(status)}
            </option>
          ))}
        </select>
        {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status.message}</p>}
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <Button 
          type="button" 
          variant="secondary" 
          onClick={onClose} 
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          variant="primary" 
          isLoading={isSubmitting} 
          loadingText={table ? 'Guardando...' : 'Creando...'}
        >
          {table ? 'Guardar Cambios' : 'Crear Mesa'}
        </Button>
      </div>
    </form>
  );
};

export default TableForm;