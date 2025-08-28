import React, { useState, useEffect } from 'react';
import { getRecipes, createRecipe, updateRecipe, deleteRecipe } from '../../services/api';
import RecipeForm from '../modals/RecipeForm.jsx';

const RecipeManagement = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);

  useEffect(() => {
    fetchRecipes();
  }, []);

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

  const handleCreateRecipe = () => {
    setEditingRecipe(null);
    setShowForm(true);
  };

  const handleEditRecipe = (recipe) => {
    setEditingRecipe(recipe);
    setShowForm(true);
  };

  const handleDeleteRecipe = async (recipeId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta receta?')) {
      try {
        const response = await deleteRecipe(recipeId);
        if (response.success) {
          fetchRecipes();
        }
      } catch (error) {
        console.error('Error deleting recipe:', error);
      }
    }
  };

  const handleSubmitRecipe = async (recipeData) => {
    try {
      let response;
      if (editingRecipe) {
        response = await updateRecipe(editingRecipe._id, recipeData);
      } else {
        response = await createRecipe(recipeData);
      }
      
      if (response.success) {
        setShowForm(false);
        fetchRecipes();
      }
    } catch (error) {
      console.error('Error saving recipe:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Cargando recetas...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Recetas</h1>
        <button 
          onClick={handleCreateRecipe}
          className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
        >
          Crear Receta
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recipes.map((recipe) => (
          <div key={recipe._id} className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">{recipe.dishName}</h3>
            <p className="text-sm text-gray-500 capitalize mb-4">{recipe.category}</p>
            
            {recipe.description && (
              <p className="text-sm text-gray-600 mb-4">{recipe.description}</p>
            )}
            
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Ingredientes:</h4>
              <ul className="text-sm text-gray-600">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="mb-1">
                    {ingredient.quantityNeeded} {ingredient.unit} de {ingredient.item?.itemName || 'Ingrediente'}
                  </li>
                ))}
              </ul>
            </div>
            
            {recipe.costPerServing > 0 && (
              <p className="text-sm text-gray-600 mb-4">
                Costo por porción: ${recipe.costPerServing.toFixed(2)}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                recipe.isAvailable 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {recipe.isAvailable ? 'Disponible' : 'No disponible'}
              </span>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditRecipe(recipe)}
                  className="text-indigo-600 hover:text-indigo-900 text-sm"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteRecipe(recipe._id)}
                  className="text-red-600 hover:text-red-900 text-sm"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {recipes.length === 0 && (
        <div className="bg-white p-8 rounded-lg shadow text-center mt-6">
          <p className="text-gray-500 text-lg">No hay recetas registradas</p>
        </div>
      )}

      {showForm && (
        <RecipeForm
          recipe={editingRecipe}
          onSubmit={handleSubmitRecipe}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default RecipeManagement;