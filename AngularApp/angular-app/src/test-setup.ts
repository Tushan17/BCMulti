/**
 * test-setup.ts
 * Global test setup for all Angular unit tests.
 * Mocks browser APIs not available in the JSDOM test environment.
 */

// Mock window.matchMedia (required by PrimeNG Menubar)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
