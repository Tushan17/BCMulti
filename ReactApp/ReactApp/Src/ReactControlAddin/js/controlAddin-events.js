/**
 * controlAddin-events.js
 * ─────────────────────────────────────────────────────────────────────────────
 * This file is loaded FIRST by the ReactControlAddIn control addin (before the
 * React bundle). It acts as a two-way bridge between Business Central AL code
 * and the React application.
 *
 * BC  →  React:
 *   BC calls AL procedure CurrPage.ReactAddin.LoadData(JsonObject)
 *   → this file's window.LoadData() converts it to a DOM CustomEvent
 *   → React listens for that event and updates its state
 *
 * React  →  BC:
 *   React dispatches 'onDataChange' / 'onAction' CustomEvents
 *   → this file forwards them to BC via InvokeExtensibilityMethod
 *   → AL triggers fire in the page codeunit
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */
(function () {
  'use strict';

  // ── 1. Create / configure the React mount point ──────────────────────────
  // BC may or may not pre-create div#controlAddIn.
  // We use absolute positioning so height never depends on the parent cascade.
  function initContainer() {
    var container = document.getElementById('controlAddIn');
    if (!container) {
      container = document.createElement('div');
      container.id = 'controlAddIn';
      document.body.appendChild(container);
    }
    // Fill the entire iframe viewport regardless of html/body height
    document.documentElement.style.cssText =
      'height:100%;margin:0;padding:0;';
    document.body.style.cssText =
      'height:100%;margin:0;padding:0;position:relative;overflow:hidden;';
    container.style.cssText =
      'position:absolute;top:0;left:0;right:0;bottom:0;overflow:auto;';
  }

  // Guard against scripts running before <body> exists (injected in <head>)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContainer);
  } else {
    initContainer();
  }

  // ── 2. Queue data that arrives before React is mounted ────────────────────
  var pendingData = null;
  var pendingReadOnly = null;
  var reactReady = false;

  function dispatchToReact(eventName, detail) {
    window.dispatchEvent(new CustomEvent(eventName, { detail: detail }));
  }

  // ── 3. Functions called by BC (via AL procedure bindings) ─────────────────

  /**
   * Called by BC: CurrPage.ReactAddin.LoadData(jsonObject)
   * The AL layer serialises the JsonObject to a JSON string before passing it.
   */
  window.LoadData = function (dataJson) {
    var data;
    try {
      data = typeof dataJson === 'string' ? JSON.parse(dataJson) : dataJson;
    } catch (e) {
      data = {};
    }

    if (reactReady) {
      dispatchToReact('onBCLoadData', data);
    } else {
      pendingData = data;
    }
  };

  /**
   * Called by BC: CurrPage.ReactAddin.SetReadOnly(true/false)
   */
  window.SetReadOnly = function (readOnly) {
    if (reactReady) {
      dispatchToReact('onBCSetReadOnly', !!readOnly);
    } else {
      pendingReadOnly = !!readOnly;
    }
  };

  // ── 4. Listeners for events dispatched by React ───────────────────────────

  /**
   * React fires 'onControlReady' when it has mounted.
   * We forward this to BC so the AL ControlReady trigger fires.
   */
  window.addEventListener('onControlReady', function () {
    reactReady = true;

    // Flush any queued items
    if (pendingReadOnly !== null) {
      dispatchToReact('onBCSetReadOnly', pendingReadOnly);
      pendingReadOnly = null;
    }
    if (pendingData !== null) {
      dispatchToReact('onBCLoadData', pendingData);
      pendingData = null;
    }

    // Notify BC — this fires the AL event ControlReady()
    invokeBC('ControlReady', []);
  });

  /**
   * React fires 'onDataChange' when the user edits the form and saves.
   * payload: BCRecord object  →  forwarded to BC as a JSON string.
   */
  window.addEventListener('onDataChange', function (e) {
    var json = JSON.stringify(e.detail || {});
    invokeBC('OnDataChange', [json]);
  });

  /**
   * React fires 'onAction' for named actions like "refresh".
   * payload: string  →  forwarded to BC as-is.
   */
  window.addEventListener('onAction', function (e) {
    invokeBC('OnAction', [e.detail || '']);
  });

  // ── 5. Safe BC invocation helper ─────────────────────────────────────────
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
      // Swallow errors during dev / outside BC context
      console.warn('[BCBridge] InvokeExtensibilityMethod error:', err);
    }
  }
})();
