import React from 'react';

const ReportsPage = () => {
  console.log("RENDERIZANDO COMPONENTE REPORTS PAGE"); // Para depuración

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Reportes y Estadísticas</h2>
      <p className="text-gray-700">Aquí se generarán y mostrarán los diferentes reportes del restaurante.</p>
      {/* Aquí irá la lógica para filtros de reportes, gráficos, tablas, etc. */}
    </div>
  );
};

export default ReportsPage;