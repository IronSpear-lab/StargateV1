import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: true,
    hmr: {
      clientPort: 443 // Use 443 for HTTPS or 80 for HTTP
    },
    cors: true,
    allowedHosts: 'all' // Tillåt alla hosts (användbart i Replit eller andra molntjänster med dynamiska domäner)
  }
});