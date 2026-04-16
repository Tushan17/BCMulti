/// <summary>
/// BCGenericControlAddIn
/// Generic, message-type-routed bridge between Business Central pages and a
/// React application.
///
/// Unlike ReactControlAddIn (which has hard-coded LoadData / SetReadOnly
/// procedures), this addin exposes a single generic channel:
///
///   AL → React : CurrPage.GenericAddin.SendMessage(MsgType, PayloadJson)
///   React → AL : event OnMessage(MsgType, Payload)
///
/// All domain logic (record types, field mappings, message routing) lives in
/// React services and AL codeunits/pages – not in the bridge itself.
///
/// Scripts load order:
///   1. bcGenericBridge.js  – creates mount point and BC↔React transport
///   2. react-addin.js      – compiled React bundle (built with genericIndex.tsx)
///
/// Build the React bundle for this addin with:
///   cd react-app  npm run build:generic
/// </summary>
controladdin BCGenericControlAddIn
{
    RequestedHeight = 500;
    MinimumHeight = 500;
    VerticalStretch = true;
    VerticalShrink = true;
    HorizontalStretch = true;
    HorizontalShrink = true;

    // The bridge MUST be loaded before the React bundle.
    Scripts =
        './Src/GenericControlAddin/js/bcGenericBridge.js',
        './Src/GenericControlAddin/js/react-addin.js';

    StyleSheets =
        './Src/GenericControlAddin/css/react-addin.css';

    // ── Events (React → BC) ──────────────────────────────────────────────────

    /// <summary>Fired when React has mounted and is ready to receive messages.</summary>
    event ControlReady()

    /// <summary>
    /// Fired when a React service sends a message to BC.
    /// MsgType  : identifies the kind of message (e.g. 'demo.record.save').
    /// Payload  : JSON-encoded message body; parse with JsonObject.ReadFrom().
    /// </summary>
    event OnMessage(MsgType: Text; Payload: Text)

    // ── Procedures (BC → React) ──────────────────────────────────────────────

    /// <summary>
    /// Send a typed message from BC to React.
    /// MsgType  : must match the type a React service is listening for.
    /// Payload  : JSON-encoded message body.
    /// </summary>
    procedure SendMessage(MsgType: Text; Payload: Text)
}
