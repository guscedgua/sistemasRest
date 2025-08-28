import React, { useState } from 'react';
import { getSalesReport, getInventoryReport } from '../../services/api';

const Reports = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [salesReport, setSalesReport] = useState(null);
  const [inventoryReport, setInventoryReport] = useState(null);
  const [activeTab, setActiveTab] = useState('sales');
  const [loading, setLoading] = useState(false);

  const handleGenerateSalesReport = async () => {
    if (!startDate || !endDate) {
      alert('Por favor selecciona ambas fechas');
      return;
    }

    try {
      setLoading(true);
      const response = await getSalesReport(startDate, endDate);
      if (response.success) {
        setSalesReport(response.data);
      }
    } catch (error) {
      console.error('Error generating sales report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInventoryReport = async () => {
    try {
      setLoading(true);
      const response = await getInventoryReport();
      if (response.success) {
        setInventoryReport(response.data);
      }
    } catch (error) {
      console.error('Error generating inventory report:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Reportes</h1>

      <div className="mb-6">
        <div className="flex border-b">
          <button
            className={`py-2 px-4 ${activeTab === 'sales' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('sales')}
          >
            Reporte de Ventas
          </button>
          <button
            className={`py-2 px-4 ${activeTab === 'inventory' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('inventory')}
          >
            Reporte de Inventario
          </button>
        </div>
      </div>

      {activeTab === 'sales' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Reporte de Ventas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de inicio:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de fin:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          <button
            onClick={handleGenerateSalesReport}
            disabled={loading}
            className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Generando...' : 'Generar Reporte'}
          </button>
          
          {salesReport && (
            <div className="mt-6">
              <h3 className="text-md font-semibold mb-2">Resumen de Ventas</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm text-gray-500">Ventas Totales</p>
                  <p className="text-lg font-semibold">{formatCurrency(salesReport.totalSales || 0)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm text-gray-500">Órdenes Totales</p>
                  <p className="text-lg font-semibold">{salesReport.count || 0}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm text-gray-500">Ticket Promedio</p>
                  <p className="text-lg font-semibold">{formatCurrency(salesReport.averageTicket || 0)}</p>
                </div>
              </div>
              
              <h3 className="text-md font-semibold mb-2 mt-6">Ventas por Día</h3>
              <div className="bg-white border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ventas
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Órdenes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {salesReport.dailySales && salesReport.dailySales.map((day, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {day.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(day.sales)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {day.orders}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Reporte de Inventario</h2>
          
          <button
            onClick={handleGenerateInventoryReport}
            disabled={loading}
            className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 mb-6"
          >
            {loading ? 'Generando...' : 'Generar Reporte'}
          </button>
          
          {inventoryReport && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock Actual
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock Mínimo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inventoryReport.map((item, index) => (
                    <tr key={index} className={item.status === 'Bajo Stock' ? 'bg-yellow-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.itemName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.currentStock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.minStock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.status === 'OK' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;