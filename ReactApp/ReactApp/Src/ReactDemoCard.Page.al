page 51000 "React Demo Card"
{
    PageType = Card;
    SourceTable = "React Demo Record";
    Caption = 'React Demo Card';
    ApplicationArea = All;
    UsageCategory = Documents;

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
                    Editable = false;
                    ToolTip = 'Specifies the entry number (auto-assigned).';
                }
                field(Name; Rec.Name)
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the name.';

                    trigger OnValidate()
                    begin
                        // Push the updated record to React whenever BC fields change
                        PushRecordToReact();
                    end;
                }
                field(Description; Rec.Description)
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the description.';

                    trigger OnValidate()
                    begin
                        PushRecordToReact();
                    end;
                }
                field(Amount; Rec.Amount)
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the amount.';

                    trigger OnValidate()
                    begin
                        PushRecordToReact();
                    end;
                }
            }

            // ── React UI ────────────────────────────────────────────────────
            group(ReactSection)
            {
                Caption = 'React UI Component';
                ShowCaption = true;


                usercontrol(ReactAddin; ReactControlAddIn)
                {
                    ApplicationArea = All;

                    // Fired by React once it has mounted and is ready
                    trigger ControlReady()
                    begin
                        PushRecordToReact();
                    end;

                    // Fired when the user saves changes in the React form
                    // Data: JSON string  {"name":"...","description":"...","amount":0}
                    trigger OnDataChange(Data: Text)
                    var
                        JObj: JsonObject;
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
                    end;

                    // Fired when React requests a named action
                    trigger OnAction(ActionName: Text)
                    begin
                        case ActionName of
                            'refresh':
                                PushRecordToReact();
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
            action(SetReadOnly)
            {
                Caption = 'Toggle Read-Only in React';
                ApplicationArea = All;
                Image = Lock;
                ToolTip = 'Toggle the React form between read-only and editable mode.';

                trigger OnAction()
                begin
                    ReactReadOnly := not ReactReadOnly;
                    CurrPage.ReactAddin.SetReadOnly(ReactReadOnly);
                end;
            }
        }
    }

    var
        ReactReadOnly: Boolean;

    trigger OnAfterGetCurrRecord()
    begin
        // Called every time the record changes (e.g. navigate with arrows)
        PushRecordToReact();
    end;

    /// <summary>
    /// Serialises the current record to JSON and sends it to the React add-in.
    /// </summary>
    local procedure PushRecordToReact()
    var
        JObj: JsonObject;
        DataJson: Text;
    begin
        JObj.Add('name', Rec.Name);
        JObj.Add('description', Rec.Description);
        JObj.Add('amount', Rec.Amount);
        JObj.Add('readOnly', ReactReadOnly);
        JObj.WriteTo(DataJson);
        CurrPage.ReactAddin.LoadData(DataJson);
    end;
}
