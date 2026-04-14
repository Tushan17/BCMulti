/**
 * genericIndex.tsx
 * Entry point for the generic-bridge build.
 * Mounts GenericApp (service-based, uses bcGenericBridge) instead of App.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import GenericApp from './GenericApp';

function mount() {
  let container = document.getElementById('controlAddIn');
  if (!container) {
    container = document.createElement('div');
    container.id = 'controlAddIn';
    container.style.cssText =
      'position:absolute;top:0;left:0;right:0;bottom:0;overflow:auto;';
    document.body.appendChild(container);
  }

  const root = createRoot(container);
  root.render(
    <StrictMode>
      <GenericApp />
    </StrictMode>
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();
}
