import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import jwt_decode from "jwt-decode";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
