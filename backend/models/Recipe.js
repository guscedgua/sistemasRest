// backend/models/Recipe.js
import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema({
    dishName: {
        type: String,
        required: [true, 'El nombre del plato es requerido'],
        unique: true, // Asegura que no haya dos platos con el mismo nombre
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    category: { // <-- NOTA: 'category'
        type: String,
        required: [true, 'La categoría del plato es requerida'], // Mensaje de error para el front
        enum: ['food', 'entrada', 'postre', 'bebida', 'guarnición'], // Ejemplos de categorías
        trim: true
    },
    // Array de ingredientes necesarios para esta receta
    ingredients: [
        {
            // Referencia al ítem de inventario (ej: "Carne de res", "Pan de hamburguesa")
            item: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Inventory', // Apunta a tu modelo Inventory
                required: [true, 'El ID del ingrediente de inventario es requerido']
            },
            // Cantidad de este ingrediente necesaria para UNA porción/plato
            quantityNeeded: {
                type: Number,
                required: [true, 'La cantidad necesaria del ingrediente es requerida'],
                min: [0, 'La cantidad necesaria no puede ser negativa']
            },
            // Unidad de medida para esta cantidad (debe coincidir con la del inventario)
            unit: {
                type: String,
                enum: ['kg', 'g', 'l', 'ml', 'unidades'],
                required: [true, 'La unidad del ingrediente es requerida']
            }
        }
    ],
    // Puedes añadir un costo estimado de la receta por porción (opcional)
    costPerServing: {
        type: Number,
        min: 0,
        default: 0
    },
    // Instrucciones de preparación (opcional)
    instructions: {
        type: [String],
        trim: true
    },
 
}, { timestamps: true });

// Índice para búsqueda rápida por nombre de plato
recipeSchema.index({ dishName: 'text', category: 'text' });

export default mongoose.model('Recipe', recipeSchema);