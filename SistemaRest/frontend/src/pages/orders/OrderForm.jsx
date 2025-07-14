// frontend/src/components/orders/OrderForm.jsx
import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form'; // Necesitarás useFieldArray
import Button from '../ui/Button'; // Asegúrate de que la ruta sea correcta

const OrderForm = ({ order, onSubmit, onClose, tables, products }) => {
  // Asegúrate de que tables y products sean arrays por defecto para evitar errores si son undefined
  const availableTables = tables || [];
  const availableProducts = products || [];

  const { register, handleSubmit, control, formState: { errors }, reset, setValue, watch } = useForm({
    defaultValues: order || {
      customerName: '',
      table: '', // Para la mesa seleccionada
      orderType: 'dine-in', // Por defecto, se puede cambiar
      items: [],
      status: 'pending',
      totalAmount: 0,
      notes: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchItems = watch("items");
  const calculateTotalAmount = (items) => {
    return items.reduce((sum, item) => {
      const product = availableProducts.find(p => p._id === item.productId);
      const price = product ? product.price : 0;
      return sum + (price * (item.quantity || 0));
    }, 0);
  };

  useEffect(() => {
    // Si el 'order' cambia (por ejemplo, al abrir el modal para editar otro pedido)
    if (order) {
      setValue('customerName', order.customerName || '');
      setValue('table', order.table?._id || ''); // Asegúrate de manejar el ID de la mesa
      setValue('orderType', order.orderType || 'dine-in');
      setValue('status', order.status || 'pending');
      setValue('notes', order.notes || '');

      // Aquí poblamos los ítems para edición. Asume que 'order.items' tiene productId y quantity
      if (order.items && Array.isArray(order.items)) {
        // Limpiamos los campos existentes antes de añadir los nuevos para evitar duplicados
        remove(Array.from({ length: fields.length }, (_, i) => i));
        order.items.forEach(item => {
          append({ productId: item.product?._id || item.productId, quantity: item.quantity, notes: item.notes || '' });
        });
      }
      // El totalAmount se recalculará en el submit o puedes forzarlo aquí si es solo visual
      setValue('totalAmount', order.totalAmount || 0);

    } else {
      // Resetea el formulario si no hay un pedido para editar (modo creación)
      reset({
        customerName: '',
        table: '',
        orderType: 'dine-in',
        items: [],
        status: 'pending',
        totalAmount: 0,
        notes: '',
      });
    }
  }, [order, reset, setValue, remove, append]);

  // Recalcular totalAmount cada vez que los items cambien
  useEffect(() => {
    const newTotal = calculateTotalAmount(watchItems);
    setValue('totalAmount', newTotal);
  }, [watchItems, setValue, availableProducts]);


  const handleFormSubmit = (data) => {
    // Asegurarse de que los ítems tengan el formato correcto
    const itemsToSend = data.items.map(item => ({
      productId: item.productId,
      quantity: parseInt(item.quantity, 10),
      notes: item.notes || '',
    }));

    // El totalAmount ya se está actualizando en el useEffect, lo enviamos tal cual
    const finalData = {
      ...data,
      items: itemsToSend,
      totalAmount: data.totalAmount,
      table: data.table || undefined, // Envía undefined si no hay mesa seleccionada
    };

    onSubmit(finalData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">Nombre del Cliente</label>
        <input
          type="text"
          id="customerName"
          {...register('customerName', { required: 'El nombre del cliente es requerido' })}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        {errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName.message}</p>}
      </div>

      <div>
        <label htmlFor="table" className="block text-sm font-medium text-gray-700">Mesa</label>
        <select
          id="table"
          {...register('table')} // No es requerido, puede ser para pedidos a domicilio
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">Seleccionar Mesa</option>
          {availableTables.map(table => (
            <option key={table._id} value={table._id}>
              Mesa {table.number} ({table.capacity} personas)
            </option>
          ))}
        </select>
        {errors.table && <p className="text-red-500 text-xs mt-1">{errors.table.message}</p>}
      </div>

      <div>
        <label htmlFor="orderType" className="block text-sm font-medium text-gray-700">Tipo de Pedido</label>
        <select
          id="orderType"
          {...register('orderType', { required: 'El tipo de pedido es requerido' })}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="dine-in">En Mesa</option>
          <option value="take-out">Para Llevar</option>
          <option value="delivery">A Domicilio</option>
        </select>
        {errors.orderType && <p className="text-red-500 text-xs mt-1">{errors.orderType.message}</p>}
      </div>

      {/* SECCIÓN DE PRODUCTOS */}
      <div className="border p-4 rounded-md bg-gray-50">
        <h4 className="text-md font-semibold mb-2">Productos del Pedido</h4>
        {fields.map((field, index) => (
          <div key={field.id} className="flex space-x-2 mb-2 items-center">
            <select
              {...register(`items.${index}.productId`, { required: 'Producto requerido' })}
              className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">Seleccionar Producto</option>
              {availableProducts.map(product => (
                <option key={product._id} value={product._id}>
                  {product.name} (${product.price.toFixed(2)})
                </option>
              ))}
            </select>
            <input
              type="number"
              {...register(`items.${index}.quantity`, {
                required: 'Cantidad requerida',
                min: { value: 1, message: 'La cantidad debe ser al menos 1' },
                valueAsNumber: true,
              })}
              placeholder="Cantidad"
              className="w-20 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <input
              type="text"
              {...register(`items.${index}.notes`)}
              placeholder="Notas (ej. sin cebolla)"
              className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <Button type="button" variant="danger" size="sm" onClick={() => remove(index)}>
              X
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          onClick={() => append({ productId: '', quantity: 1, notes: '' })}
          className="mt-2"
        >
          Añadir Producto
        </Button>
        {errors.items && <p className="text-red-500 text-xs mt-1">Asegúrate de que todos los ítems estén completos.</p>}
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Estado</label>
        <select
          id="status"
          {...register('status', { required: 'El estado es requerido' })}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="pending">Pendiente</option>
          <option value="in-preparation">En Preparación</option>
          <option value="ready">Listo</option>
          <option value="delivered">Entregado</option>
          <option value="cancelled">Cancelado</option>
        </select>
        {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status.message}</p>}
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mt-2">Notas del Pedido</label>
        <textarea
          id="notes"
          {...register('notes')}
          rows="3"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        ></textarea>
      </div>

      <div>
        <label htmlFor="totalAmount" className="block text-sm font-medium text-gray-700">Monto Total</label>
        <input
          type="number"
          step="0.01"
          id="totalAmount"
          {...register('totalAmount', { valueAsNumber: true, min: 0 })}
          readOnly // Generalmente, esto se calculará, no se editará manualmente
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100"
        />
        {errors.totalAmount && <p className="text-red-500 text-xs mt-1">{errors.totalAmount.message}</p>}
      </div>


      <div className="flex justify-end space-x-3 mt-6">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          {order ? 'Guardar Cambios' : 'Crear Pedido'}
        </Button>
      </div>
    </form>
  );
};

export default OrderForm;