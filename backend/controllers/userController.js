// backend/controllers/userController.js
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid'; // Para el sessionId al crear/actualizar si no hay uno

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, status } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Nombre, email, contraseña y rol son requeridos.' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({ message: 'Ya existe un usuario con este email.' });
    }

    // Hash de la contraseña se maneja en el pre('save') hook del modelo User.js
    const sessionId = uuidv4(); // Genera un nuevo ID de sesión para el usuario creado

    const newUser = await User.create({
      name,
      email,
      password, // Mongoose lo hasheará
      role,
      status: status || 'active', // Estado por defecto 'active'
      sessionId,
    });

    if (newUser) {
      // No devolver password, refreshToken, sessionId ni __v
      res.status(201).json({
        success: true,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          status: newUser.status,
        },
        message: 'Usuario creado exitosamente por un administrador.',
      });
    } else {
      res.status(400).json({ message: 'Datos de usuario inválidos para la creación.' });
    }
  } catch (error) {
    console.error('[USER ERROR] Create User:', error);
    if (error.code === 11000) { // Error de clave duplicada (ej. email)
        return res.status(409).json({ message: 'El email ya está en uso por otro usuario.' });
    }
    res.status(500).json({
      message: 'Error al crear el usuario',
      systemError: process.env.NODE_ENV === 'development' ? error.message : null,
    });
  }
};
// @desc    Obtener todos los usuarios
// @route   GET /api/users
// @access  Admin
export const getUsers = async (req, res) => {
  try {
    // Excluye campos sensibles y el __v de Mongoose
    const users = await User.find({}).select('-password -refreshToken -sessionId -loginAttempts -lockUntil -__v');
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    console.error('[USER ERROR] Get Users:', error);
    res.status(500).json({
      message: 'Error al obtener usuarios',
      systemError: process.env.NODE_ENV === 'development' ? error.message : null,
    });
  }
};

// @desc    Obtener un usuario por ID
// @route   GET /api/users/:id
// @access  Admin (o el propio usuario si se quiere permitir)
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -refreshToken -sessionId -loginAttempts -lockUntil -__v');

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('[USER ERROR] Get User by ID:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'ID de usuario inválido.' });
    }
    res.status(500).json({
      message: 'Error al obtener el usuario',
      systemError: process.env.NODE_ENV === 'development' ? error.message : null,
    });
  }
};

// @desc    Actualizar un usuario (puede ser admin para cualquier usuario o el propio usuario para sí mismo)
// @route   PUT /api/users/:id
// @access  Admin (o el propio usuario)
export const updateUser = async (req, res) => {
  try {
    const { name, email, password, role, status, avatar } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // Restricción: un usuario no-admin no puede cambiar su propio rol o status.
    if (req.user.role !== 'admin') {
      if (role && role !== user.role) {
        return res.status(403).json({ message: 'No tienes permiso para cambiar tu rol.' });
      }
      if (status && status !== user.status) {
        return res.status(403).json({ message: 'No tienes permiso para cambiar tu estado.' });
      }
    }

    // Si el email se cambia, verificar que no haya duplicados
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== req.params.id) {
        return res.status(409).json({ message: 'Ya existe un usuario con este email.' });
      }
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.avatar = avatar || user.avatar;
    user.role = role || user.role; // Solo admin puede cambiar el rol
    user.status = status || user.status; // Solo admin puede cambiar el estado

    // Si la contraseña se proporciona, se hashea con el pre('save') hook
    if (password) {
      user.password = password; // El middleware pre('save') del modelo User se encargará del hash
      user.sessionId = uuidv4(); // Invalida sesiones anteriores al cambiar contraseña
    }

    const updatedUser = await user.save(); // save() activará el middleware pre('save') para la contraseña

    res.status(200).json({
      success: true,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status,
        avatar: updatedUser.avatar,
      },
    });
  } catch (error) {
    console.error('[USER ERROR] Update User:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'ID de usuario inválido.' });
    }
    if (error.code === 11000) {
      return res.status(409).json({ message: 'El email ya está en uso por otro usuario.' });
    }
    res.status(500).json({
      message: 'Error al actualizar el usuario',
      systemError: process.env.NODE_ENV === 'development' ? error.message : null,
    });
  }
};

// @desc    Eliminar un usuario
// @route   DELETE /api/users/:id
// @access  Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // No permitir que un admin se elimine a sí mismo si es el único admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount === 1) {
        return res.status(403).json({ message: 'No puedes eliminar al último administrador del sistema.' });
      }
    }

    // Usar deleteOne() en lugar de findByIdAndDelete() si tienes hooks pre('deleteOne')
    await user.deleteOne(); // Esto disparará el pre('deleteOne') hook en el modelo

    res.status(200).json({ success: true, message: 'Usuario eliminado exitosamente.' });
  } catch (error) {
    console.error('[USER ERROR] Delete User:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'ID de usuario inválido.' });
    }
    res.status(500).json({
      message: 'Error al eliminar el usuario',
      systemError: process.env.NODE_ENV === 'development' ? error.message : null,
    });
  }
};