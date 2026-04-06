import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Output path: sibling ReactApp/Src/ReactControlAddin
const OUT_DIR = path.resolve(__dirname, '../ReactApp/Src/ReactControlAddin');

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: OUT_DIR,
    emptyOutDir: false,
    cssCodeSplit: false,
    sourcemap: false,
    rollupOptions: {
      input: path.resolve(__dirname, 'src/index.tsx'),
      output: {
        format: 'iife',
        name: 'BCReactAddIn',
        inlineDynamicImports: true,
        entryFileNames: 'js/react-addin.js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'css/react-addin.css';
          }
          return 'assets/[name][extname]';
        },
      },
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    global: 'globalThis',
  },
  // Dev server runs the app standalone for rapid development
  server: {
    port: 3000,
    open: true,
  },
});
