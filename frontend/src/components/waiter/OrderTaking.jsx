import React, { useState, useEffect } from 'react';
import { getProducts, getTables, createOrder } from '../../services/api';

const OrderTaking = () => {
  const [products, setProducts] = useState([]);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [orderType, setOrderType] = useState('dine-in');
  const [orderItems, setOrderItems] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsResponse, tablesResponse] = await Promise.all([
        getProducts(),
        getTables()
      ]);
      
      if (productsResponse.success) setProducts(productsResponse.products);
      if (tablesResponse.success) setTables(tablesResponse.tables);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addProductToOrder = (product) => {
    const existingItem = orderItems.find(item => item.product._id === product._id);
    
    if (existingItem) {
      setOrderItems(orderItems.map(item =>
        item.product._id === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setOrderItems([...orderItems, {
        product,
        quantity: 1,
        notes: ''
      }]);
    }
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity === 0) {
      setOrderItems(orderItems.filter(item => item.product._id !== productId));
    } else {
      setOrderItems(orderItems.map(item =>
        item.product._id === productId
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const updateItemNotes = (productId, notes) => {
    setOrderItems(orderItems.map(item =>
      item.product._id === productId
        ? { ...item, notes }
        : item
    ));
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  const handleSubmitOrder = async () => {
    try {
      const orderData = {
        orderNumber: `ORD-${Date.now()}`,
        items: orderItems.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          notes: item.notes
        })),
        table: orderType === 'dine-in' ? selectedTable : null,
        orderType,
        customerName: orderType !== 'dine-in' ? customerName : undefined,
        customerPhone: orderType !== 'dine-in' ? customerPhone : undefined,
        totalAmount: calculateTotal()
      };

      const response = await createOrder(orderData);
      
      if (response.success) {
        alert('Orden creada exitosamente');
        // Reset form
        setOrderItems([]);
        setSelectedTable('');
        setCustomerName('');
        setCustomerPhone('');
        setNotes('');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error al crear la orden');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Cargando...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Tomar Orden</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información de la orden */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-lg font-semibold mb-4">Información de la Orden</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Orden
              </label>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="dine-in">Comer aquí</option>
                <option value="takeaway">Para llevar</option>
                <option value="delivery">Delivery</option>
              </select>
            </div>
            
            {orderType === 'dine-in' ? (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mesa
                </label>
                <select
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Seleccionar mesa</option>
                  {tables.filter(table => table.status === 'available').map(table => (
                    <option key={table._id} value={table._id}>
                      Mesa {table.tableNumber} (Capacidad: {table.capacity})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del cliente
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                {orderType === 'delivery' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección de entrega
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      rows="3"
                    />
                  </div>
                )}
              </>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas generales
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows="3"
              />
            </div>
          </div>
          
          {/* Resumen de la orden */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Resumen de la Orden</h2>
            
            {orderItems.length === 0 ? (
              <p className="text-gray-500">No hay productos en la orden</p>
            ) : (
              <>
                <div className="space-y-3 mb-4">
                  {orderItems.map(item => (
                    <div key={item.product._id} className="flex justify-between items-start border-b pb-3">
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                        {item.notes && (
                          <p className="text-sm text-gray-500">Notas: {item.notes}</p>
                        )}
                      </div>
                      <p className="font-medium">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between items-center border-t pt-3">
                  <p className="text-lg font-semibold">Total:</p>
                  <p className="text-lg font-semibold">${calculateTotal().toFixed(2)}</p>
                </div>
                
                <button
                  onClick={handleSubmitOrder}
                  disabled={orderItems.length === 0 || (orderType === 'dine-in' && !selectedTable)}
                  className="w-full mt-4 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Crear Orden
                </button>
              </>
            )}
          </div>
        </div>
        
        {/* Productos */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Productos</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.filter(product => product.isAvailable).map(product => (
                <div
                  key={product._id}
                  className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => addProductToOrder(product)}
                >
                  <h3 className="font-medium">{product.name}</h3>
                  <p className="text-gray-600">${product.price.toFixed(2)}</p>
                  {product.description && (
                    <p className="text-sm text-gray-500 mt-1">{product.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTaking;