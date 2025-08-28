// backend/routers/tableRoutes.js
import express from 'express';
import {
    createTable,
    getAllTables,
    getTableById,
    updateTable,
    deleteTable,
    updateTableStatus
} from '../controllers/tableController.js';
import {
    auth,
    roleCheck, // Usaremos roleCheck
    adminCheck,
    supervisorCheck,
    meseroCheck
} from '../middleware/auth.js';

const router = express.Router();

router.route('/')
    .post(auth, adminCheck, createTable) // Requiere rol 'admin' para crear una mesa
    .get(auth, roleCheck(['admin', 'mesero']), getAllTables); // Permite roles 'admin' y 'mesero' para obtener todas las mesas

router.route('/:tableId') // Utiliza el parámetro ':tableId' para operaciones específicas de una mesa
    .get(auth, meseroCheck, getTableById) // Requiere rol 'mesero' para obtener una mesa por ID
    .put(auth, supervisorCheck, updateTable) // Requiere rol 'supervisor' para actualizar completamente una mesa
    .delete(auth, adminCheck, deleteTable); // Requiere rol 'admin' para eliminar una mesa

router.patch('/:tableId/status', auth, meseroCheck, updateTableStatus); // Requiere rol 'mesero' para actualizar el estado de una mesa

export default router;
