import React from 'react';
import ReactDOM from 'react-dom/client';
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import App from './App';
import './index.css'; // Importera våra anpassade stilar

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CssVarsProvider defaultMode="light">
      <CssBaseline />
      <App />
    </CssVarsProvider>
  </React.StrictMode>,
);
