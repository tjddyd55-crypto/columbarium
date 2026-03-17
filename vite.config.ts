import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root: path.resolve(__dirname, 'apps/user-ui'),
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the deployed user UI src directory
      '@': path.resolve(__dirname, 'apps/user-ui/src'),
    },
  },

  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],

  server: {
    proxy: {
      '/api': { target: 'http://localhost:4000', changeOrigin: true },
      '/users': { target: 'http://localhost:4000', changeOrigin: true },
      '/queue': { target: 'http://localhost:4000', changeOrigin: true },
      '/contracts': { target: 'http://localhost:4000', changeOrigin: true },
    },
  },

  // Tests are currently managed per app package.
})
