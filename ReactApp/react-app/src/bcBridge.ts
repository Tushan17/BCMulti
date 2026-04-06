// BC ↔ React bridge types and helpers
// React dispatches events to send data to BC.
// BC invokes window functions to send data to React.

export interface BCRecord {
  name: string;
  description: string;
  amount: number;
  readOnly?: boolean;
}

/**
 * Send updated record data back to Business Central.
 * The event bridge (controlAddin-events.js) picks this up and calls
 * Microsoft.Dynamics.NAV.InvokeExtensibilityMethod('OnDataChange', [...]).
 */
export function sendDataToBC(data: BCRecord): void {
  window.dispatchEvent(
    new CustomEvent('onDataChange', { detail: data })
  );
}

/**
 * Trigger an action in BC (e.g. "save", "refresh").
 * The event bridge forwards this to OnAction(actionName).
 */
export function triggerBCAction(actionName: string): void {
  window.dispatchEvent(
    new CustomEvent('onAction', { detail: actionName })
  );
}

/**
 * Register a listener for data loaded from BC.
 * Returns a cleanup function to remove the listener.
 */
export function onBCLoadData(callback: (data: BCRecord) => void): () => void {
  const handler = (e: Event) => callback((e as CustomEvent<BCRecord>).detail);
  window.addEventListener('onBCLoadData', handler);
  return () => window.removeEventListener('onBCLoadData', handler);
}

/**
 * Register a listener for BC setting the read-only state.
 */
export function onBCSetReadOnly(callback: (readOnly: boolean) => void): () => void {
  const handler = (e: Event) => callback((e as CustomEvent<boolean>).detail);
  window.addEventListener('onBCSetReadOnly', handler);
  return () => window.removeEventListener('onBCSetReadOnly', handler);
}

/**
 * Signal to BC that React has mounted and is ready to receive data.
 * The event bridge calls InvokeExtensibilityMethod('ControlReady', []).
 */
export function notifyControlReady(): void {
  window.dispatchEvent(new CustomEvent('onControlReady'));
}
