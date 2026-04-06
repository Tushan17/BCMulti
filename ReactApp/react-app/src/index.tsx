import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

function mount() {
  // BC creates div#controlAddIn automatically; events.js also ensures it exists.
  // Fallback: create it ourselves if somehow still missing.
  let container = document.getElementById('controlAddIn');
  if (!container) {
    container = document.createElement('div');
    container.id = 'controlAddIn';
    container.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0;overflow:auto;';
    document.body.appendChild(container);
  }

  const root = createRoot(container);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();
}
