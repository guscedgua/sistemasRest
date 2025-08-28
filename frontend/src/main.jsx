import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Importamos el componente principal de nuestra aplicación

// Este es el punto de entrada de la aplicación.
// Utiliza ReactDOM.createRoot para inicializar la aplicación de manera segura y moderna.
// document.getElementById('root') se refiere al div en tu archivo HTML (index.html)
// que sirve como el contenedor para toda la aplicación de React.
ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode> es un envoltorio que activa comprobaciones adicionales y advertencias
  // para los descendientes dentro de él, ayudando a detectar problemas potenciales.
  <React.StrictMode>
    {/* Aquí se renderiza el componente principal de la aplicación, RootApp,
        que a su vez contiene todos los demás componentes y lógicas (como el enrutador y los proveedores de contexto). */}
    <App />
  </React.StrictMode>
);

