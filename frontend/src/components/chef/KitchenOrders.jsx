import React, { useState, useEffect } from 'react';
import { getOrdersByStatus, updateOrderStatus } from '../../services/api';

const KitchenOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    
    // Poll for new orders every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await getOrdersByStatus('pending');
      if (response.success) {
        setOrders(response.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await updateOrderStatus(orderId, { status: newStatus });
      if (response.success) {
        fetchOrders(); // Refresh orders
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Cargando órdenes...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Órdenes de Cocina</h1>
        <button 
          onClick={fetchOrders}
          className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
        >
          Actualizar
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-500 text-lg">No hay órdenes pendientes</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map(order => (
            <div key={order._id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-semibold">Orden #{order.orderNumber}</h2>
                  <p className="text-sm text-gray-500">
                    {order.orderType === 'dine-in' && order.table 
                      ? `Mesa ${order.table.tableNumber}` 
                      : order.orderType}
                  </p>
                  {order.customerName && (
                    <p className="text-sm text-gray-500">Cliente: {order.customerName}</p>
                  )}
                </div>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                  Pendiente
                </span>
              </div>
              
              <div className="border-t pt-4 mb-4">
                <h3 className="font-medium mb-2">Items:</h3>
                <ul className="space-y-2">
                  {order.items.map((item, index) => (
                    <li key={index} className="flex justify-between">
                      <div>
                        <span className="font-medium">{item.quantity}x </span>
                        <span>{item.product.name}</span>
                        {item.notes && (
                          <p className="text-sm text-gray-500">Notas: {item.notes}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="border-t pt-4">
                <button
                  onClick={() => handleUpdateStatus(order._id, 'preparing')}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                >
                  Marcar en Preparación
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default KitchenOrders;