import React from 'react';

const SuppliersPage = () => {
  console.log("RENDERIZANDO COMPONENTE SUPPLIERS PAGE"); // Para depuración

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Gestión de Proveedores</h2>
      <p className="text-gray-700">Aquí se gestionarán los proveedores del restaurante.</p>
      {/* Aquí irá la lógica para listar, añadir, editar y eliminar proveedores */}
    </div>
  );
};

export default SuppliersPage;