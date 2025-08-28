// backend/routers/healthRoutes.js
import express from 'express';
const router = express.Router();

// Endpoint de salud para verificar conexión
router.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

export default router;