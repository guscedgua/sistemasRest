export default function ErrorDisplay({ error }) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
        <p className="font-bold">Error</p>
        <p>{error.message || 'Ocurrió un error al cargar los datos'}</p>
      </div>
    );
  }