import { defineConfig } from 'vite';
import shopify from 'vite-plugin-shopify';
import liquid from '@vituum/vite-plugin-liquid'; // handle live reload for liquid files

export default defineConfig({
  plugins: [
    shopify(),
    liquid({
      root: './components',
      formats: ['liquid'],
    })
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
      interval: 200, // adjust since chokidar is default 100
      include: ['**/*.liquid'], // explicit to reinforce on change
    }
  }
});
