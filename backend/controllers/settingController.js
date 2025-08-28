import Setting from '../models/Setting.js';

// Definición de roles para el acceso a módulos
// Puedes mover esto a un archivo de configuración global (ej. backend/config/moduleAccessDefaults.js)
// si tienes muchas configuraciones por defecto o roles.
const DEFAULT_MODULE_ACCESS = {
    dashboard: ["admin", "supervisor", "mesero", "cocinero"],
    pedidos: ["admin", "supervisor", "mesero"],
    mesas: ["admin", "supervisor", "mesero"],
    products: ["admin", "supervisor"],      // Asegúrate de que estas claves coincidan con tu frontend
    inventory: ["admin", "supervisor"],     // (ej. si en frontend usas 'productos', aquí debe ser 'productos')
    recipes: ["admin", "supervisor", "cocinero"], // Cocinero también puede ver recetas
    settings: ["admin"],
    users: ["admin"], // Si tienes un módulo de usuarios
    reports: ["admin", "supervisor"], // Si tienes un módulo de reportes
    suppliers: ["admin", "supervisor"] // Si tienes un módulo de proveedores
    // Agrega aquí todos los módulos de tu aplicación y los roles que pueden acceder
};

export const getSettings = async (req, res) => {
    try {
        console.log('[DEBUG BACKEND] Intentando buscar configuración existente...');
        let settings = await Setting.findOne(); // Busca el único documento de configuración

        // Si no hay configuraciones, crea una por defecto
        if (!settings) {
            console.log('[DEBUG BACKEND] No se encontró configuración existente. Creando una nueva con valores por defecto.');
            settings = await Setting.create({
                restaurantName: 'Mi Restaurante POS',
                currency: '$',
                taxRate: 0,
                useInventoryModule: true, // Puedes ponerlos a true por defecto si quieres que estén activos
                useRecipeModule: true,   // Puedes ponerlos a true por defecto si quieres que estén activos
                moduleAccess: DEFAULT_MODULE_ACCESS, // Añade el acceso a módulos por defecto
            });
            console.log('[DEBUG BACKEND] Configuración por defecto creada:', settings);
        } else {
            console.log('[DEBUG BACKEND] Se encontró configuración existente:', settings);
        }

        // Asegúrate de que la respuesta siempre incluya moduleAccess,
        // fusionando con los valores por defecto si la base de datos no los tiene
        // Esto es crucial para compatibilidad con configuraciones existentes sin este campo
        const settingsToSend = {
            ...settings.toObject(), // Convierte el documento Mongoose a un objeto JavaScript plano
            moduleAccess: settings.moduleAccess || DEFAULT_MODULE_ACCESS // Asegura que moduleAccess esté presente
        };

        console.log('[DEBUG BACKEND] Configuración final a enviar al frontend:', settingsToSend);
        res.status(200).json({ success: true, settings: settingsToSend });
    } catch (error) {
        console.error('[ERROR BACKEND] Error al obtener la configuración:', error);
        res.status(500).json({ message: 'Error al obtener la configuración', error: error.message });
    }
};

export const updateSettings = async (req, res) => {
    try {
        const { 
            restaurantName, 
            currency, 
            taxRate, 
            useInventoryModule, 
            useRecipeModule,
            moduleAccess // Asegúrate de recibir moduleAccess del frontend también
        } = req.body;

        console.log('[DEBUG BACKEND] Solicitud de actualización de configuración recibida. Body:', req.body);

        let settings = await Setting.findOne();

        if (!settings) {
            console.warn('[DEBUG BACKEND] Configuración no encontrada para actualizar. Esto no debería pasar si getSettings la crea.');
            return res.status(404).json({ message: 'Configuración no encontrada para actualizar.' });
        }

        // Actualiza solo los campos que se envíen
        settings.restaurantName = restaurantName !== undefined ? restaurantName : settings.restaurantName;
        settings.currency = currency !== undefined ? currency : settings.currency;
        settings.taxRate = taxRate !== undefined ? taxRate : settings.taxRate;
        settings.useInventoryModule = useInventoryModule !== undefined ? useInventoryModule : settings.useInventoryModule;
        settings.useRecipeModule = useRecipeModule !== undefined ? useRecipeModule : settings.useRecipeModule;
        
        // Actualiza el campo moduleAccess si se envía
        if (moduleAccess !== undefined) {
            settings.moduleAccess = moduleAccess;
        }

        const updatedSettings = await settings.save();
        console.log('[DEBUG BACKEND] Configuración actualizada y guardada en DB:', updatedSettings);
        
        // Asegúrate de que la respuesta de actualización también incluya moduleAccess
        // por si no se envió en el body o para asegurar que se muestre el valor predeterminado
        const settingsToSend = {
            ...updatedSettings.toObject(),
            moduleAccess: updatedSettings.moduleAccess || DEFAULT_MODULE_ACCESS
        };

        console.log('[DEBUG BACKEND] Respuesta de actualización de configuración enviada:', settingsToSend);
        res.status(200).json({ success: true, message: 'Configuración actualizada', settings: settingsToSend });

    } catch (error) {
        console.error('[ERROR BACKEND] Error al actualizar la configuración:', error);
        res.status(500).json({ message: 'Error al actualizar la configuración', error: error.message });
    }
};