import { defineConfig } from 'vite';
import shopify from 'vite-plugin-shopify';

export default defineConfig({
  plugins: [
    shopify()
  ],
  build: {
    emptyOutDir: false
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
