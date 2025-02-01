import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Login from './components/Login'
import { AuthProvider } from './context/Authprovider';
import './index.scss';
import { BrowserRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.StrictMode>
  </BrowserRouter>
);
