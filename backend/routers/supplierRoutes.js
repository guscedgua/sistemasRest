// backend/routers/supplierRoutes.js
import express from 'express';
const router = express.Router();
import {
    getAllSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier
} from '../controllers/supplierController.js';

// Importa tus middlewares de autenticación y autorización
import { auth, adminCheck, roleCheck } from '../middleware/auth.js';

// Rutas para /api/suppliers
router.route('/')
    .get(auth, roleCheck(['admin', 'supervisor']), getAllSuppliers) // Acceso controlado para ver proveedores
    .post(auth, adminCheck, createSupplier); // Solo admin puede crear proveedores

// Rutas para /api/suppliers/:supplierId
router.route('/:supplierId')
    .get(auth, roleCheck(['admin', 'supervisor']), getSupplierById) // Acceso controlado
    .put(auth, adminCheck, updateSupplier) // Solo admin puede actualizar
    .delete(auth, adminCheck, deleteSupplier); // Solo admin puede eliminar

// Asegúrate de que tu supplierController.js también espere 'supplierId' en req.params
// Por ejemplo, en tu controlador: const { supplierId } = req.params;

export default router;
