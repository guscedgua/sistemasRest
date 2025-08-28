import React, { useState, useEffect } from 'react';
import { getRecipes } from '../../services/api';

const ProductForm = ({ product, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    imageUrl: '',
    recipe: '',
    stock: 0,
    stockType: 'none',
    isAvailable: true
  });

  const [recipes, setRecipes] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Categorías predefinidas para los productos
  const categories = [
    'entrada',
    'principal',
    'postre',
    'bebida',
    'ensalada',
    'sopa',
    'aperitivo',
    'especial'
  ];

  // Tipos de stock disponibles
  const stockTypes = [
    { value: 'none', label: 'No usar stock' },
    { value: 'direct', label: 'Stock directo' },
    { value: 'recipe', label: 'Control por receta' }
  ];

  useEffect(() => {
    fetchRecipes();
    
    if (product) {
      // Si estamos editando, llenar el formulario con los datos existentes
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || 0,
        category: product.category || '',
        imageUrl: product.imageUrl || '',
        recipe: product.recipe || '',
        stock: product.stock || 0,
        stockType: product.stockType || 'none',
        isAvailable: product.isAvailable !== undefined ? product.isAvailable : true
      });
    }
  }, [product]);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const response = await getRecipes();
      if (response.success) {
        setRecipes(response.recipes);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              (type === 'number' ? parseFloat(value) || 0 : value)
    }));
    
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
    
    if (formData.price <= 0) {
      newErrors.price = 'El precio debe ser mayor a 0';
    }
    
    if (!formData.category) {
      newErrors.category = 'La categoría es requerida';
    }
    
    if (formData.stockType === 'direct' && formData.stock < 0) {
      newErrors.stock = 'El stock no puede ser negativo';
    }
    
    if (formData.stockType === 'recipe' && !formData.recipe) {
      newErrors.recipe = 'Debe seleccionar una receta para control de stock';
    }
    
    // Validar URL de imagen si se proporciona
    if (formData.imageUrl && !isValidUrl(formData.imageUrl)) {
      newErrors.imageUrl = 'La URL de la imagen no es válida';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Preparar datos para enviar
      const submitData = { ...formData };
      
      // Si no se usa receta, asegurarse de que el campo esté vacío
      if (formData.stockType !== 'recipe') {
        submitData.recipe = '';
      }
      
      // Si no se usa stock directo, resetear el valor de stock
      if (formData.stockType !== 'direct') {
        submitData.stock = 0;
      }
      
      onSubmit(submitData);
    }
  };

  const handleImageUpload = (e) => {
    // En una implementación real, aquí subirías la imagen a un servicio
    // como Cloudinary o Firebase Storage y obtendrías la URL
    // Por ahora, solo simulamos una URL después de un delay
    const file = e.target.files[0];
    if (file) {
      // Simular carga de imagen
      setLoading(true);
      setTimeout(() => {
        // En una app real, aquí obtendrías la URL real del servicio de almacenamiento
        const fakeImageUrl = URL.createObjectURL(file);
        setFormData(prev => ({ ...prev, imageUrl: fakeImageUrl }));
        setLoading(false);
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-auto p-6 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            {product ? 'Editar Producto' : 'Nuevo Producto'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del producto *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Ej: Pizza Margarita"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio *
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className={`flex-1 p-2 border rounded-r-md ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="0.00"
                />
              </div>
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Seleccionar categoría</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de control de stock
              </label>
              <select
                name="stockType"
                value={formData.stockType}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                {stockTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {formData.stockType === 'direct' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock disponible
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                className={`w-full p-2 border rounded-md ${errors.stock ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
            </div>
          )}

          {formData.stockType === 'recipe' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Receta asociada *
              </label>
              <select
                name="recipe"
                value={formData.recipe}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${errors.recipe ? 'border-red-500' : 'border-gray-300'}`}
                disabled={loading}
              >
                <option value="">Seleccionar receta</option>
                {recipes.map(recipe => (
                  <option key={recipe._id} value={recipe._id}>
                    {recipe.dishName}
                  </option>
                ))}
              </select>
              {errors.recipe && <p className="text-red-500 text-xs mt-1">{errors.recipe}</p>}
              {recipes.length === 0 && !loading && (
                <p className="text-xs text-gray-500 mt-1">
                  No hay recetas disponibles. Crea una receta primero.
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Describe el producto..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Imagen del producto
            </label>
            
            {formData.imageUrl ? (
              <div className="mb-2">
                <img 
                  src={formData.imageUrl} 
                  alt="Vista previa" 
                  className="h-32 w-32 object-cover rounded-md border"
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                  className="mt-2 text-red-600 text-sm hover:text-red-800"
                >
                  Eliminar imagen
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                    </svg>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Haz clic para subir</span> o arrastra y suelta
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX. 5MB)</p>
                  </div>
                  <input 
                    id="dropzone-file" 
                    type="file" 
                    className="hidden" 
                    onChange={handleImageUpload}
                    accept="image/*"
                  />
                </label>
              </div>
            )}
            
            {loading && (
              <div className="mt-2 text-sm text-gray-500">
                Subiendo imagen...
              </div>
            )}
            
            {errors.imageUrl && <p className="text-red-500 text-xs mt-1">{errors.imageUrl}</p>}
            
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                O ingresa la URL de una imagen
              </label>
              <input
                type="text"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isAvailable"
              checked={formData.isAvailable}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Producto disponible
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
              {product ? 'Actualizar' : 'Crear'} Producto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;