// Archivo: backend/controllers/orderController.js
// Lógica para la creación y gestión de órdenes.
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Recipe from '../models/Recipe.js';
import Table from '../models/Table.js';
import Inventory from '../models/Inventory.js';
import Setting from '../models/Setting.js';
import { ROLES } from '../config/roles.js';

// @desc    Crear una nueva orden
// @route   POST /api/orders
// @access  Private (mesero, administrador)
export const createOrder = async (req, res) => {
  const {
    orderNumber,
    takenBy,
    items, // [{ product: productId, quantity: N, notes: '' }]
    table, // ID de la mesa (opcional para takeaway/delivery)
    orderType,
    customerName,
    customerPhone,
    customerAddress,
    paymentMethod,
    totalAmount // Asegúrate de que el frontend envíe esto o se calcule aquí
  } = req.body;

  // Eliminamos el inicio de la sesión de transacción para evitar el error de replica set
  // const session = await mongoose.startSession();
  // session.startTransaction();

  try {
    console.log('--- Iniciando createOrder ---'); // LOG 1
    console.log('Req Body:', req.body); // LOG 2

    console.log('Obteniendo configuración...'); // LOG 3
    const settings = await Setting.getSettings(); // Obtener la configuración global
    console.log('Configuración obtenida:', settings); // LOG 4

    // 1. Verificación del número de orden único
    console.log('Verificando número de orden único...'); // LOG 5
    const existingOrder = await Order.findOne({ orderNumber }); // Ya no pasamos la sesión
    if (existingOrder) {
      // await session.abortTransaction();
      // session.endSession();
      console.log('Error: Número de orden ya existe.'); // LOG 6
      return res.status(409).json({ success: false, message: 'El número de orden ya existe.' });
    }
    console.log('Número de orden único.'); // LOG 7

    // 2. Verificación del empleado que toma la orden
    console.log('Verificando empleado...'); // LOG 8
    const employee = await User.findById(takenBy); // Ya no pasamos la sesión
    if (!employee || ![ROLES.MESERO, ROLES.ADMIN, ROLES.SUPERVISOR].includes(employee.role)) {
      // await session.abortTransaction();
      // session.endSession();
      console.log('Error: Empleado inválido o sin permisos.'); // LOG 9
      return res.status(400).json({ success: false, message: 'El empleado que toma la orden es inválido o no tiene permisos.' });
    }
    console.log('Empleado verificado:', employee.name); // LOG 10


    // 3. Preparar ítems para la orden y verificar productos/recetas/inventario
    const orderItems = [];
    let calculatedTotal = 0;

    console.log('Procesando ítems de la orden...'); // LOG 11
    for (const item of items) {
      console.log(`Buscando producto con ID: ${item.product}`); // LOG 12
      const product = await Product.findById(item.product); // Ya no pasamos la sesión

      if (!product) {
        // await session.abortTransaction();
        // session.endSession();
        console.log(`Error: Producto con ID ${item.product} no existe.`); // LOG 13
        return res.status(400).json({ success: false, message: `El producto con ID ${item.product} no existe.` });
      }
      if (!product.isAvailable) {
        // await session.abortTransaction();
        // session.endSession();
        console.log(`Error: Producto '${product.name}' no disponible.`); // LOG 14
        return res.status(400).json({ success: false, message: `El producto '${product.name}' no está disponible.` });
      }
      console.log(`Producto encontrado: ${product.name}`); // LOG 15


      // Cálculo del subtotal para este ítem
      const itemSubtotal = product.price * item.quantity;
      calculatedTotal += itemSubtotal;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        priceAtOrder: product.price, // Guardar el precio actual del producto
        notes: item.notes // Añadir notas del ítem
      });

      // Lógica de descuento de inventario si el módulo está activo y el producto tiene receta
      if (settings.useInventoryModule && settings.useRecipeModule && product.recipe) {
        console.log(`Módulo de recetas activo para ${product.name}`); // LOG 16
        const associatedRecipe = await Recipe.findById(product.recipe); // Ya no pasamos la sesión

        if (!associatedRecipe) {
          // await session.abortTransaction();
          // session.endSession();
          console.log(`Error: Receta asociada a '${product.name}' no existe.`); // LOG 17
          return res.status(400).json({ success: false, message: `La receta asociada al producto '${product.name}' no existe.` });
        }
        console.log(`Receta encontrada para ${product.name}.`); // LOG 20

        console.log(`Módulo de inventario activo para ${product.name}. Deduciendo ingredientes...`); // LOG 21
        // Por cada ingrediente en la receta, descontar del inventario
        for (const recipeIngredient of associatedRecipe.ingredients) {
          console.log(`Buscando ingrediente en inventario con ID: ${recipeIngredient.ingredient}`); // LOG 22
          const inventoryItem = await Inventory.findById(recipeIngredient.ingredient); // Ya no pasamos la sesión

          if (!inventoryItem) {
            // await session.abortTransaction();
            // session.endSession();
            console.log(`Error: Ingrediente ${recipeIngredient.ingredient} no encontrado en inventario.`); // LOG 23
            return res.status(400).json({ success: false, message: `Ingrediente '${recipeIngredient.ingredient}' de la receta de '${product.name}' no encontrado en inventario.` });
          }

          const requiredQuantity = recipeIngredient.quantity * item.quantity; // Cantidad total necesaria para esta orden

          if (inventoryItem.quantity < requiredQuantity) {
            // await session.abortTransaction();
            // session.endSession();
            console.log(`Error: Stock insuficiente de ${inventoryItem.name}.`); // LOG 24
            return res.status(400).json({ success: false, message: `No hay suficiente '${inventoryItem.name}' en inventario para '${product.name}'. Stock actual: ${inventoryItem.quantity}${inventoryItem.unit}. Necesario: ${requiredQuantity}${inventoryItem.unit}.` });
          }

          inventoryItem.quantity -= requiredQuantity;
          await inventoryItem.save(); // Ya no pasamos la sesión
          console.log(`Inventario de ${inventoryItem.name} actualizado.`); // LOG 25
        }
      } else {
        console.log('Módulo de recetas inactivo. Verificando stock directo del producto...'); // LOG 27
        // Lógica para productos sin receta que manejan stock directo
        if (product.stock !== undefined && product.stock !== null && product.stockType === 'direct') {
          if (product.stock < item.quantity) {
            console.log(`Error: Stock insuficiente de ${product.name} (directo).`); // LOG 28
            return res.status(400).json({ success: false, message: `Stock insuficiente de '${product.name}'. Disponible: ${product.stock}, Solicitado: ${item.quantity}.` });
          }
          product.stock -= item.quantity;
          await product.save();
          console.log(`Stock directo de ${product.name} actualizado.`); // LOG 29
        } else {
          console.log(`Producto ${product.name} no usa stock directo.`); // LOG 30
        }
      }
      console.log(`Ítem ${product.name} procesado.`); // LOG 31
    }
    console.log('Todos los ítems procesados. Total calculado:', calculatedTotal); // LOG 32

    // 4. Validar totalAmount si viene del frontend (opcional pero recomendado)
    if (totalAmount !== undefined && Math.abs(totalAmount - calculatedTotal) > 0.01) { // Pequeña tolerancia para flotantes
      // await session.abortTransaction();
      // session.endSession();
      console.warn(`[WARNING] Cliente envió totalAmount=${totalAmount}, calculado=${calculatedTotal}. Usando el calculado.`);
      // return res.status(400).json({ success: false, message: `El monto total proporcionado (${totalAmount}) no coincide con el calculado (${calculatedTotal}).` });
    }
    console.log('Total final de la orden:', calculatedTotal); // LOG 33


    // 5. Gestión del estado de la mesa (si es dine-in)
    let tableId = null;
    if (orderType === 'dine-in' && table) {
      console.log(`Buscando mesa con ID: ${table}`); // LOG 35
      const tableDoc = await Table.findById(table); // Ya no pasamos la sesión
      if (!tableDoc) {
        // await session.abortTransaction();
        // session.endSession();
        console.log('Error: Mesa seleccionada no encontrada.'); // LOG 36
        return res.status(400).json({ success: false, message: 'Mesa no encontrada.' });
      }
      if (tableDoc.status !== 'available') {
        // await session.abortTransaction();
        // session.endSession();
        console.log(`Error: Mesa ${tableDoc.tableNumber} no disponible.`); // LOG 37
        return res.status(400).json({ success: false, message: `La mesa ${tableDoc.tableNumber} no está disponible (estado: ${tableDoc.status}).` });
      }
      tableDoc.status = 'occupied';
      // tableDoc.currentOrderId se establecerá después de crear la orden
      await tableDoc.save(); // Ya no pasamos la sesión
      tableId = tableDoc._id;
      console.log(`Mesa ${tableDoc.tableNumber} seleccionada.`); // LOG 38
    } else if (orderType === 'dine-in' && !table) {
      // await session.abortTransaction();
      // session.endSession();
      return res.status(400).json({ success: false, message: 'Para pedidos "dine-in", se requiere un ID de mesa.' });
    }

    // 6. Crear la orden
    console.log('Preparando nueva instancia de orden...'); // LOG 34 (reubicado para mejor flujo de logs)
    const newOrder = new Order({
      orderNumber,
      takenBy,
      items: orderItems,
      table: tableId,
      orderType,
      customerName: orderType !== 'dine-in' ? customerName : undefined,
      customerPhone: orderType !== 'dine-in' ? customerPhone : undefined,
      customerAddress: orderType === 'delivery' ? customerAddress : undefined,
      paymentMethod,
      totalAmount: calculatedTotal // Usar el total calculado
    });

    console.log('Guardando la orden...'); // LOG 39
    const savedOrder = await newOrder.save(); // Ya no pasamos la sesión
    console.log('Orden guardada:', savedOrder._id); // LOG 40

    // 7. Actualizar la mesa con el ID de la orden si aplica
    if (tableId) {
      console.log('Actualizando estado de la mesa...'); // LOG 41
      await Table.findByIdAndUpdate(tableId, { currentOrderId: savedOrder._id }); // Ya no pasamos la sesión
      console.log('Mesa actualizada a ocupada.'); // LOG 42
    }

    // Eliminamos el commit de la transacción
    // await session.commitTransaction();
    // session.endSession();

    console.log('Orden creada exitosamente. Enviando respuesta...'); // LOG 43
    res.status(201).json({
      success: true,
      message: 'Orden creada exitosamente.',
      order: savedOrder
    });

  } catch (error) {
    // Eliminamos el abort de la transacción
    // await session.abortTransaction();
    // session.endSession();
    console.error('Error CATCH en createOrder:', error); // LOG DE ERROR

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID de producto/mesa/usuario inválido.' });
    }
    if (error.code === 11000) { // Manejar error de duplicado de orderNumber si ocurre fuera de la verificación
      return res.status(409).json({ success: false, message: 'El número de orden ya existe.' });
    }
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al crear la orden.',
      error: process.env.NODE_ENV === 'development' ? error.message : null,
    });
  }
  console.log('--- Fin de createOrder ---'); // LOG 44
};

// @desc    Obtener todas las órdenes
// @route   GET /api/orders
// @access  Private (administrador, mesero, supervisor, cocinero)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('takenBy', 'name role') // Popula solo nombre y rol del empleado
      .populate('table', 'tableNumber status') // Popula número y estado de la mesa
      .populate({
        path: 'items.product',
        select: 'name price category' // Popula solo nombre, precio y categoría del producto
      });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('Error al obtener órdenes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener las órdenes.',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

// @desc    Obtener una orden por ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('takenBy', 'name role')
      .populate('table', 'tableNumber status')
      .populate({
        path: 'items.product',
        select: 'name price category'
      });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Orden no encontrada.' });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('Error al obtener orden por ID:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID de orden inválido.' });
    }
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener la orden.',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

// @desc    Actualizar una orden
// @route   PUT /api/orders/:id
// @access  Private (administrador, mesero, supervisor)
export const updateOrder = async (req, res) => {
  const {
    orderNumber,
    takenBy,
    items,
    table,
    orderType,
    customerName,
    customerPhone,
    customerAddress,
    paymentMethod,
    status,
    totalAmount
  } = req.body;

  try {
    let order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Orden no encontrada.' });
    }

    // Validación de orderNumber único si cambia
    if (orderNumber && orderNumber.toLowerCase() !== order.orderNumber.toLowerCase()) {
      const existingOrder = await Order.findOne({
        orderNumber: { $regex: new RegExp(`^${orderNumber}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      if (existingOrder) {
        return res.status(409).json({ success: false, message: 'Ya existe otra orden con este número.' });
      }
    }

    // Validación de campos y actualización de la orden
    if (takenBy) {
      const employee = await User.findById(takenBy);
      if (!employee || !(employee.role === 'mesero' || employee.role === 'admin' || employee.role === 'administrador' || employee.role === 'supervisor')) {
        return res.status(400).json({ success: false, message: 'El empleado que toma la orden es inválido o no tiene permisos.' });
      }
      order.takenBy = takenBy;
    }

    if (items) {
      let calculatedTotal = 0;
      const updatedItems = [];
      for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) {
          return res.status(400).json({ success: false, message: `El producto con ID ${item.product} no existe.` });
        }
        const finalPriceAtOrder = item.priceAtOrder !== undefined ? item.priceAtOrder : product.price;
        updatedItems.push({
          product: product._id,
          quantity: item.quantity,
          priceAtOrder: finalPriceAtOrder,
          notes: item.notes || '',
          additionalIngredients: item.additionalIngredients || []
        });
        calculatedTotal += finalPriceAtOrder * item.quantity;
        if (item.additionalIngredients && item.additionalIngredients.length > 0) {
          for (const addIng of item.additionalIngredients) {
            calculatedTotal += addIng.price * addIng.quantity;
          }
        }
      }
      order.items = updatedItems;
      // Recalcular o validar totalAmount si se actualizaron los items
      if (totalAmount === undefined || Math.abs(totalAmount - calculatedTotal) > 0.01) {
        order.totalAmount = calculatedTotal;
      } else {
        order.totalAmount = totalAmount;
      }
    } else if (totalAmount !== undefined) {
      order.totalAmount = totalAmount; // Actualizar totalAmount si solo se envió el total
    }


    // Manejo de la mesa
    if (table !== undefined) {
      if (table === null || table === '') { // Si la mesa se desvincula
        if (order.table) { // Si ya había una mesa vinculada
          const oldTable = await Table.findById(order.table);
          if (oldTable) {
            oldTable.status = 'available'; // O el estado deseado al desvincular
            oldTable.currentOrderId = undefined;
            await oldTable.save();
          }
        }
        order.table = undefined; // Desvincula la orden de la mesa
      } else { // Si se vincula o cambia la mesa
        const newTable = await Table.findById(table);
        if (!newTable) {
          return res.status(400).json({ success: false, message: 'Nueva mesa seleccionada no encontrada.' });
        }
        if (newTable.status !== 'available' && newTable._id.toString() !== order.table?.toString()) {
          return res.status(400).json({ success: false, message: `La mesa ${newTable.tableNumber} no está disponible (${newTable.status}).` });
        }
        // Si la mesa cambia, desvincular de la anterior
        if (order.table && order.table.toString() !== newTable._id.toString()) {
          const oldTable = await Table.findById(order.table);
          if (oldTable) {
            oldTable.status = 'available';
            oldTable.currentOrderId = undefined;
            await oldTable.save();
          }
        }
        newTable.status = 'occupied';
        newTable.currentOrderId = order._id;
        await newTable.save();
        order.table = newTable._id;
      }
    }


    // Actualizar otros campos
    order.orderNumber = orderNumber || order.orderNumber;
    order.orderType = orderType || order.orderType;
    order.customerName = (orderType !== 'comer aquí' && customerName !== undefined) ? customerName : (order.orderType !== 'comer aquí' ? order.customerName : undefined);
    order.customerPhone = (orderType !== 'comer aquí' && customerPhone !== undefined) ? customerPhone : (order.orderType !== 'comer aquí' ? order.customerPhone : undefined);
    order.customerAddress = (orderType === 'a domicilio' && customerAddress !== undefined) ? customerAddress : (order.orderType === 'a domicilio' ? order.customerAddress : undefined);
    order.paymentMethod = paymentMethod || order.paymentMethod;
    order.status = status || order.status;


    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: 'Orden actualizada exitosamente.',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Error al actualizar la orden:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'El número de orden ya existe.' });
    }
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al actualizar la orden.',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

// @desc    Eliminar una orden
// @route   DELETE /api/orders/:id
// @access  Private (administrador)
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Orden no encontrada.' });
    }

    // Si la orden está asociada a una mesa, desvincularla
    if (order.table) {
      const table = await Table.findById(order.table);
      if (table) {
        table.currentOrderId = undefined; // Desvincula la orden de la mesa
        table.status = 'available'; // O pon el estado que desees al liberar la mesa
        await table.save();
      }
    }

    await order.deleteOne();

    res.status(200).json({ success: true, message: 'Orden eliminada exitosamente.' });
  } catch (error) {
    console.error('Error al eliminar orden:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID de orden inválido.' });
    }
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al eliminar la orden.',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

// @desc    Cambiar el estado de una orden
// @route   PATCH /api/orders/:id/status
// @access  Private (administrador, mesero, cocinero, supervisor)
export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;

  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Orden no encontrada.' });
    }

    // Validar el nuevo estado (asume que tu modelo de Order tiene un enum para status)
    const validStatuses = ['pending', 'preparing', 'served', 'paid', 'cancelled', 'delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Estado inválido. Los estados permitidos son: ${validStatuses.join(', ')}.` });
    }

    // Lógica para actualizar la mesa si la orden cambia a 'paid' o 'cancelled'
    if ((status === 'paid' || status === 'cancelled') && order.table) {
      const table = await Table.findById(order.table);
      if (table) {
        table.currentOrderId = undefined;
        table.status = 'available'; // O 'cleaning' si se cancela y necesita limpieza
        await table.save();
      }
    }

    order.status = status;
    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: `Estado de la orden ${order.orderNumber} actualizado a '${status}' exitosamente.`,
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error al actualizar estado de orden:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID de orden inválido.' });
    }
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al actualizar el estado de la orden.',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

// @desc    Obtener órdenes por estado
// @route   GET /api/orders/status/:status
// @access  Private (cocinero para 'pending', 'preparing'; mesero para 'served', 'paid')
export const getOrdersByStatus = async (req, res) => {
  const { status } = req.params;
  try {
    const validStatuses = ['pending', 'preparing', 'served', 'paid', 'cancelled', 'delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Estado inválido. Los estados permitidos son: ${validStatuses.join(', ')}.` });
    }

    const orders = await Order.find({ status })
      .populate('takenBy', 'name role')
      .populate('table', 'tableNumber status')
      .populate({
        path: 'items.product',
        select: 'name price category'
      });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('Error al obtener órdenes por estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener órdenes por estado.',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

// @desc    Obtener órdenes por mesa
// @route   GET /api/orders/table/:tableId
// @access  Private (mesero, administrador, supervisor)
export const getOrdersByTable = async (req, res) => {
  const { tableId } = req.params;
  try {
    const orders = await Order.find({ table: tableId })
      .populate('takenBy', 'name role')
      .populate('table', 'tableNumber status')
      .populate({
        path: 'items.product',
        select: 'name price category'
      });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('Error al obtener órdenes por mesa:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID de mesa inválido.' });
    }
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener órdenes por mesa.',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

// @desc    Obtener órdenes por mesero
// @route   GET /api/orders/takenBy/:userId
// @access  Private (administrador, supervisor)
export const getOrdersByTakenBy = async (req, res) => {
  const { userId } = req.params;
  try {
    const orders = await Order.find({ takenBy: userId })
      .populate('takenBy', 'name role')
      .populate('table', 'tableNumber status')
      .populate({
        path: 'items.product',
        select: 'name price category'
      });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('Error al obtener órdenes por mesero:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID de usuario inválido.' });
    }
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener órdenes por mesero.',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

// @desc    Marcar una orden como pagada
// @route   PATCH /api/orders/:id/pay
// @access  Private (administrador, mesero)
export const markOrderPaid = async (req, res) => {
  const { paymentMethod } = req.body;

  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Orden no encontrada.' });
    }

    if (order.paid) {
      return res.status(400).json({ success: false, message: 'La orden ya ha sido marcada como pagada.' });
    }

    order.paid = true;
    order.paidAt = new Date();
    if (paymentMethod) {
      order.paymentMethod = paymentMethod;
    }
    await order.save();

    res.status(200).json({
      success: true,
      message: `Orden ${order.orderNumber} marcada como pagada exitosamente.`,
      order
    });
  } catch (error) {
    console.error('Error al marcar orden como pagada:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID de orden inválido.' });
    }
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al marcar la orden como pagada.',
      systemError: process.env.NODE_ENV === 'development' ? error.message : null,
    });
  }
};
export const getTodaySummary = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const orders = await Order.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'cancelled' } // Excluir órdenes canceladas
    });

    const total = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const count = orders.length;

    res.json({ 
      success: true,
      total,
      count,
      orders: orders.map(o => ({
        _id: o._id,
        orderNumber: o.orderNumber,
        totalAmount: o.totalAmount
      }))
    });
  } catch (error) {
    console.error('Error al obtener resumen diario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};