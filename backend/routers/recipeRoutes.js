// backend/routers/recipeRoutes.js
import express from 'express';
const router = express.Router();
import {
    getAllRecipes,
    getRecipeById,
    createRecipe,
    updateRecipe,
    deleteRecipe
} from '../controllers/recipeController.js';

// Importa tus middlewares de autenticación y autorización
import { auth, adminCheck, roleCheck } from '../middleware/auth.js';

// Rutas para /api/recipes
router.route('/')
    .get(auth, roleCheck(['admin', 'supervisor', 'cocinero', 'mesero']), getAllRecipes)
    .post(auth, adminCheck, createRecipe);

// Rutas para /api/recipes/:recipeId
// @route GET /api/recipes/:recipeId
router.route('/:recipeId')
    .get(auth, roleCheck(['admin', 'supervisor', 'cocinero', 'mesero']), getRecipeById)
    .put(auth, adminCheck, updateRecipe)
    .delete(auth, adminCheck, deleteRecipe);

export default router;
