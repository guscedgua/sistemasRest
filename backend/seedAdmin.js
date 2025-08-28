lTables = await Table.countDocuments();
        const occupiedTables = await Table.countDocuments({ status: 'occupied' });

        res.json({ success: true, data: { occupied: occupiedTables, total: totalTables } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/products-count', auth, adminCheck, async (req, res) => {
    try {
        const productsCount = await Product.countDocuments({ active: true });
        res.json({ success: true, count: productsCount });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/orders-today', auth, adminCheck, async (req, res) => {
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

router.get('/sales-by-category', auth, adminCheck, async (req, res) => {
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

router.get('/pending-orders', auth, adminCheck, async (req, res) => {
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