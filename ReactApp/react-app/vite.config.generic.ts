/**
 * vite.config.generic.ts
 * Builds the generic-bridge variant of the React add-in.
 *
 * Entry point : src/GenericApp.tsx (uses demoRecordService → bcGenericBridge)
 * Output dir  : ../ReactApp/Src/GenericControlAddin
 *
 * Run with:
 *   npm run build:generic
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Output path: sibling ReactApp/Src/GenericControlAddin
const OUT_DIR = path.resolve(__dirname, '../ReactApp/Src/GenericControlAddin');

// A minimal index.html to satisfy Vite's HTML-first mode is not needed here
// because we use lib/input directly via rollupOptions.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: OUT_DIR,
    emptyOutDir: false,
    cssCodeSplit: false,
    sourcemap: false,
    rollupOptions: {
      // Reuse the same HTML entry so Vite can resolve JSX; the root component
      // is swapped by pointing to a dedicated GenericIndex.tsx.
      input: path.resolve(__dirname, 'src/genericIndex.tsx'),
      output: {
        format: 'iife',
        name: 'BCGenericAddIn',
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
  server: {
    port: 3001,
    open: true,
  },
});
