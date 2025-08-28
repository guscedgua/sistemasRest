// Archivo: backend/controllers/tableController.js
// Controladores para la gestión de mesas.
import Table from '../models/Table.js';
import Order from '../models/Order.js'; // Para manejar la desvinculación de órdenes

// @desc    Crear una nueva mesa
// @route   POST /api/tables
// @access  Private (administrador, supervisor)
export const createTable = async (req, res) => {
  // Asegúrate de extraer los campos tal cual están definidos en el modelo de Table
  // Ahora el modelo espera 'tableNumber' y 'capacity'
  const { tableNumber, capacity, status, location } = req.body;

  try {
    // Validaciones básicas antes de intentar guardar en la DB, aunque Mongoose también valida.
    // ESTA ES LA LÍNEA QUE CAUSA TU ERROR SI tableNumber NO ESTÁ PRESENTE O ES VACÍO
    if (!tableNumber) {
      return res.status(400).json({ success: false, message: 'El número de mesa es requerido.' });
    }
    if (capacity === undefined || capacity === null) { // Importante verificar que capacity no sea undefined o null
      return res.status(400).json({ success: false, message: 'La capacidad de la mesa es requerida.' });
    }
    if (typeof capacity !== 'number' || capacity < 1) {
        return res.status(400).json({ success: false, message: 'La capacidad debe ser un número válido y al menos 1.' });
    }

    // Verificar si ya existe una mesa con el mismo número
    const existingTable = await Table.findOne({ tableNumber: { $regex: new RegExp(`^${tableNumber}$`, 'i') } });
    if (existingTable) {
      return res.status(409).json({ success: false, message: 'Ya existe una mesa con este número.' });
    }

    const newTable = new Table({
      tableNumber, // Usa tableNumber aquí
      capacity,
      status: status, // Pasa el status si se proporciona, de lo contrario usará el default del modelo
      location: location // Pasa la location si se proporciona
    });

    const savedTable = await newTable.save();
    res.status(201).json({
      success: true,
      message: 'Mesa creada exitosamente.',
      table: savedTable
    });
  } catch (error) {
    console.error('Error al crear mesa:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al crear la mesa.',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

// @desc    Obtener todas las mesas
// @route   GET /api/tables
// @access  Public (cualquier rol que necesite ver mesas, como mesero, administrador)
export const getAllTables = async (req, res) => {
  try {
    const tables = await Table.find({}).populate('currentOrderId'); // Popula la orden actual si existe
    res.status(200).json({
      success: true,
      count: tables.length,
      tables
    });
  } catch (error) {
    console.error('Error al obtener mesas:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor al obtener las mesas.' });
  }
};

// @desc    Obtener una mesa por ID
// @route   GET /api/tables/:id
// @access  Public
export const getTableById = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id).populate('currentOrderId');
    if (!table) {
      return res.status(404).json({ success: false, message: 'Mesa no encontrada.' });
    }
    res.status(200).json({ success: true, table });
  } catch (error) {
    console.error('Error al obtener mesa por ID:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID de mesa inválido.' });
    }
    res.status(500).json({ success: false, message: 'Error interno del servidor al obtener la mesa.' });
  }
};

// @desc    Actualizar una mesa
// @route   PUT /api/tables/:id
// @access  Private (administrador, supervisor)
export const updateTable = async (req, res) => {
  const { tableNumber, capacity, status, currentOrderId, location } = req.body;

  try {
    let table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ success: false, message: 'Mesa no encontrada.' });
    }

    // Verificar si el nuevo número de mesa ya existe en otra mesa (excepto la actual)
    if (tableNumber && tableNumber.toLowerCase() !== table.tableNumber.toLowerCase()) {
      const existingTable = await Table.findOne({
        tableNumber: { $regex: new RegExp(`^${tableNumber}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      if (existingTable) {
        return res.status(409).json({ success: false, message: 'Ya existe otra mesa con este número.' });
      }
    }

    // Validar el currentOrderId si se proporciona
    if (currentOrderId !== undefined) {
        if (currentOrderId === null || currentOrderId === '') { // Para desvincular una orden
            table.currentOrderId = undefined;
        } else { // Si se proporciona un ID de orden
            const orderExists = await Order.findById(currentOrderId);
            if (!orderExists) {
                return res.status(400).json({ success: false, message: 'El ID de orden proporcionado no existe.' });
            }
            table.currentOrderId = currentOrderId;
        }
    }

    table.tableNumber = tableNumber || table.tableNumber;
    table.capacity = capacity !== undefined ? capacity : table.capacity;
    table.status = status || table.status;
    table.location = location !== undefined ? location : table.location; // Actualiza la ubicación

    const updatedTable = await table.save();
    res.status(200).json({
      success: true,
      message: 'Mesa actualizada exitosamente.',
      table: updatedTable
    });
  } catch (error) {
    console.error('Error al actualizar mesa:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID de mesa o ID de orden inválido.' });
    }
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al actualizar la mesa.',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

// @desc    Eliminar una mesa
// @route   DELETE /api/tables/:id
// @access  Private (administrador)
export const deleteTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ success: false, message: 'Mesa no encontrada.' });
    }

    // Verificar si la mesa tiene una orden activa
    if (table.currentOrderId) {
      return res.status(400).json({ success: false, message: 'No se puede eliminar la mesa porque tiene una orden activa asociada.' });
    }

    await table.deleteOne();

    res.status(200).json({ success: true, message: 'Mesa eliminada exitosamente.' });
  } catch (error) {
    console.error('Error al eliminar mesa:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID de mesa inválido.' });
    }
    res.status(500).json({ success: false, message: 'Error interno del servidor al eliminar la mesa.' });
  }
};


// @desc    Cambiar el estado de una mesa
// @route   PATCH /api/tables/:id/status
// @access  Private (administrador, mesero, supervisor)
export const updateTableStatus = async (req, res) => {
  const { status } = req.body;

  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ success: false, message: 'Mesa no encontrada.' });
    }

    // Validar el nuevo estado
    const validStatuses = ['available', 'occupied', 'reserved', 'inactive', 'needs cleaning'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Estado inválido. Los estados permitidos son: ${validStatuses.join(', ')}.` });
    }

    // Lógica para desvincular currentOrderId si la mesa pasa a "available"
    if (status === 'available' && table.currentOrderId) {
      // Opcional: Podrías verificar el estado de la orden antes de desvincular
      // Si la orden aún no está completada, podrías requerir una confirmación o moverla a un estado "cancelado"
      table.currentOrderId = undefined; // Desvincula la orden
    } else if (status !== 'available' && !table.currentOrderId) {
        // Si la mesa no está disponible y no tiene una orden, no debe haber currentOrderId
        table.currentOrderId = undefined;
    }


    table.status = status;
    const updatedTable = await table.save();

    res.status(200).json({
      success: true,
      message: `Estado de la mesa ${table.tableNumber} actualizado a '${status}' exitosamente.`,
      table: updatedTable
    });
  } catch (error) {
    console.error('Error al actualizar estado de mesa:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID de mesa inválido.' });
    }
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al actualizar el estado de la mesa.',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};
