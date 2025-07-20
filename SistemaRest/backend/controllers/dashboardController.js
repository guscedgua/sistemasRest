// backend/controllers/dashboardController.js
// Controladores para obtener los datos de resumen del dashboard.

import Order from '../models/Order.js'; // Importa el modelo de Órdenes
import Table from '../models/Table.js'; // Importa el modelo de Mesas
import User from '../models/User.js'; // Asegúrate de importar el modelo de Usuario si lo usas para métricas

/**
 * @desc    Obtener el resumen de órdenes realizadas hoy
 * @access  Private (admin, supervisor, mesero, cocinero)
 * @returns {object} { success: boolean, data: { value: number } }
 */
export const getOrdersTodaySummary = async () => {
    try {
        // Establece el inicio y el fin del día actual en la zona horaria del servidor
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0); // Establece la hora a 00:00:00.000

        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999); // Establece la hora a 23:59:59.999

        // Cuenta el número de documentos (órdenes) creados entre el inicio y el fin del día
        const ordersCount = await Order.countDocuments({
            createdAt: { $gte: startOfToday, $lte: endOfToday }
        });

        // Devuelve los datos en el formato esperado por el frontend
        return { success: true, data: { value: ordersCount } };
    } catch (error) {
        console.error('Error al obtener órdenes de hoy (Dashboard):', error);
        throw new Error('Error interno del servidor al obtener el resumen de órdenes de hoy.');
    }
};

/**
 * @desc    Obtener el resumen de ventas totales
 * @access  Private (admin, supervisor, mesero)
 * @returns {object} { success: boolean, data: { value: number } }
 */
export const getTotalSalesSummary = async () => {
    try {
        // Agrega órdenes para sumar el campo 'totalAmount'.
        const result = await Order.aggregate([
            {
                // Solo considera órdenes que han sido 'pagada' para el total de ventas
                $match: { status: 'pagada' }
            },
            {
                // Agrupa todos los documentos restantes y suma sus 'totalAmount'
                $group: {
                    _id: null, // 'null' agrupa todos los documentos en un solo grupo
                    totalAmount: { $sum: '$totalAmount' } // Suma el campo 'totalAmount'
                }
            }
        ]);

        // Si hay resultados, toma el totalAmount del primer grupo; de lo contrario, 0
        const totalSalesAmount = result.length > 0 ? result[0].totalAmount : 0;

        // Devuelve los datos en el formato esperado por el frontend
        return { success: true, data: { value: totalSalesAmount } };
    } catch (error) {
        console.error('Error al obtener ventas totales (Dashboard):', error);
        throw new Error('Error interno del servidor al obtener el resumen de ventas totales.');
    }
};

/**
 * @desc    Obtener el resumen del estado de las mesas (ocupadas vs. total)
 * @access  Private (admin, supervisor, mesero)
 * @returns {object} { success: boolean, data: { occupied: number, total: number } }
 */
export const getTablesStatusSummary = async () => {
    try {
        // Cuenta el total de mesas registradas
        const totalTables = await Table.countDocuments();
        
        // Cuenta el número de mesas que están en estado 'occupied'
        const occupiedTablesCount = await Table.countDocuments({ status: 'occupied' });

        // Responde con el conteo de mesas ocupadas y el total
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
 * @desc    Controlador principal para obtener métricas del dashboard
 * @route   GET /api/dashboard?metric=<metricName>
 * @access  Private (admin, supervisor, mesero, cocinero)
 */
export const getDashboardMetrics = async (req, res) => {
    const { metric } = req.query;
    console.log(`DEBUG Dashboard Controller: Métrica solicitada: ${metric}`); // Nuevo log de depuración

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
            default:
                console.log(`DEBUG Dashboard Controller: Métrica no reconocida: ${metric}`);
                return res.status(404).json({ success: false, message: 'Métrica de dashboard no reconocida.' });
        }
        
        // Las funciones de resumen ya devuelven { success: true, data: ... }
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