// backend/controllers/adminController.js
import Setting from '../models/Setting.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Table from '../models/Table.js'; // Necesitas este modelo para las mesas

/**
 * @desc    Obtener datos para el dashboard del administrador.
 * @route   GET /api/admin/dashboard?metric=<metricName>
 * @access  Private (admin)
 */

export const getAdminDashboardMetrics = async (req, res) => {
    try {
        const { metric } = req.query;
        let metrics = {};

        // Función para obtener la fecha de hoy a medianoche en UTC
        const getStartOfDayUTC = () => {
            const now = new Date();
            return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        };
        
        const fetchAllMetrics = async () => {
            const today = getStartOfDayUTC();

            const [
                totalUsers,
                totalProducts,
                totalOrders,
                todaysOrders,
                occupiedTables,
            ] = await Promise.all([
                User.countDocuments({}),
                Product.countDocuments({}),
                Order.countDocuments({}),
                Order.countDocuments({ createdAt: { $gte: today } }),
                Table.countDocuments({ isAvailable: false }),
            ]);

            return {
                totalUsers,
                totalProducts,
                totalOrders,
                todaysOrders,
                occupiedTables,
            };
        };

        if (metric) {
            switch (metric) {
                case 'totalUsers':
                    metrics.totalUsers = await User.countDocuments({});
                    break;
                case 'totalProducts':
                    metrics.totalProducts = await Product.countDocuments({});
                    break;
                case 'totalOrders':
                    metrics.totalOrders = await Order.countDocuments({});
                    break;
                case 'todaysOrders':
                    const today = getStartOfDayUTC();
                    metrics.todaysOrders = await Order.countDocuments({ createdAt: { $gte: today } });
                    break;
                case 'occupiedTables':
                    metrics.occupiedTables = await Table.countDocuments({ isAvailable: false });
                    break;
                default:
                    return res.status(400).json({ success: false, message: `Métrica '${metric}' no es válida.` });
            }
        } else {
            metrics = await fetchAllMetrics();
        }

        res.status(200).json({
            success: true,
            data: metrics
        });

    } catch (error) {
        console.error('Error al obtener métricas del dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al obtener las métricas del dashboard.',
            systemError: process.env.NODE_ENV === 'development' ? error.message : null,
        });
    }
};
export const updateSystemSettings = async (req, res) => {
    try {
        const settings = await Setting.getSettings();

        if (req.body.defaultTaxRate !== undefined) {
            settings.defaultTaxRate = req.body.defaultTaxRate;
        }
        if (req.body.welcomeMessage !== undefined) {
            settings.welcomeMessage = req.body.welcomeMessage;
        }
        // Agrega aquí los campos para useInventoryModule, useRecipeModule, etc.
        if (req.body.useInventoryModule !== undefined) {
            settings.useInventoryModule = req.body.useInventoryModule;
        }
        if (req.body.useRecipeModule !== undefined) {
            settings.useRecipeModule = req.body.useRecipeModule;
        }

        await settings.save();

        res.status(200).json({
            success: true,
            message: 'Configuración del sistema actualizada exitosamente.',
            settings: {
                defaultTaxRate: settings.defaultTaxRate,
                welcomeMessage: settings.welcomeMessage,
                useInventoryModule: settings.useInventoryModule,
                useRecipeModule: settings.useRecipeModule,
            }
        });

    } catch (error) {
        console.error('[ADMIN ERROR] Update System Settings:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al actualizar la configuración del sistema.',
            systemError: process.env.NODE_ENV === 'development' ? error.message : null,
        });
    }
};