import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Aktiverar alla nätverksinterface
    port: 5000,
    strictPort: true,
    hmr: {
      clientPort: 443 // Use 443 for HTTPS or 80 for HTTP
    },
    cors: true,
    allowedHosts: [
      'c1887eca-4b64-4645-87a5-8b72c350b2cd-00-1tfkofdiqni22.kirk.replit.dev', 
      'localhost', 
      '.replit.dev',
      '.repl.co'
    ]
  }
});