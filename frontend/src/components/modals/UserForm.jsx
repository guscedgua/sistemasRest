import React, { useState, useEffect } from 'react';
import { getInventoryItems } from '../../services/api';

const RecipeForm = ({ recipe, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    dishName: '',
    description: '',
    category: '',
    ingredients: [],
    costPerServing: 0,
    instructions: '',
    isAvailable: true
  });
  
  const [inventoryItems, setInventoryItems] = useState([]);
  const [newIngredient, setNewIngredient] = useState({
    item: '',
    quantityNeeded: 1,
    unit: 'unidades'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInventoryItems();
    
    if (recipe) {
      // Si estamos editando, llenar el formulario con los datos existentes
      setFormData({
        dishName: recipe.dishName || '',
        description: recipe.description || '',
        category: recipe.category || '',
        ingredients: recipe.ingredients || [],
        costPerServing: recipe.costPerServing || 0,
        instructions: recipe.instructions || '',
        isAvailable: recipe.isAvailable !== undefined ? recipe.isAvailable : true
      });
    }
  }, [recipe]);

  const fetchInventoryItems = async () => {
    try {
      setLoading(true);
      const response = await getInventoryItems();
      if (response.success) {
        setInventoryItems(response.items);
      }
    } catch (error) {
      console.error('Error fetching inventory items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleIngredientChange = (e) => {
    const { name, value } = e.target;
    
    setNewIngredient(prev => ({
      ...prev,
      [name]: name === 'quantityNeeded' ? parseFloat(value) || 0 : value
    }));
  };

  const addIngredient = () => {
    if (!newIngredient.item) {
      alert('Por favor selecciona un ingrediente');
      return;
    }
    
    if (newIngredient.quantityNeeded <= 0) {
      alert('La cantidad debe ser mayor a 0');
      return;
    }
    
    // Verificar si el ingrediente ya existe en la receta
    const existingIndex = formData.ingredients.findIndex(
      ing => ing.item === newIngredient.item
    );
    
    if (existingIndex >= 0) {
      // Actualizar cantidad si ya existe
      const updatedIngredients = [...formData.ingredients];
      updatedIngredients[existingIndex].quantityNeeded += newIngredient.quantityNeeded;
      
      setFormData(prev => ({
        ...prev,
        ingredients: updatedIngredients
      }));
    } else {
      // Añadir nuevo ingrediente
      const selectedItem = inventoryItems.find(item => item._id === newIngredient.item);
      
      setFormData(prev => ({
        ...prev,
        ingredients: [
          ...prev.ingredients,
          {
            item: newIngredient.item,
            quantityNeeded: newIngredient.quantityNeeded,
            unit: selectedItem?.unit || newIngredient.unit
          }
        ]
      }));
    }
    
    // Resetear el formulario de ingrediente
    setNewIngredient({
      item: '',
      quantityNeeded: 1,
      unit: 'unidades'
    });
  };

  const removeIngredient = (index) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.dishName.trim()) {
      newErrors.dishName = 'El nombre del plato es requerido';
    }
    
    if (!formData.category) {
      newErrors.category = 'La categoría es requerida';
    }
    
    if (formData.ingredients.length === 0) {
      newErrors.ingredients = 'Debe agregar al menos un ingrediente';
    }
    
    if (formData.costPerServing < 0) {
      newErrors.costPerServing = 'El costo no puede ser negativo';
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

  const calculateCost = () => {
    // Esta es una implementación básica. En una app real, 
    // calcularías el costo basado en los precios de los ingredientes
    return formData.ingredients.reduce((total, ingredient) => {
      return total + (ingredient.quantityNeeded * 5); // Asumiendo $5 por unidad
    }, 0);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-auto p-6 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            {recipe ? 'Editar Receta' : 'Nueva Receta'}
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
                Nombre del plato *
              </label>
              <input
                type="text"
                name="dishName"
                value={formData.dishName}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${errors.dishName ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Ej: Spaghetti Bolognesa"
              />
              {errors.dishName && <p className="text-red-500 text-xs mt-1">{errors.dishName}</p>}
            </div>

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
                <option value="entrada">Entrada</option>
                <option value="principal">Plato Principal</option>
                <option value="postre">Postre</option>
                <option value="bebida">Bebida</option>
                <option value="guarnición">Guarnición</option>
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="2"
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Describe brevemente el plato..."
            />
          </div>

          <div className="border-t pt-4">
            <h4 className="text-lg font-medium text-gray-900 mb-3">Ingredientes *</h4>
            
            {errors.ingredients && <p className="text-red-500 text-xs mb-2">{errors.ingredients}</p>}
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 mb-3">
              <div className="md:col-span-5">
                <select
                  name="item"
                  value={newIngredient.item}
                  onChange={handleIngredientChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  disabled={loading}
                >
                  <option value="">Seleccionar ingrediente</option>
                  {inventoryItems.map(item => (
                    <option key={item._id} value={item._id}>
                      {item.itemName} ({item.unit})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="md:col-span-3">
                <input
                  type="number"
                  name="quantityNeeded"
                  value={newIngredient.quantityNeeded}
                  onChange={handleIngredientChange}
                  min="0.1"
                  step="0.1"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Cantidad"
                />
              </div>
              
              <div className="md:col-span-2">
                <select
                  name="unit"
                  value={newIngredient.unit}
                  onChange={handleIngredientChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="unidades">Unidades</option>
                  <option value="kg">Kg</option>
                  <option value="g">g</option>
                  <option value="l">l</option>
                  <option value="ml">ml</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={addIngredient}
                  className="w-full bg-indigo-600 text-white py-2 px-3 rounded-md hover:bg-indigo-700"
                >
                  Agregar
                </button>
              </div>
            </div>
            
            {formData.ingredients.length > 0 ? (
              <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto">
                <ul className="space-y-2">
                  {formData.ingredients.map((ingredient, index) => {
                    const item = inventoryItems.find(i => i._id === ingredient.item);
                    return (
                      <li key={index} className="flex justify-between items-center">
                        <span>
                          {ingredient.quantityNeeded} {ingredient.unit} de {item ? item.itemName : 'Ingrediente'}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeIngredient(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : (
              <p className="text-gray-500 text-sm italic">No hay ingredientes agregados</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Costo por porción
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  name="costPerServing"
                  value={formData.costPerServing}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className={`flex-1 p-2 border rounded-r-md ${errors.costPerServing ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="0.00"
                />
              </div>
              {errors.costPerServing && <p className="text-red-500 text-xs mt-1">{errors.costPerServing}</p>}
              <p className="text-xs text-gray-500 mt-1">
                Costo estimado: ${calculateCost().toFixed(2)}
              </p>
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
                Receta disponible
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instrucciones de preparación
            </label>
            <textarea
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              rows="4"
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Describe los pasos para preparar este plato..."
            />
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
              {recipe ? 'Actualizar' : 'Crear'} Receta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecipeForm;