import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        bundle: path.resolve(__dirname, 'js/main.js')
      },
      output: {
        dir: 'dist',
        entryFileNames: 'bundle.min.js',
        format: 'iife',
        name: 'ChurchJS'
      }
    },
    minify: true,
    sourcemap: false,
    emptyOutDir: true
  }
});
