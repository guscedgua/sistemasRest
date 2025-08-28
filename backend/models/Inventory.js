// Models/Inventory.js
import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  itemName: { type: String, required: true, unique: true },
  quantity: { type: Number, required: true, min: 0 },
  minStock: { type: Number, required: true, min: 0 },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' }, // <-- Este campo espera un ObjectId
  unit: {
    type: String,
    enum: ['kg', 'g', 'l', 'ml', 'unidades'],
    default: 'unidades'
  }
}, { timestamps: true });

export default mongoose.model('Inventory', inventorySchema);
