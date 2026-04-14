/**
 * bcGenericBridge.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Loaded FIRST by BCGenericControlAddIn (before the React bundle).
 * Acts as the low-level transport layer between AL code and the React app.
 *
 * BC  →  React:
 *   AL calls  CurrPage.GenericAddin.SendMessage(msgType, payloadJson)
 *   → this file's window.BCGenericBridge.fromBC(type, payloadJson) is exposed
 *     so the control-addin binding can forward the call into the module.
 *   → bcGenericBridge.ts routes the payload to the registered service handlers.
 *
 * React  →  BC:
 *   A service calls sendToBC(type, payload)  (in bcGenericBridge.ts)
 *   → that dispatches 'bcgb:tobc' CustomEvent
 *   → this file forwards it to BC via InvokeExtensibilityMethod('OnMessage', …)
 *   → the AL trigger OnMessage fires on the page.
 *
 * Ready handshake:
 *   bcGenericBridge.ts dispatches 'bcgb:ready'
 *   → this file calls InvokeExtensibilityMethod('ControlReady', [])
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

  // ── 3. Expose the hook that the React module (bcGenericBridge.ts) installs ─
  //
  // bcGenericBridge.ts sets  window.BCGenericBridge = { fromBC: fn }  when the
  // module initialises.  Messages queued before that point are replayed once
  // React signals readiness.
  //
  // This stub is replaced by the real implementation when the TS module loads,
  // but we keep it here so AL can safely call SendMessage at any time.
  if (!window.BCGenericBridge) {
    window.BCGenericBridge = {
      fromBC: function (type, payloadJson) {
        if (reactReady) {
          // bcGenericBridge.ts has installed the real handler — call it.
          window.BCGenericBridge.fromBC(type, payloadJson);
        } else {
          pendingMessages.push({ type: type, payloadJson: payloadJson });
        }
      },
    };
  }

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
   * We then flush any queued messages and notify BC.
   */
  window.addEventListener('bcgb:ready', function () {
    reactReady = true;

    // Replay messages that arrived before React was ready
    var queued = pendingMessages.slice();
    pendingMessages = [];
    queued.forEach(function (msg) {
      window.BCGenericBridge.fromBC(msg.type, msg.payloadJson);
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
