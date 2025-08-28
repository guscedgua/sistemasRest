// Archivo: backend/models/Order.js
// Modelo para órdenes de clientes.
import mongoose from 'mongoose';

const orderSchema = mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
  },
  takenBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      priceAtOrder: { // Precio del producto al momento de la orden
        type: Number,
        required: true,
        min: 0
      },
      notes: { // Notas o modificadores para el ítem
        type: String
      }
    },
  ],
  status: {
    type: String,
    enum: ['pending', 'ready', 'served', 'completed', 'cancelled'],
    default: 'pending',
  },
  table: { // Referencia a la mesa (si aplica)
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    required: false // Opcional para pedidos a domicilio
  },
  orderType: { // Dine-in, Takeaway, Delivery
    type: String,
    enum: ['dine-in', 'takeaway', 'delivery'], // <--- ¡ASEGÚRATE DE QUE ESTO COINCIDA!
    default: 'dine-in',
    required: true
  },
  customerName: {
    type: String,
    required: function() { return this.orderType === 'delivery' || this.orderType === 'takeaway'; }
  },
  customerPhone: {
    type: String,
    required: function() { return this.orderType === 'delivery' || this.orderType === 'takeaway'; }
  },
  customerAddress: {
    type: String,
    required: function() { return this.orderType === 'delivery'; }
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'transfer', 'other'],
    required: false // Puede ser nulo hasta que se complete el pago
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paid: {
    type: Boolean,
    default: false
  },
  paidAt: {
    type: Date
  }
}, {
  timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);

export default Order;