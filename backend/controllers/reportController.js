import Order from '../models/Order.js';
import Inventory from '../models/Inventory.js';

// ✅ Exportaciones nombradas correctas
export const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const report = await Order.aggregate([
      { 
        $match: { 
          createdAt: { 
            $gte: new Date(startDate), 
            $lte: new Date(endDate) 
          } 
        } 
      },
      { 
        $group: { 
          _id: null, 
          totalSales: { $sum: "$total" }, 
          averageTicket: { $avg: "$total" }, 
          count: { $sum: 1 } 
        } 
      }
    ]);
    res.json(report[0] || {});
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const getInventoryReport = async (req, res) => {
  try {
    const report = await Inventory.aggregate([
      { 
        $project: { 
          itemName: 1, 
          currentStock: "$quantity", 
          status: { 
            $cond: { 
              if: { $lt: ["$quantity", "$minStock"] }, 
              then: "Bajo Stock", 
              else: "OK" 
            } 
          } 
        } 
      }
    ]);
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
};