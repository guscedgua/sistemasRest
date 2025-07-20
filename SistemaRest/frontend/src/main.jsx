import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { BrowserRouter } from 'react-router-dom'; // <--- ADD THIS IMPORT!
import { AuthProvider } from './context/AuthContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter> {/* <--- ADD THIS WRAPPER! */}
      <AuthProvider> {/* Now AuthProvider is inside BrowserRouter */}
        <App />
      </AuthProvider>
    </BrowserRouter> {/* <--- CLOSE THIS WRAPPER! */}
  </React.StrictMode>
);