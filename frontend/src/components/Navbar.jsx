export default function Navbar() {
    return (
      <nav className="bg-restaurant-secondary text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">🍽️ Restaurante APP</h1>
          <div className="flex space-x-4">
            <button className="px-3 py-1 bg-restaurant-primary rounded hover:bg-orange-600">
              Iniciar Sesión
            </button>
          </div>
        </div>
      </nav>
    );
  }