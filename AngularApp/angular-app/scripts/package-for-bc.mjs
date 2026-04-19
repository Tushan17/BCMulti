/**
 * package-for-bc.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Post-build script: copies Angular build output to the AL control addin folder.
 *
 * Input  (from `ng build --configuration=bc`):
 *   ../AngularApp/Src/AngularControlAddin/dist/browser/
 *     main.js
 *     styles.css
 *
 * Output:
 *   ../AngularApp/Src/AngularControlAddin/
 *     js/angular-addin.js
 *     css/angular-addin.css
 *
 * Usage: node scripts/package-for-bc.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { copyFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, '..', 'AngularApp', 'Src', 'AngularControlAddin', 'dist', 'browser');
const OUT_JS = resolve(ROOT, '..', 'AngularApp', 'Src', 'AngularControlAddin', 'js');
const OUT_CSS = resolve(ROOT, '..', 'AngularApp', 'Src', 'AngularControlAddin', 'css');

if (!existsSync(DIST)) {
  console.error(`[package-for-bc] ERROR: dist folder not found at ${DIST}`);
  process.exit(1);
}

mkdirSync(OUT_JS, { recursive: true });
mkdirSync(OUT_CSS, { recursive: true });

// Copy main.js → angular-addin.js
const mainJs = join(DIST, 'main.js');
if (existsSync(mainJs)) {
  copyFileSync(mainJs, join(OUT_JS, 'angular-addin.js'));
  console.log('[package-for-bc] Copied main.js → js/angular-addin.js');
} else {
  // Try to find any .js file
  const jsFiles = readdirSync(DIST).filter((f) => f.endsWith('.js') && !f.endsWith('.map'));
  if (jsFiles.length > 0) {
    copyFileSync(join(DIST, jsFiles[0]), join(OUT_JS, 'angular-addin.js'));
    console.log(`[package-for-bc] Copied ${jsFiles[0]} → js/angular-addin.js`);
  } else {
    console.warn('[package-for-bc] WARNING: No JS file found in dist/browser');
  }
}

// Copy styles.css → angular-addin.css
const stylesCss = join(DIST, 'styles.css');
if (existsSync(stylesCss)) {
  copyFileSync(stylesCss, join(OUT_CSS, 'angular-addin.css'));
  console.log('[package-for-bc] Copied styles.css → css/angular-addin.css');
} else {
  // Write an empty file so the AL reference doesn't break
  import('fs').then(({ writeFileSync }) => {
    writeFileSync(join(OUT_CSS, 'angular-addin.css'), '/* Angular styles */\n');
    console.log('[package-for-bc] Created empty css/angular-addin.css');
  });
}

console.log('[package-for-bc] Done. Files ready in AngularApp/Src/AngularControlAddin/');
