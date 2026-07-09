import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  envDir: fileURLToPath(new URL('..', import.meta.url)),
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    open: true,
  },
  define: {
    'import.meta.env.VITE_BUILD_ID': JSON.stringify(Date.now()),
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@monaco-editor')) return 'editor';
            if (id.includes('react-dom') || id.includes('react-router-dom') || id.includes('react/')) return 'react-vendor';
            if (id.includes('framer-motion') || id.includes('lucide-react')) return 'ui-vendor';
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  }
})
