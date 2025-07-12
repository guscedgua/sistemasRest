export default function MenuItem({ name, price, description }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
      <h3 className="text-lg font-semibold">{name}</h3>
      <p className="text-gray-600 text-sm mt-1">{description}</p>
      <div className="flex justify-between items-center mt-3">
        <span className="text-restaurant-primary font-bold">${price.toFixed(2)}</span>
        <div className="flex space-x-2">
          <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm">
            Añadir
          </button>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">
            Detalles
          </button>
        </div>
      </div>
    </div>
  );
}