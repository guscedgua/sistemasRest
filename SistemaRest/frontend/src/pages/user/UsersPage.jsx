import React from 'react';

const UsersPage = () => {
  console.log("RENDERIZANDO COMPONENTE USERS PAGE"); // Para depuración

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Gestión de Usuarios</h2>
      <p className="text-gray-700">Aquí se mostrará la lista de usuarios y las opciones de administración.</p>
      {/* Aquí irá la lógica para listar, añadir, editar y eliminar usuarios */}
    </div>
  );
};

export default UsersPage;