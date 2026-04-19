/**
 * bcGenericBridge.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Generic, message-type-routed bridge between Business Central and React.
 *
 * Design goals:
 *  • The bridge itself has no knowledge of domain data shapes.
 *  • All domain knowledge lives in dedicated services that call this bridge.
 *  • Messages are identified by a string "type" and carry an arbitrary payload.
 *
 * Data flow BC → React:
 *   1. AL calls  CurrPage.GenericAddin.SendMessage(msgType, payloadJson)
 *   2. bcGenericBridge.js (loaded first) calls window.BCGenericBridge.fromBC(type, json)
 *   3. This module routes the parsed payload to every registered handler for that type.
 *
 * Data flow React → BC:
 *   1. A service calls sendToBC(type, payload)
 *   2. This module dispatches a 'bcgb:tobc' CustomEvent
 *   3. bcGenericBridge.js picks it up and calls
 *      Microsoft.Dynamics.NAV.InvokeExtensibilityMethod('OnMessage', [type, payloadJson])
 *   4. The AL trigger OnMessage fires on the BC page.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyHandler = (payload: any) => void;

/** Internal registry: messageType → set of handlers */
const _registry = new Map<string, Set<AnyHandler>>();

// ── Install the global hook called by the bridge JS ─────────────────────────

declare global {
  interface Window {
    BCGenericBridge: {
      fromBC: (type: string, payloadJson: string) => void;
    };
  }
}

window.BCGenericBridge = {
  /**
   * Called by bcGenericBridge.js when BC sends a message to React.
   * @param type       - Message type string (e.g. 'demo.record.load')
   * @param payloadJson - JSON-encoded payload sent from AL
   */
  fromBC(type: string, payloadJson: string): void {
    let payload: unknown;
    try {
      payload = JSON.parse(payloadJson);
    } catch {
      payload = payloadJson;
    }
    const handlers = _registry.get(type);
    if (handlers) {
      handlers.forEach((h) => {
        try {
          h(payload);
        } catch (err) {
          console.error(`[BCGenericBridge] Handler error for type "${type}":`, err);
        }
      });
    }
  },
};

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Send a typed message from React to Business Central.
 *
 * @param type    - Message type agreed upon by the service and the AL page.
 * @param payload - Any JSON-serialisable value.
 */
export function sendToBC(type: string, payload: unknown): void {
  let payloadJson: string;
  try {
    payloadJson = JSON.stringify(payload ?? null);
  } catch {
    payloadJson = 'null';
  }
  window.dispatchEvent(
    new CustomEvent('bcgb:tobc', { detail: { type, payloadJson } })
  );
}

/**
 * Register a typed handler for messages arriving from BC.
 * Returns a cleanup function that removes the handler.
 *
 * @param type    - Message type to listen for.
 * @param handler - Callback invoked with the parsed payload.
 */
export function onFromBC<T = unknown>(
  type: string,
  handler: (payload: T) => void
): () => void {
  if (!_registry.has(type)) {
    _registry.set(type, new Set());
  }
  _registry.get(type)!.add(handler as AnyHandler);
  return () => {
    _registry.get(type)?.delete(handler as AnyHandler);
  };
}

/**
 * Dispatch the 'bcgb:ready' event so the bridge JS can notify BC that React
 * has mounted and is ready to receive data.
 */
export function notifyReady(): void {
  window.dispatchEvent(new CustomEvent('bcgb:ready'));
}
