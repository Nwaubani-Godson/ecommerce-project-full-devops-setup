import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; 
import './index.css';      

// Import the Inter font (optional, but used in global CSS)
// You might need to install this via npm: `npm install @fontsource/inter`
// or link it in public/index.html if not using @fontsource
// For now, it's just a CSS property in index.css, so no JS import needed here unless you use @fontsource.

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);