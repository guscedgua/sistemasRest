import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, isSupported as isMessagingSupported, onMessage } from 'firebase/messaging';

// Configuración de Firebase (debes reemplazar estos valores con los de tu proyecto)
const firebaseConfig = {
  apiKey: "AIzaSyACEo-qv6mnfJ3IZ7UbqlKwwHtJ6c9BWgk",
  authDomain: "sistemarest-4b86d.firebaseapp.com",
  projectId: "sistemarest-4b86d",
  storageBucket: "sistemarest-4b86d.firebasestorage.app",
  messagingSenderId: "927915793648",
  appId: "1:927915793648:web:2fd5025bd12dd76cfab635",
  measurementId: "G-5NHSER4714"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios de Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Inicializar mensajería (notificaciones push)
let messaging = null;
isMessagingSupported().then((isSupported) => {
  if (isSupported) {
    messaging = getMessaging(app);
    
    // Manejar mensajes cuando la app está en primer plano
    onMessage(messaging, (payload) => {
      console.log('Mensaje recibido:', payload);
      // Aquí puedes mostrar notificaciones cuando la app está abierta
      if (payload.notification) {
        const { title, body } = payload.notification;
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(title, { body });
        }
      }
    });
  }
});

export { messaging };

// Solicitar permiso para notificaciones
export const requestNotificationPermission = async () => {
  try {
    if (!messaging) return false;
    
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Permiso de notificación concedido');
      
      // Obtener token para notificaciones
      const token = await messaging.getToken({
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
      });
      
      if (token) {
        console.log('Token de notificación:', token);
        // Aquí podrías enviar el token a tu backend para guardarlo asociado al usuario
        localStorage.setItem('fcmToken', token);
        return token;
      }
    }
    return false;
  } catch (error) {
    console.error('Error al solicitar permiso de notificación:', error);
    return false;
  }
};

// Funciones de autenticación
export const loginWithEmailAndPassword = async (email, password) => {
  try {
    console.log('Intentando login con:', email);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('Login exitoso:', userCredential.user);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Error de Firebase en login:', error.code, error.message);
    
    let errorMessage = 'Error al iniciar sesión';
    
    switch (error.code) {
      case 'auth/invalid-email':
        errorMessage = 'El formato del email no es válido';
        break;
      case 'auth/user-disabled':
        errorMessage = 'Este usuario ha sido deshabilitado';
        break;
      case 'auth/user-not-found':
        errorMessage = 'No existe una cuenta con este email';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Contraseña incorrecta';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Demasiados intentos fallidos. Intenta más tarde';
        break;
      case 'auth/network-request-failed':
        errorMessage = 'Error de conexión. Verifica tu internet';
        break;
      default:
        errorMessage = error.message;
    }
    
    return { success: false, error: errorMessage };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Observador de estado de autenticación
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Verificar si el usuario está autenticado
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Obtener token de autenticación
export const getIdToken = async () => {
  try {
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  } catch (error) {
    console.error('Error al obtener token:', error);
    return null;
  }
};

// Subir imagen a Firebase Storage
export const uploadImage = async (file, path = 'products') => {
  try {
    const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return { success: true, url: downloadURL };
  } catch (error) {
    console.error('Error al subir imagen:', error);
    return { success: false, error: error.message };
  }
};

// Eliminar imagen de Firebase Storage
export const deleteImage = async (url) => {
  try {
    const imageRef = ref(storage, url);
    await deleteObject(imageRef);
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    return { success: false, error: error.message };
  }
};

export default app;