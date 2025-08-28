// frontend/src/pages/RoleSelection.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const RoleSelection = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4 bg-gray-100">
      <h1 className="text-3xl font-bold text-gray-800">Selecciona tu Rol</h1>
      <Link to="/admin-login" className="px-6 py-3 text-lg font-semibold text-white bg-blue-600 rounded-md shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-64 text-center">
        Admin
      </Link>
      <Link to="/waiter-login" className="px-6 py-3 text-lg font-semibold text-white bg-green-600 rounded-md shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 w-64 text-center">
        Mesero
      </Link>
      <Link to="/chef-login" className="px-6 py-3 text-lg font-semibold text-white bg-red-600 rounded-md shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 w-64 text-center">
        Cocinero
      </Link>
    </div>
  );
};

export default RoleSelection;