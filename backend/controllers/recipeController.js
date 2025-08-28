import Recipe from '../models/Recipe.js';
import Inventory from '../models/Inventory.js'; // Necesitamos Inventory para validar ingredientes

// @desc    Obtener todas las recetas
// @route   GET /api/recipes
// @access  Private/Admin (o público si es para un menú)
export const getAllRecipes = async (req, res) => {
    try {
        // Usamos .populate('ingredients.item') para obtener los detalles de los ingredientes del inventario
        const recipes = await Recipe.find({})
            .populate({
                path: 'ingredients.item',
                select: 'itemName unit -_id' // Solo selecciona los campos que te interesan del ítem de inventario
            })
            .select('-__v'); // Excluye el campo __v

        res.status(200).json({ success: true, count: recipes.length, recipes });
    } catch (error) {
        console.error('[RECIPE ERROR] Get All Recipes:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener las recetas',
            systemError: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};

// @desc    Obtener una receta por ID
// @route   GET /api/recipes/:id
// @access  Private/Admin (o público)
export const getRecipeById = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id)
            .populate({
                path: 'ingredients.item',
                select: 'itemName unit -_id'
            })
            .select('-__v');

        if (!recipe) {
            return res.status(404).json({ success: false, message: 'Receta no encontrada.' });
        }
        res.status(200).json({ success: true, recipe });
    } catch (error) {
        console.error('[RECIPE ERROR] Get Recipe by ID:', error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ success: false, message: 'ID de receta inválido.' });
        }
        res.status(500).json({
            success: false,
            message: 'Error al obtener la receta',
            systemError: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};

// @desc    Crear una nueva receta
// @route   POST /api/recipes
// @access  Private/Admin
export const createRecipe = async (req, res) => {
    try {
        const {
            dishName,
            description,
            category,
            ingredients, // Esto debería ser un array de objetos { item: ingredientId, quantityNeeded: num, unit: string }
            costPerServing, // Este campo es opcional si lo calculas dinámicamente
            instructions,
            isAvailable,
            nutritionalInfo,
            imageUrl
        } = req.body;

        // --- Validaciones básicas ---
        if (!dishName || !category || !ingredients || ingredients.length === 0) {
            return res.status(400).json({ message: 'Nombre del plato, categoría e ingredientes son requeridos para la receta.' });
        }

        // Validación para asegurar que los IDs de ingredientes son válidos y la unidad coincide
        for (let ing of ingredients) {
            const ingredientExists = await Inventory.findById(ing.item);
            if (!ingredientExists) {
                return res.status(400).json({ message: `Ingrediente con ID ${ing.item} no encontrado en el inventario.` });
            }
            // Opcional: Validar que la unidad del ingrediente en la receta coincida con la del inventario
            if (ingredientExists.unit && ing.unit && ingredientExists.unit.toLowerCase() !== ing.unit.toLowerCase()) {
                 return res.status(400).json({
                    success: false,
                    message: `La unidad '${ing.unit}' para el ingrediente '${ingredientExists.itemName}' no coincide con la unidad del inventario ('${ingredientExists.unit}').`
                });
            }
        }

        // Opcional: Calcular costPerServing basado en los ingredientes y su costo en el inventario/proveedores
        let calculatedCost = 0;
        // Si tienes una lógica para calcular esto, la implementarías aquí.
        // Por ahora, asumiremos que costPerServing viene del request o se deja nulo.

        const recipe = await Recipe.create({
            dishName,
            description,
            category,
            ingredients,
            costPerServing: costPerServing || calculatedCost, // Usa el del request o el calculado
            instructions,
            isAvailable: isAvailable !== undefined ? isAvailable : true, // Por defecto true si no se especifica
            nutritionalInfo,
            imageUrl
        });

        res.status(201).json({
            success: true,
            message: 'Receta creada exitosamente.',
            recipe
        });

    } catch (error) {
        console.error('[RECIPE ERROR] Create Recipe:', error);

        // Manejo de errores de Mongoose (ej. validación, duplicados)
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        if (error.code === 11000) { // Error de clave duplicada (ej. si dishName fuera único)
            return res.status(409).json({ success: false, message: 'Ya existe una receta con este nombre.' });
        }

        res.status(500).json({
            success: false,
            message: 'Error al crear la receta',
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};

// @desc    Actualizar una receta
// @route   PUT /api/recipes/:id
// @access  Private/Admin
export const updateRecipe = async (req, res) => {
    try {
        // Opcional: Validar que todos los IDs de ingredientes existen (similar a createRecipe)
        if (req.body.ingredients && req.body.ingredients.length > 0) {
            for (const ing of req.body.ingredients) {
                const itemExists = await Inventory.findById(ing.item);
                if (!itemExists) {
                    return res.status(400).json({
                        success: false,
                        message: `El ingrediente con ID ${ing.item} no existe en el inventario.`
                    });
                }
                // Validar que la unidad del ingrediente en la receta coincida con la del inventario
                if (itemExists.unit && ing.unit && itemExists.unit.toLowerCase() !== ing.unit.toLowerCase()) {
                    return res.status(400).json({
                        success: false,
                        message: `La unidad '${ing.unit}' para ${itemExists.itemName} no coincide con la unidad del inventario ('${itemExists.unit}').`
                    });
                }
            }
        }

        const recipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // Devuelve el documento actualizado
            runValidators: true // Ejecuta las validaciones del esquema en la actualización
        }).select('-__v');

        if (!recipe) {
            return res.status(404).json({ success: false, message: 'Receta no encontrada.' });
        }
        res.status(200).json({ success: true, message: 'Receta actualizada exitosamente.', recipe });
    } catch (error) {
        console.error('[RECIPE ERROR] Update Recipe:', error);
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Ya existe una receta con este nombre de plato.' });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ success: false, message: 'ID de receta inválido.' });
        }
        res.status(500).json({
            success: false,
            message: 'Error al actualizar la receta',
            systemError: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};

// @desc    Eliminar una receta
// @route   DELETE /api/recipes/:id
// @access  Private/Admin
export const deleteRecipe = async (req, res) => {
    try {
        const recipe = await Recipe.findByIdAndDelete(req.params.id);

        if (!recipe) {
            return res.status(404).json({ success: false, message: 'Receta no encontrada.' });
        }
        res.status(200).json({ success: true, message: 'Receta eliminada correctamente.' });
    } catch (error) {
        console.error('[RECIPE ERROR] Delete Recipe:', error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ success: false, message: 'ID de receta inválido.' });
        }
        res.status(500).json({
            success: false,
            message: 'Error al eliminar la receta',
            systemError: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};