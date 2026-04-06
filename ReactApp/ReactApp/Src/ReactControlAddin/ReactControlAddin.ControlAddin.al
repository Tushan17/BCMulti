/// <summary>
/// ReactControlAddIn
/// Two-way data bridge between Business Central pages and a React application.
///
/// Scripts load order:
///   1. controlAddin-events.js  – creates the mount point and BC↔React bridge
///   2. react-addin.js          – the compiled React application bundle
///
/// Data flow BC → React:
///   Call CurrPage.ReactAddin.LoadData(jsonText) from AL
///   → bridge dispatches 'onBCLoadData' CustomEvent
///   → React updates its state
///
/// Data flow React → BC:
///   React dispatches 'onDataChange' CustomEvent
///   → bridge calls InvokeExtensibilityMethod('OnDataChange', [jsonText])
///   → AL trigger OnDataChange fires
/// </summary>
controladdin ReactControlAddIn
{
    RequestedHeight = 300;
    MinimumHeight = 200;
    VerticalStretch = true;
    VerticalShrink = true;
    HorizontalStretch = true;
    HorizontalShrink = true;

    // Scripts are loaded in order. The bridge MUST come before the React bundle.
    Scripts =
        './Src/ReactControlAddin/js/controlAddin-events.js',
        './Src/ReactControlAddin/js/react-addin.js';

    StyleSheets =
        './Src/ReactControlAddin/css/react-addin.css';

    // ── Events (React → BC) ──────────────────────────────────────────────────

    /// <summary>Fired when React has mounted and is ready to receive data.</summary>
    event ControlReady()

    /// <summary>
    /// Fired when the user saves changes in the React form.
    /// Data is a JSON string: {"name":"...","description":"...","amount":0}
    /// </summary>
    event OnDataChange(Data: Text)

    /// <summary>
    /// Fired when React triggers a named action (e.g. "refresh").
    /// </summary>
    event OnAction(ActionName: Text)

    // ── Procedures (BC → React) ──────────────────────────────────────────────

    /// <summary>
    /// Load a record into the React form.
    /// Pass a JSON string built from a JsonObject.
    /// </summary>
    procedure LoadData(DataJson: Text)

    /// <summary>
    /// Set the React form read-only (true) or editable (false).
    /// </summary>
    procedure SetReadOnly(ReadOnly: Boolean)
}
