import { defineConfig } from 'vite';
import shopify from 'vite-plugin-shopify';

export default defineConfig({
  plugins: [
    shopify()
  ],
  build: {
    emptyOutDir: false,
    rollupOptions: {
      input: {
        main: './frontend/entrypoints/main.js',
      },
      output: {
        entryFileNames: '[name]-[hash].js',
        assetFileNames: '[name]-[hash][extname]',
        dir: 'assets',
      }
    }
  },
  resolve: {
    preserveSymlinks: true, // ensure vite follows symlink
  },
  server: { // ensure  handling of symlinks and live reload
    watch: {
      usePolling: true, // watch for changes in symlinked files 
      interval: 100
    }
  }
});
