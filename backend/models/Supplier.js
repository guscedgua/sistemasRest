import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del proveedor es requerido'],
    unique: true
  },
  contact: {
    email: {
      type: String,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
    },
    phone: {
      type: String,
      validate: {
        validator: function(v) {
          return /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{9,}$/.test(v);
        },
        message: props => `${props.value} no es un número de teléfono válido!`
      }
    }
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  suppliedItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory'
  }],
  paymentTerms: {
    type: String,
    enum: ['contado', '15 días', '30 días']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índice para búsqueda rápida
supplierSchema.index({ name: 'text', 'contact.email': 'text' });

export default mongoose.model('Supplier', supplierSchema);