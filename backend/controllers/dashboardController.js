// backend/controllers/dashboardController.js
// Controladores para obtener los datos de resumen del dashboard.

import Order from '../models/Order.js';
import Table from '../models/Table.js';
import User from '../models/User.js';

/**
 * @desc    Obtener el resumen de órdenes realizadas hoy
 * @access  Private (admin, supervisor, mesero, cocinero)
 * @returns {object} { success: boolean, data: { value: number } }
 */
export const getOrdersTodaySummary = async () => {
    try {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        const ordersCount = await Order.countDocuments({
            createdAt: { $gte: startOfToday, $lte: endOfToday }
        });

        return { success: true, data: { value: ordersCount } };
    } catch (error) {
        console.error('Error al obtener órdenes de hoy (Dashboard):', error);
        throw new Error('Error interno del servidor al obtener el resumen de órdenes de hoy.');
    }
};

/**
 * @desc    Obtener el resumen de ventas totales
 * @access  Private (admin, supervisor, mesero)
 * @returns {object} { success: boolean, data: { value: number } }
 */
export const getTotalSalesSummary = async () => {
    try {
        const result = await Order.aggregate([
            {
                $match: { status: 'pagada' }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$totalAmount' }
                }
            }
        ]);

        const totalSalesAmount = result.length > 0 ? result[0].totalAmount : 0;
        return { success: true, data: { value: totalSalesAmount } };
    } catch (error) {
        console.error('Error al obtener ventas totales (Dashboard):', error);
        throw new Error('Error interno del servidor al obtener el resumen de ventas totales.');
    }
};

/**
 * @desc    Obtener el resumen del estado de las mesas (ocupadas vs. total)
 * @access  Private (admin, supervisor, mesero)
 * @returns {object} { success: boolean, data: { occupied: number, total: number } }
 */
export const getTablesStatusSummary = async () => {
    try {
        const totalTables = await Table.countDocuments();
        const occupiedTablesCount = await Table.countDocuments({ status: 'occupied' });

        return {
            success: true,
            data: {
                occupied: occupiedTablesCount,
                total: totalTables
            }
        };
    } catch (error) {
        console.error('Error al obtener estado de mesas (Dashboard):', error);
        throw new Error('Error interno del servidor al obtener el resumen del estado de las mesas.');
    }
};

/**
 * @desc    Obtener el ingreso total por producto
 * @access  Private (admin, supervisor)
 * @returns {object} { success: boolean, data: array }
 */
export const getRevenueByProduct = async () => {
    try {
        const result = await Order.aggregate([
            {
                $match: { status: 'pagada' }
            },
            {
                $unwind: '$items'
            },
            {
                $group: {
                    _id: '$items.productName',
                    totalRevenue: { $sum: '$items.price' },
                    totalQuantitySold: { $sum: 1 }
                }
            },
            {
                $sort: { totalRevenue: -1 }
            }
        ]);

        return { success: true, data: result };
    } catch (error) {
        console.error('Error al obtener ingresos por producto (Dashboard):', error);
        throw new Error('Error interno del servidor al obtener ingresos por producto.');
    }
};

/**
 * @desc    Obtener datos de ventas de los últimos 7 días para un gráfico
 * @access  Private (admin, supervisor)
 * @returns {object} { success: boolean, data: array }
 */
export const getSalesData = async () => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);

        const result = await Order.aggregate([
            {
                $match: {
                    status: 'pagada',
                    createdAt: { $gte: sevenDaysAgo, $lte: today }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    totalSales: { $sum: '$totalAmount' }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        return { success: true, data: result };
    } catch (error) {
        console.error('Error al obtener datos de ventas (Dashboard):', error);
        throw new Error('Error interno del servidor al obtener datos de ventas.');
    }
};

/**
 * @desc    Controlador principal para obtener métricas del dashboard
 * @route   GET /api/dashboard/metrics
 * @access  Private (admin, supervisor, mesero, cocinero)
 */
export const getDashboardMetrics = async (req, res) => {
    const { metric } = req.query;
    console.log(`DEBUG Dashboard Controller: Métrica solicitada: ${metric}`);

    if (!metric) {
        console.log('DEBUG Dashboard Controller: Parámetro "metric" faltante.');
        return res.status(400).json({ success: false, message: 'El parámetro "metric" es requerido.' });
    }

    try {
        let result;
        switch (metric) {
            case 'ordersToday':
                result = await getOrdersTodaySummary();
                break;
            case 'totalSales':
                result = await getTotalSalesSummary();
                break;
            case 'tablesStatus':
                result = await getTablesStatusSummary();
                break;
            case 'revenueByProduct':
                result = await getRevenueByProduct();
                break;
            case 'salesData':
                result = await getSalesData();
                break;
            default:
                console.log(`DEBUG Dashboard Controller: Métrica no reconocida: ${metric}`);
                return res.status(404).json({ success: false, message: 'Métrica de dashboard no reconocida.' });
        }

        res.status(200).json(result);
        console.log(`DEBUG Dashboard Controller: Datos para métrica ${metric} enviados.`);

    } catch (error) {
        console.error(`Error en getDashboardMetrics para métrica ${metric}:`, error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error interno del servidor al obtener la métrica del dashboard.',
        });
    }
};
