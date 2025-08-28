// backend/models/Setting.js
// Modelo para la configuración global del sistema.

import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
    // Un campo para indicar si el módulo de inventario está activo
    useInventoryModule: {
        type: Boolean,
        default: false // Por defecto, desactivado
    },
    // Un campo para indicar si el módulo de receta está activo
    useRecipeModule: {
        type: Boolean,
        default: false // Por defecto, desactivado
    },
    // === CAMPOS AGREGADOS PARA EL NOMBRE DEL RESTAURANTE, MONEDA Y TASA DE IMPUESTOS ===
    restaurantName: {
        type: String,
        default: 'Mi Restaurante', // Valor por defecto
        trim: true // Elimina espacios en blanco al inicio y al final
    },
    currency: {
        type: String,
        default: '$', // Valor por defecto (ej. '$', '€', 'Bs')
        trim: true
    },
    taxRate: {
        type: Number,
        default: 0, // Valor por defecto (ej. 0, 0.16 para 16%)
        min: 0 // Asegura que la tasa no sea negativa
    }
    // Podrías añadir otras configuraciones aquí en el futuro
}, { 
    timestamps: true 
});

// Para asegurar que solo haya un documento de configuración en la colección
settingSchema.statics.getSettings = async function() {
    let settings = await this.findOne();
    if (!settings) {
        // Si no existe, crea un documento por defecto con TODOS los valores iniciales
        settings = await this.create({ 
            useInventoryModule: false, 
            useRecipeModule: false,
            restaurantName: 'Mi Restaurante', // Valor por defecto
            currency: '$',                   // Valor por defecto
            taxRate: 0                       // Valor por defecto
        });
    }
    return settings;
};

export default mongoose.model('Setting', settingSchema);