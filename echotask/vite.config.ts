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
  build: {
    manifest: true,
    // Sépare les gros modules stables en chunks vendor — meilleur cache navigateur
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'dexie':        ['dexie'],
        }
      }
    }
  }
});