(function() {
  "use strict";
  var _a;
  function initContainer() {
    let container = document.getElementById("controlAddIn");
    if (!container) {
      container = document.createElement("div");
      container.id = "controlAddIn";
      document.body.appendChild(container);
    }
    document.documentElement.style.cssText = "height:100%;margin:0;padding:0;";
    document.body.style.cssText = "height:100%;margin:0;padding:0;position:relative;overflow:hidden;";
    container.style.cssText = "position:absolute;top:0;left:0;right:0;bottom:0;overflow:auto;";
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initContainer);
  } else {
    initContainer();
  }
  let pendingMessages = [];
  let reactReady = false;
  window.BCGenericBridge = (_a = window.BCGenericBridge) != null ? _a : {};
  window.SendMessage = function(msgType, payloadJson) {
    const json = payloadJson || "null";
    const bridge = window.BCGenericBridge;
    if (reactReady && typeof bridge.fromBC === "function") {
      bridge.fromBC(msgType, json);
    } else {
      pendingMessages.push({ type: msgType, payloadJson: json });
    }
  };
  window.addEventListener("bcgb:tobc", function(e) {
    var _a2, _b, _c;
    const detail = (_a2 = e.detail) != null ? _a2 : {};
    invokeBC("OnMessage", [(_b = detail.type) != null ? _b : "", (_c = detail.payloadJson) != null ? _c : "null"]);
  });
  window.addEventListener("bcgb:ready", function() {
    reactReady = true;
    const bridge = window.BCGenericBridge;
    const queued = pendingMessages.slice();
    pendingMessages = [];
    queued.forEach(function(msg) {
      if (typeof bridge.fromBC === "function") {
        bridge.fromBC(msg.type, msg.payloadJson);
      }
    });
    invokeBC("ControlReady", []);
  });
  function invokeBC(method, args) {
    try {
      const ms = typeof Microsoft !== "undefined" ? Microsoft : void 0;
      if (ms && ms.Dynamics && ms.Dynamics.NAV && typeof ms.Dynamics.NAV.InvokeExtensibilityMethod === "function") {
        ms.Dynamics.NAV.InvokeExtensibilityMethod(method, args);
      }
    } catch (err) {
      console.warn("[BCGenericBridge] InvokeExtensibilityMethod error:", err);
    }
  }
})();
