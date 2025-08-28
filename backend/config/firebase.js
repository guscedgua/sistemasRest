import admin from 'firebase-admin';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

if (!serviceAccountPath) {
  console.error('Error: FIREBASE_SERVICE_ACCOUNT_PATH no está definida.');
  process.exit(1);
}

try {
  const absolutePath = resolve(__dirname, serviceAccountPath);
  console.log('Cargando clave de servicio desde:', absolutePath);
  
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`El archivo de clave de servicio no existe en: ${absolutePath}`);
  }

  const serviceAccount = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
  
  // Verificar que la clave privada tenga el formato correcto
  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
  }

  console.log('Project ID from service account:', serviceAccount.project_id);

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id
    });
    console.log('Firebase Admin inicializado correctamente');
  }
} catch (error) {
  console.error('Error al inicializar Firebase Admin SDK:', error);
  process.exit(1);
}

export default admin;