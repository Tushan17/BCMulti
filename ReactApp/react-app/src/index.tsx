import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// In Business Central the container div is created by controlAddin-events.js.
// In dev mode (npm run dev) it is provided by index.html.
const container = document.getElementById('controlAddIn');

if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
