// backend/models/Product.js
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre del producto es requerido.'],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    price: {
        type: Number, // O String, si lo manejas como cadena y luego lo parseas
        required: [true, 'El precio del producto es requerido.'],
        min: [0, 'El precio no puede ser negativo.']
    },
    category: {
        type: String,
        required: [true, 'La categoría del producto es requerida.'],
        trim: true
    },
    imageUrl: {
        type: String,
        trim: true,
        default: 'no-photo.jpg'
    },
    // --- CAMPO DE RECETA (CRÍTICO) ---
    recipe: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe', // Asume que tienes un modelo llamado 'Recipe'
        required: false // Puede que no todos los productos tengan receta (ej. bebidas)
    },
    stock: { // Si manejas stock directamente en el producto (ej. bebidas embotelladas)
        type: Number,
        default: 0,
        min: 0
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
  
}, {
    timestamps: true
});

const Product = mongoose.model('Product', productSchema);
export default Product;