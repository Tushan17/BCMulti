/// <summary>
/// AngularControlAddIn
/// Two-way data bridge between Business Central pages and an Angular application.
///
/// Scripts load order:
///   1. controlAddin-events.js  – creates the mount point and BC↔Angular bridge
///   2. angular-addin.js        – the compiled Angular application bundle
///
/// Data flow BC → Angular:
///   Call CurrPage.<ControlAddin>.LoadData(jsonText) from AL
///   → bridge dispatches 'onBCLoadData' CustomEvent
///   → Angular's BcBridgeService updates its observables
///
/// Data flow Angular → BC:
///   Angular dispatches 'onDataChange' CustomEvent
///   → bridge calls InvokeExtensibilityMethod('OnDataChange', [jsonText])
///   → AL trigger OnDataChange fires
///
/// Page routing:
///   Include { "page": "page-a" | "page-b" } in LoadData's JSON payload
///   to navigate the Angular app to a specific page on startup.
///   Alternatively call SetPage('page-a') directly.
///
/// Two-instance usage (same BC page):
///   usercontrol(AngularAddinA; AngularControlAddIn)  – opens Page A by default
///   usercontrol(AngularAddinB; AngularControlAddIn)  – opens Page B by default
///   Each control runs in its own iframe and Angular instance.
/// </summary>
controladdin AngularControlAddIn
{
    RequestedHeight = 500;
    MinimumHeight   = 500;
    VerticalStretch   = true;
    VerticalShrink    = true;
    HorizontalStretch = true;
    HorizontalShrink  = true;

    // Scripts are loaded in order. The bridge MUST come before the Angular bundle.
    Scripts =
        './Src/AngularControlAddin/js/controlAddin-events.js',
        './Src/AngularControlAddin/js/angular-addin.js';

    StyleSheets =
        './Src/AngularControlAddin/css/angular-addin.css';

    // ── Events (Angular → BC) ──────────────────────────────────────────────

    /// <summary>Fired when Angular has bootstrapped and is ready to receive data.</summary>
    event ControlReady()

    /// <summary>
    /// Fired when the user saves changes in the Angular form.
    /// Data is a JSON string: {"name":"...","description":"...","amount":0}
    /// </summary>
    event OnDataChange(Data: Text)

    /// <summary>
    /// Fired when Angular triggers a named action (e.g. "refresh").
    /// </summary>
    event OnAction(ActionName: Text)

    // ── Procedures (BC → Angular) ──────────────────────────────────────────

    /// <summary>
    /// Load a record into the Angular form and optionally navigate to a page.
    /// Pass a JSON string built from a JsonObject.
    /// Supported fields: name, description, amount, readOnly, page.
    /// Set "page" to "page-a" or "page-b" to open a specific Angular page.
    /// </summary>
    procedure LoadData(DataJson: Text)

    /// <summary>
    /// Set the Angular form read-only (true) or editable (false).
    /// </summary>
    procedure SetReadOnly(ReadOnly: Boolean)

    /// <summary>
    /// Navigate the Angular app to a specific page.
    /// Valid values: 'page-a' (Dashboard), 'page-b' (Details).
    /// </summary>
    procedure SetPage(PageName: Text)
}
