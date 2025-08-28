import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-4">
      <h1 className="text-6xl font-extrabold text-gray-800">404</h1>
      <p className="mt-4 text-xl text-gray-600">¡Vaya! Página no encontrada.</p>
      <p className="mt-2 text-gray-500">
        Parece que la página que estás buscando no existe.
      </p>
      <Link
        to="/"
        className="mt-6 px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Volver a la página de inicio
      </Link>
    </div>
  );
};

export default NotFound;