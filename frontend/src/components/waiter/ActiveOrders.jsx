import React, { useState, useEffect } from 'react';
import { getOrdersByStatus, updateOrderStatus } from '../../services/api';

const ActiveOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
    
    // Poll for new orders every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getOrdersByStatus('all');
      if (response.success) {
        // Filter out completed and cancelled orders
        const activeOrders = response.orders.filter(order => 
          order.status !== 'completed' && order.status !== 'cancelled'
        );
        setOrders(activeOrders);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'served':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'preparing':
        return 'En preparación';
      case 'ready':
        return 'Listo';
      case 'served':
        return 'Servido';
      default:
        return status;
    }
  };

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Cargando órdenes...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Órdenes Activas</h1>
        <div className="flex space-x-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="all">Todas</option>
            <option value="pending">Pendientes</option>
            <option value="preparing">En preparación</option>
            <option value="ready">Listas</option>
            <option value="served">Servidas</option>
          </select>
          <button 
            onClick={fetchOrders}
            className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
          >
            Actualizar
          </button>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-500 text-lg">No hay órdenes activas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map(order => (
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
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
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
                      <span className="font-medium">${(item.priceAtOrder * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="border-t pt-4 flex justify-between items-center">
                <p className="font-semibold">Total: ${order.totalAmount.toFixed(2)}</p>
                
                <div className="flex space-x-2">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleUpdateStatus(order._id, 'preparing')}
                      className="bg-blue-600 text-white py-1 px-3 rounded-md hover:bg-blue-700 text-sm"
                    >
                      Preparar
                    </button>
                  )}
                  
                  {order.status === 'preparing' && (
                    <button
                      onClick={() => handleUpdateStatus(order._id, 'ready')}
                      className="bg-green-600 text-white py-1 px-3 rounded-md hover:bg-green-700 text-sm"
                    >
                      Listo
                    </button>
                  )}
                  
                  {order.status === 'ready' && (
                    <button
                      onClick={() => handleUpdateStatus(order._id, 'served')}
                      className="bg-purple-600 text-white py-1 px-3 rounded-md hover:bg-purple-700 text-sm"
                    >
                      Servido
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActiveOrders;