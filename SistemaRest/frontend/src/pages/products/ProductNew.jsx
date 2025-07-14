// frontend/src/pages/products/ProductNew.jsx
import { useNavigate } from 'react-router-dom';
import ProductForm from '../../components/products/ProductForm';
import { createProduct } from '../../api/products'; // Importa la función para crear el producto

const ProductNew = () => {
  const navigate = useNavigate();

  const handleSubmit = async (productData) => {
    try {
      await createProduct(productData);
      alert('Producto creado exitosamente!'); // Mensaje de éxito
      navigate('/products'); // Redirige a la lista de productos
    } catch (error) {
      console.error('Error creando producto:', error);
      alert(`Error creando producto: ${error.message}`); // Mensaje de error
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Crear Nuevo Producto</h1>
        <button
          className="text-gray-500 hover:text-gray-700"
          onClick={() => navigate('/products')}
        >
          Cancelar
        </button>
      </div>

      <ProductForm onSubmit={handleSubmit} />
    </div>
  );
};

export default ProductNew;