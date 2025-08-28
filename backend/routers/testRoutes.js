import express from 'express';
import admin from '../config/firebase.js';

const router = express.Router();

// Ruta para probar la verificación de tokens
router.post('/test-token', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token no proporcionado'
      });
    }
    
    console.log('Probando token:', token.substring(0, 50) + '...');
    
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    res.status(200).json({
      success: true,
      decodedToken
    });
  } catch (error) {
    console.error('Error verificando token:', error);
    res.status(401).json({
      success: false,
      message: 'Token inválido',
      error: error.message
    });
  }
});

// Ruta para verificar la configuración de Firebase Admin
router.get('/check-config', async (req, res) => {
  try {
    // Intentar listar usuarios para verificar la configuración
    const listUsersResult = await admin.auth().listUsers(1);
    
    res.status(200).json({
      success: true,
      message: 'Firebase Admin configurado correctamente',
      usersCount: listUsersResult.users.length
    });
  } catch (error) {
    console.error('Error verificando configuración de Firebase Admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error en la configuración de Firebase Admin',
      error: error.message
    });
  }
});

export default router;