import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';

const configInjector = () => ({
  name: 'config-injector',
  transform(code, id) {
    if (id.endsWith('navbar.js')) {
      const configPath = path.resolve(__dirname, 'config/navbar-config.json');
      console.log(configPath);
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

      return code.replace(
        /const navbarItems = \[[\s\S]*?\];/,
        `const navbarItems = ${JSON.stringify(config.navbarItems, null, 2)};`
      ).replace(
        /const zhEnPaths = \[[\s\S]*?\];/,
        `const zhEnPaths = ${JSON.stringify(config.zhEnPaths, null, 2)};`
      );
    }
    return code;
  }
});

export default defineConfig({
  plugins: [configInjector()],
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
