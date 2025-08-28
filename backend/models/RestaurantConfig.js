import mongoose from 'mongoose';

const configSchema = new mongoose.Schema({
    restaurantName: { type: String, default: 'Mi Restaurante' },
    currency: { type: String, default: 'USD' },
    taxRate: { type: Number, default: 0.12 },
    serviceFee: { type: Number, default: 0.10 },
    openingHours: {
      monday: { open: String, close: String },
      // ... otros días
    }
  });
  export default mongoose.model('RestaurantConfig', configSchema);