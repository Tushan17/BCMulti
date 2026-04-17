/**
 * vite.config.generic.ts
 * Builds the generic-bridge variant of the React add-in.
 *
 * Entry point : src/genericIndex.tsx  (uses demoRecordService → bcGenericBridge)
 * Output dir  : ../ReactApp/Src/GenericControlAddin
 *
 * Run with:
 *   npm run build:generic
 *
 * Output files produced:
 *   js/react-addin.js      — IIFE React bundle (BCGenericAddIn)
 *   js/bcGenericBridge.js  — Static BC↔React transport (transpiled from src/services/bridge/)
 *   css/react-addin.css    — Bundled styles
 *
 * Why a separate transpile+emit step for bcGenericBridge.js?
 *   bcGenericBridge.js is a plain IIFE loaded by BC *before* the React bundle.
 *   It is not imported by any TypeScript module, so Rollup would never include
 *   it in the bundle. The compileBridge plugin uses esbuild (already bundled
 *   with Vite) to transpile src/services/bridge/bcGenericBridge.ts to plain JS
 *   and emits the result as a build asset so every build produces a complete,
 *   consistent set of output files.
 */
import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { transform } from 'esbuild';

// Output path: sibling ReactApp/Src/GenericControlAddin
const OUT_DIR = path.resolve(__dirname, '../ReactApp/Src/GenericControlAddin');

/**
 * compileBridge
 * Vite/Rollup plugin that transpiles src/services/bridge/bcGenericBridge.ts
 * to plain JavaScript (via esbuild) and emits it to js/bcGenericBridge.js in
 * the output folder on every build.
 */
function compileBridge(): Plugin {
  return {
    name: 'compile-bc-bridge',
    async generateBundle() {
      const srcPath = path.resolve(__dirname, 'src/services/bridge/bcGenericBridge.ts');
      const tsSource = fs.readFileSync(srcPath, 'utf-8');
      const { code } = await transform(tsSource, {
        loader: 'ts',
        target: 'es2017',
        minify: false,
      });
      this.emitFile({
        type: 'asset',
        fileName: 'js/bcGenericBridge.js',
        source: code,
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), compileBridge()],
  build: {
    outDir: OUT_DIR,
    emptyOutDir: false,
    cssCodeSplit: false,
    sourcemap: false,
    rollupOptions: {
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
