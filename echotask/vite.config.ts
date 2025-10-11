import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,  // Expose sur toutes les interfaces (localhost + IP)
    port: 4173,
    // Force le rechargement
    hmr: {
      overlay: true
    }
  },
  // Désactive le cache en dev
  build: {
    manifest: true
  }
});