// Archivo: backend/models/User.js
import mongoose from 'mongoose';

const userSchema = mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ['admin', 'cocinero', 'cliente'],
    default: 'mesero', // Cambiado a 'mesero' como rol por defecto
  },
  sessionId: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true,
});

export default mongoose.model('User', userSchema);
