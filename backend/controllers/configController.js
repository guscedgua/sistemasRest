import RestaurantConfig from '../models/RestaurantConfig.js';

export const configController = {
  // Actualizar configuración
  updateConfig: async (req, res) => {
    try {
      const config = await RestaurantConfig.findOneAndUpdate(
        {},
        req.body,
        { new: true, upsert: true }
      );
      res.json(config);
    } catch (error) {
      res.status(400).json({ message: 'Error al actualizar configuración' });
    }
  },

  // Obtener configuración actual
  getConfig: async (req, res) => {
    try {
      const config = await RestaurantConfig.findOne();
      res.json(config || {});
    } catch (error) {
      res.status(500).json({ message: 'Error en el servidor' });
    }
  }
};