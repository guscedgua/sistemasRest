import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema({
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  items: [{
    inventoryItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory' },
    quantity: Number,
    unitPrice: Number
  }],
  total: Number,
  purchaseDate: { type: Date, default: Date.now }
});
export default mongoose.model('Purchase', purchaseSchema);