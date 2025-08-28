// Archivo: backend/config/roles.js
export const ROLES = {
  ADMIN: 'admin', // Cambiado de 'administrador' a 'admin'
  SUPERVISOR: 'supervisor',
  MESERO: 'mesero',
  COCINERO: 'cocinero', // O 'chef' si prefieres ese término en el enum
  CAJERO: 'cajero', // Si tienes este rol, añádelo
  CLIENTE: 'cliente',
  // Asegúrate de que los valores de estas propiedades coincidan con el 'enum' en User.js
};