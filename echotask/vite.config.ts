import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/// <reference types="vitest" />
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // v8 or istanbul for coverage can be added later
  },
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