/// <summary>
/// Angular Demo Card
/// Demonstrates the AngularControlAddIn used TWICE on the same BC page.
///
///   • First control addin  (AngularAddinA) → opens Page A (Dashboard) by default.
///   • Second control addin (AngularAddinB) → opens Page B (Details)  by default.
///
/// Each addin runs in its own iframe and has an independent Angular instance.
/// BC pushes the same record data to both; the user sees two different Angular
/// views of the same data side-by-side.
///
/// Navigation:
///   The Angular navbar lets the user switch between Dashboard and Details
///   inside each addin instance independently.
/// </summary>
page 51502 "Angular Demo Card"
{
    PageType    = Card;
    SourceTable = "Angular Demo Record";
    Caption     = 'Angular Demo Card';
    ApplicationArea = All;
    UsageCategory   = Documents;

    layout
    {
        area(content)
        {
            // ── Standard BC fields ──────────────────────────────────────────
            group(General)
            {
                Caption = 'General';

                field("Entry No."; Rec."Entry No.")
                {
                    ApplicationArea = All;
                    Editable        = false;
                    ToolTip         = 'Specifies the entry number (auto-assigned).';
                }
                field(Name; Rec.Name)
                {
                    ApplicationArea = All;
                    ToolTip         = 'Specifies the name.';

                    trigger OnValidate()
                    begin
                        PushRecordToAngular();
                    end;
                }
                field(Description; Rec.Description)
                {
                    ApplicationArea = All;
                    ToolTip         = 'Specifies the description.';

                    trigger OnValidate()
                    begin
                        PushRecordToAngular();
                    end;
                }
                field(Amount; Rec.Amount)
                {
                    ApplicationArea = All;
                    ToolTip         = 'Specifies the amount.';

                    trigger OnValidate()
                    begin
                        PushRecordToAngular();
                    end;
                }
            }

            // ── Angular Add-In A: opens Page A (Dashboard) by default ───────
            group(AngularSectionA)
            {
                Caption     = 'Angular UI – Dashboard (Page A)';
                ShowCaption = true;

                usercontrol(AngularAddinA; AngularControlAddIn)
                {
                    ApplicationArea = All;

                    // Fired by Angular once it has bootstrapped and is ready
                    trigger ControlReady()
                    begin
                        // Push data and instruct this addin to show Page A
                        PushRecordToAddinA();
                    end;

                    // Fired when the user saves changes in the Angular Dashboard form
                    trigger OnDataChange(Data: Text)
                    var
                        JObj:   JsonObject;
                        JToken: JsonToken;
                    begin
                        if not JObj.ReadFrom(Data) then
                            exit;

                        if JObj.Get('name', JToken) then
                            Rec.Name := CopyStr(JToken.AsValue().AsText(), 1, MaxStrLen(Rec.Name));

                        if JObj.Get('description', JToken) then
                            Rec.Description := CopyStr(JToken.AsValue().AsText(), 1, MaxStrLen(Rec.Description));

                        if JObj.Get('amount', JToken) then
                            Rec.Amount := JToken.AsValue().AsDecimal();

                        Rec.Modify(true);
                        CurrPage.Update(false);

                        // Keep the Details addin in sync
                        PushRecordToAddinB();
                    end;

                    // Fired when Angular Dashboard requests a named action
                    trigger OnAction(ActionName: Text)
                    begin
                        case ActionName of
                            'refresh':
                                PushRecordToAngular();
                        end;
                    end;
                }
            }

            // ── Angular Add-In B: opens Page B (Details) by default ─────────
            group(AngularSectionB)
            {
                Caption     = 'Angular UI – Details (Page B)';
                ShowCaption = true;

                usercontrol(AngularAddinB; AngularControlAddIn)
                {
                    ApplicationArea = All;

                    // Fired by Angular once it has bootstrapped and is ready
                    trigger ControlReady()
                    begin
                        // Push data and instruct this addin to show Page B
                        PushRecordToAddinB();
                    end;

                    // Fired when the user changes data via the Details view
                    trigger OnDataChange(Data: Text)
                    var
                        JObj:   JsonObject;
                        JToken: JsonToken;
                    begin
                        if not JObj.ReadFrom(Data) then
                            exit;

                        if JObj.Get('name', JToken) then
                            Rec.Name := CopyStr(JToken.AsValue().AsText(), 1, MaxStrLen(Rec.Name));

                        if JObj.Get('description', JToken) then
                            Rec.Description := CopyStr(JToken.AsValue().AsText(), 1, MaxStrLen(Rec.Description));

                        if JObj.Get('amount', JToken) then
                            Rec.Amount := JToken.AsValue().AsDecimal();

                        Rec.Modify(true);
                        CurrPage.Update(false);

                        // Keep the Dashboard addin in sync
                        PushRecordToAddinA();
                    end;

                    // Fired when Angular Details requests a named action
                    trigger OnAction(ActionName: Text)
                    begin
                        case ActionName of
                            'refresh':
                                PushRecordToAngular();
                        end;
                    end;
                }
            }
        }
    }

    actions
    {
        area(processing)
        {
            action(ToggleReadOnly)
            {
                Caption     = 'Toggle Read-Only in Angular';
                ApplicationArea = All;
                Image       = Lock;
                ToolTip     = 'Toggle the Angular forms between read-only and editable mode.';

                trigger OnAction()
                begin
                    AngularReadOnly := not AngularReadOnly;
                    CurrPage.AngularAddinA.SetReadOnly(AngularReadOnly);
                    CurrPage.AngularAddinB.SetReadOnly(AngularReadOnly);
                end;
            }

            action(GoToDashboard)
            {
                Caption     = 'Show Dashboard in Both';
                ApplicationArea = All;
                Image       = Navigate;
                ToolTip     = 'Navigate both Angular add-ins to the Dashboard page.';

                trigger OnAction()
                begin
                    CurrPage.AngularAddinA.SetPage('page-a');
                    CurrPage.AngularAddinB.SetPage('page-a');
                end;
            }

            action(GoToDetails)
            {
                Caption     = 'Show Details in Both';
                ApplicationArea = All;
                Image       = Navigate;
                ToolTip     = 'Navigate both Angular add-ins to the Details page.';

                trigger OnAction()
                begin
                    CurrPage.AngularAddinA.SetPage('page-b');
                    CurrPage.AngularAddinB.SetPage('page-b');
                end;
            }
        }
    }

    var
        AngularReadOnly: Boolean;

    trigger OnAfterGetCurrRecord()
    begin
        // Called every time the record changes (e.g. navigate with arrows)
        PushRecordToAngular();
    end;

    /// <summary>
    /// Push the current record to both Angular add-in instances.
    /// </summary>
    local procedure PushRecordToAngular()
    begin
        PushRecordToAddinA();
        PushRecordToAddinB();
    end;

    /// <summary>
    /// Push the current record to Add-In A with page = 'page-a' (Dashboard).
    /// </summary>
    local procedure PushRecordToAddinA()
    var
        JObj:     JsonObject;
        DataJson: Text;
    begin
        JObj.Add('name', Rec.Name);
        JObj.Add('description', Rec.Description);
        JObj.Add('amount', Rec.Amount);
        JObj.Add('readOnly', AngularReadOnly);
        JObj.Add('page', 'page-a');
        JObj.WriteTo(DataJson);
        CurrPage.AngularAddinA.LoadData(DataJson);
    end;

    /// <summary>
    /// Push the current record to Add-In B with page = 'page-b' (Details).
    /// </summary>
    local procedure PushRecordToAddinB()
    var
        JObj:     JsonObject;
        DataJson: Text;
    begin
        JObj.Add('name', Rec.Name);
        JObj.Add('description', Rec.Description);
        JObj.Add('amount', Rec.Amount);
        JObj.Add('readOnly', AngularReadOnly);
        JObj.Add('page', 'page-b');
        JObj.WriteTo(DataJson);
        CurrPage.AngularAddinB.LoadData(DataJson);
    end;
}
