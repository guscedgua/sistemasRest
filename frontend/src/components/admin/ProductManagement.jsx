import React, { useState, useEffect } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../services/api';
import ProductForm from '../modals/ProductForm';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getProducts();
      if (response.success) {
        setProducts(response.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        const response = await deleteProduct(productId);
        if (response.success) {
          fetchProducts();
        }
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleSubmitProduct = async (productData) => {
    try {
      let response;
      if (editingProduct) {
        response = await updateProduct(editingProduct._id, productData);
      } else {
        response = await createProduct(productData);
      }
      
      if (response.success) {
        setShowForm(false);
        fetchProducts();
      }
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const filteredProducts = filter === 'all' 
    ? products 
    : products.filter(product => product.category === filter);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Cargando productos...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Productos</h1>
        <button 
          onClick={handleCreateProduct}
          className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
        >
          Crear Producto
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por categoría:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="p-2 border border-gray-300 rounded-md"
        >
          <option value="all">Todos</option>
          <option value="entrada">Entradas</option>
          <option value="principal">Platos Principales</option>
          <option value="postre">Postres</option>
          <option value="bebida">Bebidas</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product._id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="h-48 bg-gray-200 flex items-center justify-center">
              {product.imageUrl ? (
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-gray-500">Sin imagen</span>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <p className="text-gray-600">${product.price.toFixed(2)}</p>
              <p className="text-sm text-gray-500 capitalize">{product.category}</p>
              {product.description && (
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{product.description}</p>
              )}
              <div className="flex items-center mt-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  product.isAvailable 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {product.isAvailable ? 'Disponible' : 'No disponible'}
                </span>
              </div>
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => handleEditProduct(product)}
                  className="text-indigo-600 hover:text-indigo-900 text-sm"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteProduct(product._id)}
                  className="text-red-600 hover:text-red-900 text-sm"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <ProductForm
          product={editingProduct}
          onSubmit={handleSubmitProduct}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default ProductManagement;