import Order from '../models/Order.js';



export const kitchenController = {

  // Obtener pedidos pendientes

  getPendingOrders: async (req, res) => {

    try {

      const orders = await Order.find({ status: 'pending' })

        .populate('products.productId')

        .sort({ createdAt: 1 });

      res.json(orders);

    } catch (error) {

      res.status(500).json({ message: 'Error en el servidor' });

    }

  },



  // Marcar pedido como listo

  markOrderReady: async (req, res) => {

    try {

      const order = await Order.findByIdAndUpdate(

        req.params.id,

        { status: 'ready' },

        { new: true }

      );

      res.json(order);

    } catch (error) {

      res.status(400).json({ message: 'Error al actualizar pedido' });

    }

  }

};