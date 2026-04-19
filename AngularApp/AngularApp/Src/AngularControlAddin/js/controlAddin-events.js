/**
 * controlAddin-events.js
 * ─────────────────────────────────────────────────────────────────────────────
 * This file is loaded FIRST by the AngularControlAddIn control addin (before
 * the Angular bundle). It acts as a two-way bridge between Business Central
 * AL code and the Angular application.
 *
 * BC  →  Angular:
 *   BC calls AL procedure CurrPage.<Addin>.LoadData(JsonObject)
 *   → this file's window.LoadData() fires 'onBCLoadData' CustomEvent
 *   → Angular's BcBridgeService updates its Subjects
 *
 * BC  →  Angular (read-only):
 *   BC calls CurrPage.<Addin>.SetReadOnly(true/false)
 *   → fires 'onBCSetReadOnly' CustomEvent
 *
 * BC  →  Angular (navigate):
 *   BC calls CurrPage.<Addin>.SetPage('page-a' | 'page-b')
 *   → fires 'onBCSetPage' CustomEvent
 *   → Angular router navigates to the requested page
 *
 * Angular  →  BC:
 *   Angular dispatches 'onDataChange' / 'onAction' CustomEvents
 *   → this file forwards them to BC via InvokeExtensibilityMethod
 *   → AL triggers fire in the page codeunit
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */
(function () {
  'use strict';

  // ── 1. Create / configure the Angular mount point ────────────────────────
  function initContainer() {
    var container = document.getElementById('controlAddIn');
    if (!container) {
      container = document.createElement('div');
      container.id = 'controlAddIn';
      document.body.appendChild(container);
    }
    // Fill the entire iframe viewport regardless of html/body height
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

  // ── 2. Queue data that arrives before Angular is mounted ──────────────────
  var pendingData = null;
  var pendingReadOnly = null;
  var pendingPage = null;
  var angularReady = false;

  function dispatchToAngular(eventName, detail) {
    window.dispatchEvent(new CustomEvent(eventName, { detail: detail }));
  }

  // ── 3. Functions called by BC (via AL procedure bindings) ─────────────────

  /**
   * Called by BC: CurrPage.<Addin>.LoadData(jsonObject)
   * The AL layer serialises the JsonObject to a JSON string before passing it.
   * The JSON may include a "page" property to specify the default page to show.
   */
  window.LoadData = function (dataJson) {
    var data;
    try {
      data = typeof dataJson === 'string' ? JSON.parse(dataJson) : dataJson;
    } catch (e) {
      data = {};
    }

    if (angularReady) {
      dispatchToAngular('onBCLoadData', data);
    } else {
      pendingData = data;
    }
  };

  /**
   * Called by BC: CurrPage.<Addin>.SetReadOnly(true/false)
   */
  window.SetReadOnly = function (readOnly) {
    if (angularReady) {
      dispatchToAngular('onBCSetReadOnly', !!readOnly);
    } else {
      pendingReadOnly = !!readOnly;
    }
  };

  /**
   * Called by BC: CurrPage.<Addin>.SetPage('page-a' | 'page-b')
   * Tells the Angular router to navigate to the specified page.
   */
  window.SetPage = function (pageName) {
    if (angularReady) {
      dispatchToAngular('onBCSetPage', pageName);
    } else {
      pendingPage = pageName;
    }
  };

  // ── 4. Listeners for events dispatched by Angular ─────────────────────────

  /**
   * Angular fires 'onControlReady' when it has bootstrapped.
   * We forward this to BC so the AL ControlReady trigger fires.
   */
  window.addEventListener('onControlReady', function () {
    angularReady = true;

    // Flush any queued items in the correct order
    if (pendingReadOnly !== null) {
      dispatchToAngular('onBCSetReadOnly', pendingReadOnly);
      pendingReadOnly = null;
    }
    if (pendingPage !== null) {
      dispatchToAngular('onBCSetPage', pendingPage);
      pendingPage = null;
    }
    if (pendingData !== null) {
      dispatchToAngular('onBCLoadData', pendingData);
      pendingData = null;
    }

    // Notify BC — this fires the AL event ControlReady()
    invokeBC('ControlReady', []);
  });

  /**
   * Angular fires 'onDataChange' when the user saves changes.
   * payload: BCRecord object  →  forwarded to BC as a JSON string.
   */
  window.addEventListener('onDataChange', function (e) {
    var json = JSON.stringify(e.detail || {});
    invokeBC('OnDataChange', [json]);
  });

  /**
   * Angular fires 'onAction' for named actions like "refresh".
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
      console.warn('[BCBridge-Angular] InvokeExtensibilityMethod error:', err);
    }
  }
})();
