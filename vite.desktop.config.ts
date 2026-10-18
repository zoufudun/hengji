import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
export default defineConfig({
  root: path.resolve(__dirname, 'app'), base: './', plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname) } },
  build: { outDir: path.resolve(__dirname, 'build', 'desktop'), emptyOutDir: true, rollupOptions: { input: path.resolve(__dirname, 'app', 'desktop.html') } }
});
