/**
 * package-for-bc.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Post-build script: copies Angular build output to the AL control addin folder.
 *
 * Input  (from `ng build --configuration=bc`):
 *   ../AngularApp/Src/AngularControlAddin/dist/browser/
 *     main.js
 *     styles.css
 *     media/          ← PrimeIcons fonts
 *
 * Output:
 *   ../AngularApp/Src/AngularControlAddin/
 *     js/angular-addin.js
 *     css/angular-addin.css
 *     css/media/      ← PrimeIcons fonts (referenced from angular-addin.css)
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
  import('fs').then(({ writeFileSync }) => {
    writeFileSync(join(OUT_CSS, 'angular-addin.css'), '/* Angular styles */\n');
    console.log('[package-for-bc] Created empty css/angular-addin.css');
  });
}

// Copy media fonts (PrimeIcons referenced from the CSS as ./media/...)
const mediaDir = join(DIST, 'media');
const outMediaDir = join(OUT_CSS, 'media');
if (existsSync(mediaDir)) {
  mkdirSync(outMediaDir, { recursive: true });
  const fontFiles = readdirSync(mediaDir);
  for (const file of fontFiles) {
    copyFileSync(join(mediaDir, file), join(outMediaDir, file));
    console.log(`[package-for-bc] Copied media/${file}`);
  }
} else {
  console.log('[package-for-bc] No media folder found (PrimeIcons may not have been bundled).');
}

console.log('[package-for-bc] Done. Files ready in AngularApp/Src/AngularControlAddin/');
