import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('Root element not found. Fallback to creating a root element.');
  
  // Skapa en root-element om det inte finns
  const fallbackRoot = document.createElement('div');
  fallbackRoot.id = 'root';
  document.body.appendChild(fallbackRoot);
  
  ReactDOM.createRoot(fallbackRoot).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}