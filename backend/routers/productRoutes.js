// backend/routers/productRoutes.js
import express from 'express';
import {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
  getProductsCount,
  getActiveProductsCount,
  getProductsCountByCategory

} from '../controllers/productController.js';
import { auth, adminCheck, roleCheck } from '../middleware/auth.js'; // Asegúrate de que las importaciones de middleware sean correctas

const router = express.Router();

router.get('/count', auth, getProductsCount);
router.get('/count/active', auth, getActiveProductsCount);
router.get('/count/by-category', auth, getProductsCountByCategory)
// Rutas públicas (cualquiera puede ver los productos)
// No requieren 'auth' ni 'adminCheck'
router.get('/', getProducts);
router.get('/:id', getProductById);

// Rutas protegidas (solo admin)
// Requieren 'auth' para estar logeado y 'adminCheck' para verificar el rol
router.post('/', auth, adminCheck, createProduct); // Solo admin puede crear productos
router.put('/:id', auth, adminCheck, updateProduct); // Solo admin puede actualizar productos
router.delete('/:id', auth, adminCheck, deleteProduct); // Solo admin puede eliminar productos

export default router;
