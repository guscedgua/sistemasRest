// backend/controllers/ingredientController.js
import Ingredient from '../models/Ingredient.js';
import Setting from '../models/Setting.js'; // Importa el modelo Setting
import asyncHandler from 'express-async-handler'; // Importa asyncHandler para manejar errores asíncronos

// Función auxiliar para verificar si el módulo de ingredientes está activo
const isIngredientModuleActive = async () => {
    try {
        // Asumiendo que Setting.getSettings() es una función estática o un método que devuelve la configuración
        // Si 'Setting' es un modelo de Mongoose, podrías necesitar buscar un documento específico, por ejemplo:
        const settings = await Setting.findOne({}); // O Setting.findById('algunaIdDeConfiguracion')
        return settings ? settings.useIngredientModule : false; // Asegúrate de que el campo exista
    } catch (error) {
        console.error("Error al verificar si el módulo de ingredientes está activo:", error);
        return false; // Por seguridad, si hay un error, desactiva la funcionalidad
    }
};

/**
 * @desc Crear un nuevo ingrediente
 * @route POST /api/ingredients
 * @access Private (administrador)
 */
export const createIngredient = asyncHandler(async (req, res) => {
    // Verificar si el módulo de ingredientes está activo
    if (!(await isIngredientModuleActive())) {
        return res.status(403).json({
            success: false,
            message: 'El módulo de gestión de ingredientes está deshabilitado por la configuración del sistema.'
        });
    }

    const { name, unit, isAllergen, allergenInfo } = req.body;

    // Verificar si ya existe un ingrediente con el mismo nombre (insensible a mayúsculas/minúsculas)
    const existingIngredient = await Ingredient.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingIngredient) {
        res.status(409);
        throw new Error('Ya existe un ingrediente con este nombre.');
    }

    const newIngredient = new Ingredient({
        name,
        unit,
        isAllergen: isAllergen || false,
        allergenInfo: isAllergen ? allergenInfo : undefined
    });

    const savedIngredient = await newIngredient.save();
    res.status(201).json({
        success: true,
        message: 'Ingrediente creado exitosamente.',
        ingredient: savedIngredient
    });
});

/**
 * @desc Obtener todos los ingredientes
 * @route GET /api/ingredients
 * @access Private (administrador, cocinero, mesero, cajero - o cualquiera que necesite ver ingredientes)
 */
export const getAllIngredients = asyncHandler(async (req, res) => {
    // Nota: Para las lecturas, podrías decidir si quieres que el módulo esté activo o no.
    // Aquí, lo haremos opcional también por coherencia, pero podrías querer que los ingredientes
    // se puedan listar incluso si el módulo de edición está deshabilitado.
    // Si el módulo está deshabilitado, se devuelve una lista vacía con un mensaje.
    if (!(await isIngredientModuleActive())) {
        return res.status(200).json({
            success: true,
            message: 'El módulo de gestión de ingredientes está deshabilitado. No se listan ingredientes.',
            ingredients: []
        });
    }

    const ingredients = await Ingredient.find().sort({ name: 1 });
    res.status(200).json({
        success: true,
        count: ingredients.length,
        ingredients
    });
});

/**
 * @desc Obtener un ingrediente por ID
 * @route GET /api/ingredients/:id
 * @access Private (administrador, cocinero, mesero)
 */
export const getIngredientById = asyncHandler(async (req, res) => {
    if (!(await isIngredientModuleActive())) {
        return res.status(403).json({
            success: false,
            message: 'El módulo de gestión de ingredientes está deshabilitado por la configuración del sistema.'
        });
    }

    const ingredient = await Ingredient.findById(req.params.id);
    if (!ingredient) {
        res.status(404);
        throw new Error('Ingrediente no encontrado.');
    }
    res.status(200).json({ success: true, ingredient });
});

/**
 * @desc Actualizar un ingrediente
 * @route PUT /api/ingredients/:id
 * @access Private (administrador)
 */
export const updateIngredient = asyncHandler(async (req, res) => {
    if (!(await isIngredientModuleActive())) {
        return res.status(403).json({
            success: false,
            message: 'El módulo de gestión de ingredientes está deshabilitado por la configuración del sistema.'
        });
    }

    const { name, unit, isAllergen, allergenInfo } = req.body;

    let ingredient = await Ingredient.findById(req.params.id);
    if (!ingredient) {
        res.status(404);
        throw new Error('Ingrediente no encontrado.');
    }

    // Verificar si el nuevo nombre ya existe en otro ingrediente (excepto el actual)
    if (name && name !== ingredient.name) {
        const existingIngredient = await Ingredient.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            _id: { $ne: req.params.id }
        });
        if (existingIngredient) {
            res.status(409);
            throw new Error('Ya existe otro ingrediente con este nombre.');
        }
    }

    ingredient.name = name || ingredient.name;
    ingredient.unit = unit || ingredient.unit;
    ingredient.isAllergen = typeof isAllergen === 'boolean' ? isAllergen : ingredient.isAllergen;

    // Lógica condicional para allergenInfo
    if (ingredient.isAllergen) {
        ingredient.allergenInfo = allergenInfo || ingredient.allergenInfo;
    } else {
        ingredient.allergenInfo = undefined; // Limpia la información si ya no es un alérgeno
    }

    const updatedIngredient = await ingredient.save();
    res.status(200).json({
        success: true,
        message: 'Ingrediente actualizado exitosamente.',
        ingredient: updatedIngredient
    });
});

/**
 * @desc Eliminar un ingrediente
 * @route DELETE /api/ingredients/:id
 * @access Private (administrador)
 */
export const deleteIngredient = asyncHandler(async (req, res) => {
    if (!(await isIngredientModuleActive())) {
        return res.status(403).json({
            success: false,
            message: 'El módulo de gestión de ingredientes está deshabilitado por la configuración del sistema.'
        });
    }

    const ingredient = await Ingredient.findById(req.params.id);
    if (!ingredient) {
        res.status(404);
        throw new Error('Ingrediente no encontrado.');
    }

    // Consideración importante: Antes de eliminar un ingrediente,
    // deberías verificar si está referenciado en alguna receta o inventario.
    // Si lo está, podrías:
    // 1. Impedir la eliminación y devolver un error.
    // 2. Desvincularlo automáticamente (más complejo y puede causar inconsistencias).
    // Por ahora, solo eliminará el ingrediente. La verificación de referencias
    // es una mejora futura recomendada para la integridad de los datos.

    await ingredient.deleteOne(); // Mongoose 6+

    res.status(200).json({ success: true, message: 'Ingrediente eliminado exitosamente.' });
});

/**
 * @desc Añadir cantidad a un ítem de inventario (ingrediente)
 * @route PATCH /api/ingredients/:itemId/add
 * @access Private (admin, supervisor)
 *
 * NOTA IMPORTANTE: El nombre de la función exportada debe coincidir con la importación en la ruta.
 * Si en tu router.js importas `addIngredientQuantity`, aquí debe ser `export const addIngredientQuantity`.
 * Si en tu router.js importas `addInventoryQuantity`, aquí debe ser `export const addInventoryQuantity`.
 * Hemos usado 'addInventoryQuantity' y 'removeInventoryQuantity' para ser consistentes con la terminología.
 */
export const addInventoryQuantity = asyncHandler(async (req, res) => {
    if (!(await isIngredientModuleActive())) {
        return res.status(403).json({
            success: false,
            message: 'El módulo de gestión de ingredientes está deshabilitado por la configuración del sistema.'
        });
    }
    const { quantity } = req.body;
    if (quantity === undefined || quantity <= 0) {
        res.status(400);
        throw new Error('La cantidad a añadir debe ser un número positivo.');
    }

    const ingredient = await Ingredient.findById(req.params.itemId); // Usa req.params.itemId como en las rutas
    if (!ingredient) {
        res.status(404);
        throw new Error('Ingrediente no encontrado.');
    }

    ingredient.currentStock = (ingredient.currentStock || 0) + quantity; // Asegura que currentStock sea un número
    const updatedIngredient = await ingredient.save();
    res.status(200).json({ success: true, data: updatedIngredient, message: 'Cantidad añadida exitosamente.' });
});

/**
 * @desc Remover cantidad de un ítem de inventario (ingrediente)
 * @route PATCH /api/ingredients/:itemId/remove
 * @access Private (admin, supervisor)
 */
export const removeInventoryQuantity = asyncHandler(async (req, res) => {
    if (!(await isIngredientModuleActive())) {
        return res.status(403).json({
            success: false,
            message: 'El módulo de gestión de ingredientes está deshabilitado por la configuración del sistema.'
        });
    }
    const { quantity } = req.body;
    if (quantity === undefined || quantity <= 0) {
        res.status(400);
        throw new Error('La cantidad a remover debe ser un número positivo.');
    }

    const ingredient = await Ingredient.findById(req.params.itemId); // Usa req.params.itemId como en las rutas
    if (!ingredient) {
        res.status(404);
        throw new Error('Ingrediente no encontrado.');
    }

    if ((ingredient.currentStock || 0) < quantity) { // Asegura que currentStock sea un número
        res.status(400);
        throw new Error('No hay suficiente stock para remover la cantidad especificada.');
    }
    ingredient.currentStock = (ingredient.currentStock || 0) - quantity;
    const updatedIngredient = await ingredient.save();
    res.status(200).json({ success: true, data: updatedIngredient, message: 'Cantidad removida exitosamente.' });
});