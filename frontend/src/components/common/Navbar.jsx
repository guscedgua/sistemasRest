import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { userProfile, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      'admin': 'Administrador',
      'mesero': 'Mesero',
      'cocinero': 'Cocinero',
      'supervisor': 'Supervisor',
      'cajero': 'Cajero'
    };
    return roleNames[role] || role;
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-2.5 shadow-sm">
      <div className="flex flex-wrap justify-between items-center">
        <div className="flex justify-start items-center">
          <button
            data-drawer-target="drawer-navigation"
            data-drawer-toggle="drawer-navigation"
            aria-controls="drawer-navigation"
            className="p-2 mr-2 text-gray-600 rounded-lg cursor-pointer md:hidden hover:text-gray-900 hover:bg-gray-100 focus:bg-gray-100 focus:ring-2 focus:ring-gray-100"
          >
            <svg
              className="w-6 h-6"
              aria-hidden="true"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              ></path>
            </svg>
            <span className="sr-only">Toggle sidebar</span>
          </button>
          <span className="self-center text-xl font-semibold whitespace-nowrap">
            Sistema Restaurante
          </span>
        </div>

        <div className="flex items-center lg:order-2 relative">
          <button
            type="button"
            className="flex mx-3 text-sm bg-gray-800 rounded-full md:mr-0 focus:ring-4 focus:ring-gray-300"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <span className="sr-only">Open user menu</span>
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
              {userProfile?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute top-full right-0 z-50 my-4 w-56 text-base list-none bg-white rounded divide-y divide-gray-100 shadow">
              <div className="py-3 px-4">
                <span className="block text-sm font-semibold text-gray-900">
                  {userProfile?.name}
                </span>
                <span className="block text-sm text-gray-500 truncate">
                  {userProfile?.email}
                </span>
                <span className="block text-xs text-indigo-600 mt-1">
                  {getRoleDisplayName(userProfile?.role)}
                </span>
              </div>
              <ul className="py-1">
                <li>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left py-2 px-4 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Cerrar sesión
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;