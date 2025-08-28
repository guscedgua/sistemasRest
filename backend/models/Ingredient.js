import mongoose from 'mongoose';

const ingredientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre del ingrediente es requerido.'],
        unique: true, // Asegura que no haya ingredientes con nombres duplicados
        trim: true
    },
    unit: {
        type: String,
        required: [true, 'La unidad de medida es requerida (ej. kg, litros, gramos, unidad).'],
        trim: true
    },
    isAllergen: {
        type: Boolean,
        default: false
    },
    allergenInfo: {
        type: String,
        required: function() { return this.isAllergen; }, // Requerido solo si es alérgeno
        trim: true
    }
}, {
    timestamps: true
});

const Ingredient = mongoose.model('Ingredient', ingredientSchema);
export default Ingredient;