// backend/routers/ingredientRoutes.js
import express from 'express';
const router = express.Router();
import {
    getAllIngredients,
    getIngredientById,
    createIngredient,
    updateIngredient,
    deleteIngredient,
    addInventoryQuantity,
    removeInventoryQuantity
} from '../controllers/ingredientController.js';

// Importa tus middlewares de autenticación y autorización
import { auth, roleCheck, adminCheck } from '../middleware/auth.js';

// Rutas protegidas para la gestión de ingredientes

// @desc    Crear un nuevo ítem de ingrediente
// @route   POST /api/ingredients
// @access  Private (admin)
router.post('/', auth, adminCheck, createIngredient);

// @desc    Obtener todos los ítems de ingrediente
// @route   GET /api/ingredients
// @access  Private (admin, supervisor, cocinero)
router.get('/', auth, roleCheck(['admin', 'supervisor', 'cocinero']), getAllIngredients);

// @desc    Obtener un ítem de ingrediente por ID
// @route   GET /api/ingredients/:itemId
// @access  Private (admin, supervisor, cocinero)
router.get('/:itemId', auth, roleCheck(['admin', 'supervisor', 'cocinero']), getIngredientById);

// @desc    Actualizar un ítem de ingrediente por ID
// @route   PUT /api/ingredients/:itemId
// @access  Private (admin)
router.put('/:itemId', auth, adminCheck, updateIngredient);

// @desc    Eliminar un ítem de ingrediente por ID
// @route   DELETE /api/ingredients/:itemId
// @access  Private (admin)
router.delete('/:itemId', auth, adminCheck, deleteIngredient);

// @desc    Añadir cantidad a un ítem de inventario (ingrediente)
// @route   PATCH /api/ingredients/:itemId/add
// @access  Private (admin, supervisor)
router.patch('/:itemId/add', auth, roleCheck(['admin', 'supervisor']), addInventoryQuantity);

// @desc    Remover cantidad de un ítem de inventario (ingrediente)
// @route   PATCH /api/ingredients/:itemId/remove
// @access  Private (admin, supervisor)
router.patch('/:itemId/remove', auth, roleCheck(['admin', 'supervisor']), removeInventoryQuantity);

export default router;
