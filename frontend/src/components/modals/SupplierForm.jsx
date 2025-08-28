import React, { useState, useEffect } from 'react';

const SupplierForm = ({ supplier, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    contact: {
      email: '',
      phone: ''
    },
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    paymentTerms: 'contado',
    isActive: true
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (supplier) {
      // Si estamos editando, llenar el formulario con los datos existentes
      setFormData({
        name: supplier.name || '',
        contact: {
          email: supplier.contact?.email || '',
          phone: supplier.contact?.phone || ''
        },
        address: {
          street: supplier.address?.street || '',
          city: supplier.address?.city || '',
          state: supplier.address?.state || '',
          zipCode: supplier.address?.zipCode || ''
        },
        paymentTerms: supplier.paymentTerms || 'contado',
        isActive: supplier.isActive !== undefined ? supplier.isActive : true
      });
    }
  }, [supplier]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      // Para campos anidados como contact.email o address.street
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    
    if (formData.contact.email && !/\S+@\S+\.\S+/.test(formData.contact.email)) {
      newErrors.email = 'El email no es válido';
    }
    
    if (formData.contact.phone && !/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{9,}$/.test(formData.contact.phone)) {
      newErrors.phone = 'El teléfono no es válido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            {supplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del proveedor *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Ej: Distribuidora de Alimentos S.A."
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="contact.email"
                value={formData.contact.email}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="proveedor@ejemplo.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="text"
                name="contact.phone"
                value={formData.contact.phone}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="+1234567890"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Calle
            </label>
            <input
              type="text"
              name="address.street"
              value={formData.address.street}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Av. Principal #123"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ciudad
              </label>
              <input
                type="text"
                name="address.city"
                value={formData.address.city}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Ciudad"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <input
                type="text"
                name="address.state"
                value={formData.address.state}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Estado"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código Postal
            </label>
            <input
              type="text"
              name="address.zipCode"
              value={formData.address.zipCode}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="12345"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Términos de pago
            </label>
            <select
              name="paymentTerms"
              value={formData.paymentTerms}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="contado">Contado</option>
              <option value="15 días">15 días</option>
              <option value="30 días">30 días</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Proveedor activo
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              {supplier ? 'Actualizar' : 'Crear'} Proveedor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierForm;