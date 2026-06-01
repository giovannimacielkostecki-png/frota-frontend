// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import App from './App';

import { AuthProvider } from './context/AuthContext';

import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />

        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#21262d',
              color: '#e6edf3',
              border: '1px solid #30363d',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '13px',
            },
            success: {
              iconTheme: {
                primary: '#3fb950',
                secondary: '#0d1117',
              },
            },
            error: {
              iconTheme: {
                primary: '#f85149',
                secondary: '#0d1117',
              },
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);