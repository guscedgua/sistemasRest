// backend/routers/dashboardRoutes.js
import express from 'express';
import Order from '../models/Order.js';
import Table from '../models/Table.js';
import Product from '../models/Product.js';
import { auth, adminCheck } from '../middleware/auth.js';
import {
  
    getRevenueByProduct,
    getSalesData,
} from '../controllers/dashboardController.js';

import {
    getAdminDashboardMetrics,

} from '../controllers/adminController.js';



const router = express.Router();

// Aplica los middlewares de autenticación y rol a todas las rutas de este router
// Esto asegura que cada ruta en /api/dashboard/* requerirá un token de admin válido.
router.use(auth, adminCheck);

// Ahora las rutas no necesitan el middleware porque ya se aplicó globalmente
router.get('/dashboard', getAdminDashboardMetrics);
router.get('/revenue-by-product', getRevenueByProduct);
router.get('/sales-data', getSalesData);

// Endpoints para las métricas del dashboard
router.get('/total-sales', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const result = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: today },
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalAmount' }
                }
            }
        ]);

        const totalSales = result.length > 0 ? result[0].total : 0;
        res.json({ success: true, value: totalSales });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/tables-status', async (req, res) => {
    try {
        const totalTables = await Table.countDocuments();
        const occupiedTables = await Table.countDocuments({ status: 'occupied' });

        res.json({ success: true, data: { occupied: occupiedTables, total: totalTables } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/products-count', async (req, res) => {
    try {
        const productsCount = await Product.countDocuments({ active: true });
        res.json({ success: true, count: productsCount });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/orders-today', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const ordersCount = await Order.countDocuments({
            createdAt: { $gte: today }
        });

        res.json({ success: true, value: ordersCount });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/sales-by-category', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const salesByCategory = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: today },
                    status: 'completed',
                    paid: true
                }
            },
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.product',
                    foreignField: '_id',
                    as: 'productInfo'
                }
            },
            { $unwind: '$productInfo' },
            {
                $group: {
                    _id: '$productInfo.category',
                    totalSales: { $sum: { $multiply: ['$items.quantity', '$items.priceAtOrder'] } },
                    count: { $sum: '$items.quantity' }
                }
            },
            { $sort: { totalSales: -1 } }
        ]);

        res.json({ success: true, data: salesByCategory });
    } catch (error) {
        console.error('Error en sales-by-category:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/pending-orders', async (req, res) => {
    try {
        const pendingOrders = await Order.countDocuments({ 
            status: { $in: ['pending', 'ready'] } 
        });

        res.json({ success: true, count: pendingOrders });
    } catch (error) {
        console.error('Error en pending-orders:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;