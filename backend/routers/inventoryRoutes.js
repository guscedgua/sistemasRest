// backend/routers/inventoryRoutes.js
import express from 'express';
const router = express.Router();
import {
    getAllInventoryItems,
    getInventoryItemById,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    addInventoryQuantity,
    removeInventoryQuantity
} from '../controllers/inventoryController.js';

// Importa tus middlewares de autenticación y autorización
import { auth, roleCheck, adminCheck } from '../middleware/auth.js';

// Rutas protegidas para la gestión de inventario

// @desc    Crear un nuevo ítem de inventario
// @route   POST /api/inventory
// @access  Private (admin)
router.post('/', auth, adminCheck, createInventoryItem);

// @desc    Obtener todos los ítems de inventario
// @route   GET /api/inventory
// @access  Private (admin, supervisor, cocinero)
router.get('/', auth, roleCheck(['admin', 'supervisor', 'cocinero']), getAllInventoryItems);

// @desc    Obtener un ítem de inventario por ID
// @route   GET /api/inventory/:itemId
// @access  Private (admin, supervisor, cocinero)
router.get('/:itemId', auth, roleCheck(['admin', 'supervisor', 'cocinero']), getInventoryItemById);

// @desc    Actualizar un ítem de inventario por ID
// @route   PUT /api/inventory/:itemId
// @access  Private (admin)
router.put('/:itemId', auth, adminCheck, updateInventoryItem);

// @desc    Eliminar un ítem de inventario por ID
// @route   DELETE /api/inventory/:itemId
// @access  Private (admin)
router.delete('/:itemId', auth, adminCheck, deleteInventoryItem);

// @desc    Añadir cantidad a un ítem de inventario
// @route   PATCH /api/inventory/:itemId/add
// @access  Private (admin, supervisor)
router.patch('/:itemId/add', auth, roleCheck(['admin', 'supervisor']), addInventoryQuantity);

// @desc    Remover cantidad de un ítem de inventario
// @route   PATCH /api/inventory/:itemId/remove
// @access  Private (admin, supervisor)
router.patch('/:itemId/remove', auth, roleCheck(['admin', 'supervisor']), removeInventoryQuantity);

// Asegúrate de que tu inventoryController.js también espere 'itemId' en req.params
// Por ejemplo, en tu controlador: const { itemId } = req.params;
export default router;
