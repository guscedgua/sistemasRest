// backend/controllers/supplierController.js
import Supplier from '../models/Supplier.js';

// @desc    Obtener todos los proveedores
// @route   GET /api/suppliers
// @access  Private/Admin
export const getAllSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.find({}).select('-__v');
        res.status(200).json({ success: true, count: suppliers.length, suppliers });
    } catch (error) {
        console.error('[SUPPLIER ERROR] Get All Suppliers:', error);
        res.status(500).json({
            message: 'Error al obtener los proveedores',
            systemError: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};

// @desc    Obtener un proveedor por ID
// @route   GET /api/suppliers/:id
// @access  Private/Admin
export const getSupplierById = async (req, res) => {
    try {
        const supplier = await Supplier.findById(req.params.id).select('-__v');
        if (!supplier) {
            return res.status(404).json({ success: false, message: 'Proveedor no encontrado.' });
        }
        res.status(200).json({ success: true, supplier });
    } catch (error) {
        console.error('[SUPPLIER ERROR] Get Supplier by ID:', error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ success: false, message: 'ID de proveedor inválido.' });
        }
        res.status(500).json({
            message: 'Error al obtener el proveedor',
            systemError: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};

// @desc    Crear un nuevo proveedor
// @route   POST /api/suppliers
// @access  Private/Admin
export const createSupplier = async (req, res) => {
    try {
        const newSupplier = await Supplier.create(req.body);
        res.status(201).json({ success: true, message: 'Proveedor creado exitosamente.', supplier: newSupplier });
    } catch (error) {
        console.error('[SUPPLIER ERROR] Create Supplier:', error);
        if (error.code === 11000) { // Error de duplicado para campos 'unique'
            return res.status(400).json({ success: false, message: 'Ya existe un proveedor con este nombre o email.' });
        }
        if (error.name === 'ValidationError') {
            let errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ success: false, message: errors.join(', ') });
        }
        res.status(500).json({
            message: 'Error al crear el proveedor',
            systemError: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};

// @desc    Actualizar un proveedor
// @route   PUT /api/suppliers/:id
// @access  Private/Admin
export const updateSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).select('-__v');

        if (!supplier) {
            return res.status(404).json({ success: false, message: 'Proveedor no encontrado.' });
        }
        res.status(200).json({ success: true, message: 'Proveedor actualizado exitosamente.', supplier });
    } catch (error) {
        console.error('[SUPPLIER ERROR] Update Supplier:', error);
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Ya existe un proveedor con este nombre o email.' });
        }
        if (error.name === 'ValidationError') {
            let errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ success: false, message: errors.join(', ') });
        }
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ success: false, message: 'ID de proveedor inválido.' });
        }
        res.status(500).json({
            message: 'Error al actualizar el proveedor',
            systemError: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};

// @desc    Eliminar un proveedor
// @route   DELETE /api/suppliers/:id
// @access  Private/Admin
export const deleteSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findByIdAndDelete(req.params.id);

        if (!supplier) {
            return res.status(404).json({ success: false, message: 'Proveedor no encontrado.' });
        }
        // Consideración: ¿Qué pasa con los items de inventario que referencian a este proveedor?
        // Podrías: 1. Eliminar los items de inventario asociados.
        //          2. Establecer el 'supplier' a null en esos items.
        //          3. Impedir la eliminación si hay referencias.
        // Por ahora, solo lo eliminamos.
        res.status(200).json({ success: true, message: 'Proveedor eliminado correctamente.' });
    } catch (error) {
        console.error('[SUPPLIER ERROR] Delete Supplier:', error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ success: false, message: 'ID de proveedor inválido.' });
        }
        res.status(500).json({
            message: 'Error al eliminar el proveedor',
            systemError: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};