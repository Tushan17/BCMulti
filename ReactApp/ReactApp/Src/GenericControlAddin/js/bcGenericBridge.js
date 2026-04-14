/**
 * bcGenericBridge.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Loaded FIRST by BCGenericControlAddIn (before the React bundle).
 * Acts as the low-level transport layer between AL code and the React app.
 *
 * BC  →  React:
 *   AL calls  CurrPage.GenericAddin.SendMessage(msgType, payloadJson)
 *   → the BC runtime looks for window.SendMessage and calls it
 *   → this file queues or forwards the call to the TS module handler
 *     (window.BCGenericBridge.fromBC) which bcGenericBridge.ts installs.
 *
 * React  →  BC:
 *   A service calls sendToBC(type, payload)  (in bcGenericBridge.ts)
 *   → that dispatches 'bcgb:tobc' CustomEvent
 *   → this file forwards it to BC via InvokeExtensibilityMethod('OnMessage', …)
 *   → the AL trigger OnMessage fires on the page.
 *
 * Ready handshake:
 *   bcGenericBridge.ts dispatches 'bcgb:ready'
 *   → this file flushes any queued messages and calls
 *     InvokeExtensibilityMethod('ControlReady', [])
 * ─────────────────────────────────────────────────────────────────────────────
 */
(function () {
  'use strict';

  // ── 1. Create / configure the React mount point ──────────────────────────
  function initContainer() {
    var container = document.getElementById('controlAddIn');
    if (!container) {
      container = document.createElement('div');
      container.id = 'controlAddIn';
      document.body.appendChild(container);
    }
    document.documentElement.style.cssText = 'height:100%;margin:0;padding:0;';
    document.body.style.cssText =
      'height:100%;margin:0;padding:0;position:relative;overflow:hidden;';
    container.style.cssText =
      'position:absolute;top:0;left:0;right:0;bottom:0;overflow:auto;';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContainer);
  } else {
    initContainer();
  }

  // ── 2. Queue messages that arrive before React is mounted ─────────────────
  var pendingMessages = []; // [{type, payloadJson}]
  var reactReady = false;

  // Placeholder so bcGenericBridge.ts can always write to this object.
  // The TS module overwrites window.BCGenericBridge with the real handler.
  window.BCGenericBridge = window.BCGenericBridge || {};

  // ── 3. BC → React: exposed global called by the SendMessage procedure ─────

  /**
   * Called by BC: CurrPage.GenericAddin.SendMessage(msgType, payloadJson)
   * The BC runtime looks for a global function named 'SendMessage'.
   * Once React is ready, messages are forwarded immediately to the TS handler.
   * Messages that arrive before React is ready are queued and flushed later.
   */
  window.SendMessage = function (msgType, payloadJson) {
    var json = payloadJson || 'null';
    if (reactReady && typeof window.BCGenericBridge.fromBC === 'function') {
      window.BCGenericBridge.fromBC(msgType, json);
    } else {
      pendingMessages.push({ type: msgType, payloadJson: json });
    }
  };

  // ── 4. Listen for React → BC messages ────────────────────────────────────

  /**
   * bcGenericBridge.ts dispatches 'bcgb:tobc' when a service calls sendToBC().
   * detail: { type: string, payloadJson: string }
   */
  window.addEventListener('bcgb:tobc', function (e) {
    var detail = e.detail || {};
    invokeBC('OnMessage', [detail.type || '', detail.payloadJson || 'null']);
  });

  // ── 5. Listen for React ready signal ─────────────────────────────────────

  /**
   * bcGenericBridge.ts dispatches 'bcgb:ready' when the root component mounts.
   * By this point the TS module has installed window.BCGenericBridge.fromBC.
   * We flush queued messages and notify BC.
   */
  window.addEventListener('bcgb:ready', function () {
    reactReady = true;

    // Replay messages that arrived before React was ready
    var queued = pendingMessages.slice();
    pendingMessages = [];
    queued.forEach(function (msg) {
      if (typeof window.BCGenericBridge.fromBC === 'function') {
        window.BCGenericBridge.fromBC(msg.type, msg.payloadJson);
      }
    });

    // Notify BC — fires the AL event ControlReady()
    invokeBC('ControlReady', []);
  });

  // ── 6. Safe BC invocation helper ─────────────────────────────────────────
  function invokeBC(method, args) {
    try {
      if (
        typeof Microsoft !== 'undefined' &&
        Microsoft.Dynamics &&
        Microsoft.Dynamics.NAV &&
        typeof Microsoft.Dynamics.NAV.InvokeExtensibilityMethod === 'function'
      ) {
        Microsoft.Dynamics.NAV.InvokeExtensibilityMethod(method, args);
      }
    } catch (err) {
      console.warn('[BCGenericBridge] InvokeExtensibilityMethod error:', err);
    }
  }
})();

