import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

const ErrorAlert = ({ message }) => {
  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md max-w-3xl mx-auto mt-8">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <FaExclamationTriangle className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Error al cargar los datos</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{message}</p>
            <p className="mt-2">
              Por favor, inténtelo de nuevo más tarde o contacte al soporte técnico.
            </p>
          </div>
          <div className="mt-4">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorAlert;