// Archivo: backend/models/Table.js
// Modelo para las mesas del restaurante.
import mongoose from 'mongoose';

const tableSchema = mongoose.Schema({
  // Campo para el número/nombre de la mesa
  tableNumber: {
    type: String,
    required: true,
    unique: true, // Asegura que cada mesa tenga un número único
    trim: true    // Elimina espacios en blanco al inicio y final
  },
  // Campo para la capacidad de la mesa (número de personas)
  capacity: {
    type: Number,
    required: true,
    min: 1 // La capacidad mínima debe ser 1
  },
  // Campo para el estado actual de la mesa
  status: {
    type: String,
    // Valores permitidos para el estado de la mesa (enum)
    // Asegúrate de que los valores que envías desde el cliente coincidan exactamente con estos
    enum: ['available', 'occupied', 'cleaning', 'reserved', 'inactive'],
    default: 'available' // Estado por defecto al crear una mesa
  },
  // Referencia a la orden actual si la mesa está ocupada
  currentOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: false // No es requerido, ya que una mesa puede no tener una orden
  },
  // Campo opcional para la ubicación física de la mesa (ej. "terraza", "salón principal")
  location: {
    type: String,
    trim: true,
    required: false
  }
}, {
  timestamps: true, // Añade campos createdAt y updatedAt automáticamente
});

const Table = mongoose.model('Table', tableSchema);

export default Table;
