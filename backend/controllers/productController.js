// backend/controllers/productController.js
import Product from '../models/Product.js';

// @desc    Crear un nuevo producto
// @route   POST /api/products
// @access  Admin
export const createProduct = async (req, res) => {
    console.log('[BACKEND] Recibida solicitud POST para /api/products con datos:', req.body);

    try {
        const { name, description, price, category, imageUrl, stock, isAvailable, recipe } = req.body;

        // Validar campos requeridos
        if (!name || !price || !category) {
            return res.status(400).json({ message: 'Nombre, precio y categoría son requeridos.' });
        }

        // Validación condicional para recetas (si la categoría es 'Pizza')
        if (category === 'Pizza' && !recipe) {
            return res.status(400).json({ message: 'Las pizzas requieren un ID de receta.' });
        }

        // Verificar si el nombre del producto ya existe
        const existingProduct = await Product.findOne({ name });
        if (existingProduct) {
            return res.status(409).json({ message: 'Ya existe un producto con este nombre.' });
        }

        // Crear el nuevo producto en la base de datos
        const product = await Product.create({
            name,
            description,
            price: parseFloat(price).toFixed(2), // Asegura que el precio se guarda con 2 decimales
            category,
            imageUrl,
            stock,
            isAvailable,
            recipe // Guarda el ID de la receta (será null si no se proporcionó)
        });

        // --- ¡LÍNEA DE LOG CORREGIDA Y MOVIDA AQUÍ! ---
        // Ahora 'product' ya está definido y contiene el producto recién creado
        console.log('[BACKEND] Producto creado exitosamente:', product.name, 'ID:', product._id);

        // Enviar la respuesta de éxito al frontend con el producto creado
        res.status(201).json({ success: true, product });

    } catch (error) {
        // Manejo de errores detallado
        console.error('[PRODUCT ERROR] Create Product:', error);
        if (error.code === 11000) { // Error de clave duplicada (ej. si el nombre es único)
            res.status(409).json({ message: 'Producto ya existe (nombre duplicado).' });
        } else if (error.name === 'ValidationError') { // Errores de validación de Mongoose
            const messages = Object.values(error.errors).map(val => val.message);
            res.status(400).json({ success: false, message: messages.join(', ') });
        } else { // Otros errores del servidor
            res.status(500).json({
                message: 'Error al crear el producto',
                systemError: process.env.NODE_ENV === 'development' ? error.message : null
            });
        }
    }
};

// @desc    Obtener todos los productos
// @route   GET /api/products
// @access  Public (puede ser visto por todos)
export const getProducts = async (req, res) => {
    console.log('[BACKEND] Recibida solicitud GET para /api/products'); // <-- ¡AGREGA ESTO!

  try {
    const products = await Product.find({}).select('-__v');
    console.log(`[BACKEND] Se encontraron ${products.length} productos.`); // <-- ¡AGREGA ESTO!
    res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    console.error('[PRODUCT ERROR] Get Products:', error);
    res.status(500).json({
      message: 'Error al obtener los productos',
      systemError: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

// @desc    Obtener un producto por ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error('[PRODUCT ERROR] Get Product by ID:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'ID de producto inválido.' });
    }
    res.status(500).json({
      message: 'Error al obtener el producto',
      systemError: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

// @desc    Actualizar un producto
// @route   PUT /api/products/:id
// @access  Admin
export const updateProduct = async (req, res) => {
    try {
        const { name, description, price, category, imageUrl, stock, isAvailable, recipe } = req.body; // <-- ¡Añade 'recipe' aquí!

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        // Si se intenta cambiar el nombre, verificar que no haya duplicados
        if (name && name !== product.name) {
            const existingProduct = await Product.findOne({ name });
            if (existingProduct && existingProduct._id.toString() !== req.params.id) {
                return res.status(409).json({ message: 'Ya existe un producto con este nombre.' });
            }
        }

        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price !== undefined ? parseFloat(price).toFixed(2) : product.price;
        product.category = category || product.category;
        product.imageUrl = imageUrl || product.imageUrl;
        product.stock = stock !== undefined ? stock : product.stock;
        product.isAvailable = isAvailable !== undefined ? isAvailable : product.isAvailable;
        // --- ¡NUEVA LÍNEA PARA ACTUALIZAR RECIPE! ---
        // Verifica si 'recipe' fue proporcionado en el body y actualízalo
        // Esto permite asignar, cambiar o incluso quitar (si se envía null/undefined) una receta.
        if (recipe !== undefined) {
             product.recipe = recipe;
        }

        const updatedProduct = await product.save();
        res.status(200).json({ success: true, product: updatedProduct });

    } catch (error) {
        console.error('[PRODUCT ERROR] Update Product:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'ID de producto inválido.' });
        }
        if (error.code === 11000) {
            return res.status(409).json({ message: 'El nombre del producto ya está en uso.' });
        }
        res.status(500).json({
            message: 'Error al actualizar el producto',
            systemError: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};

// @desc    Eliminar un producto
// @route   DELETE /api/products/:id
// @access  Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.status(200).json({ success: true, message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error('[PRODUCT ERROR] Delete Product:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'ID de producto inválido.' });
    }
    res.status(500).json({
      message: 'Error al eliminar el producto',
      systemError: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

export const getAllProducts = async (req, res) => {
    try {
        console.log('--- Intentando obtener todos los productos ---'); // LOG
        const products = await Product.find({});
        console.log('[BACKEND] Se encontraron', products.length, 'productos.'); 
        // Consulta todos los productos
        console.log(`Productos encontrados: ${products.length}`); // LOG
        res.status(200).json({
            success: true,
            products: products // Devuelve un objeto con la clave 'products'
        });
    } catch (error) {
        console.error('Error al obtener productos:', error); // LOG DE ERROR
        res.status(500).json({ success: false, message: 'Error interno del servidor al obtener productos.' });
    }
};
export const getProductsCount = async (req, res) => {
  try {
    const count = await Product.countDocuments({});
    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    console.error('[PRODUCT ERROR] Get Products Count:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener el conteo de productos'
    });
  }
};

/**
 * @desc    Obtener el conteo de productos activos
 * @route   GET /api/products/count/active
 * @access  Private (admin, supervisor)
 */
export const getActiveProductsCount = async (req, res) => {
  try {
    const count = await Product.countDocuments({ isAvailable: true });
    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    console.error('[PRODUCT ERROR] Get Active Products Count:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener el conteo de productos activos'
    });
  }
};

/**
 * @desc    Obtener el conteo de productos por categoría
 * @route   GET /api/products/count/by-category
 * @access  Private (admin, supervisor)
 */
export const getProductsCountByCategory = async (req, res) => {
  try {
    const countByCategory = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: countByCategory
    });
  } catch (error) {
    console.error('[PRODUCT ERROR] Get Products Count by Category:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener el conteo de productos por categoría'
    });
  }
};