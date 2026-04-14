/// <summary>
/// Generic Demo Card
/// Demonstrates how to wire a BC page to the BCGenericControlAddIn.
///
/// Message routing (React service: demoRecordService.ts)
/// ─────────────────────────────────────────────────────
///  React → BC  'demo.record.query'  : React asks for the current record.
///  BC → React  'demo.record.load'   : BC pushes the serialised record.
///  React → BC  'demo.record.save'   : React sends updated record fields.
///  React → BC  'demo.action'        : React triggers a named action.
///  BC → React  'demo.readonly'      : BC sets the read-only flag.
/// </summary>
page 51100 "Generic Demo Card"
{
    PageType = Card;
    SourceTable = "React Demo Record";
    Caption = 'Generic Demo Card';
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

            // ── Generic React add-in ─────────────────────────────────────────
            group(ReactSection)
            {
                Caption = 'React UI Component (Generic Bridge)';
                ShowCaption = true;

                usercontrol(GenericAddin; BCGenericControlAddIn)
                {
                    ApplicationArea = All;

                    /// <summary>React has mounted — push the current record.</summary>
                    trigger ControlReady()
                    begin
                        PushRecordToReact();
                    end;

                    /// <summary>
                    /// Routes incoming messages from React services to the
                    /// appropriate AL handler.
                    /// </summary>
                    trigger OnMessage(MsgType: Text; Payload: Text)
                    begin
                        case MsgType of
                            'demo.record.query':
                                // React is asking for the current record
                                PushRecordToReact();

                            'demo.record.save':
                                // React has saved changes – apply them to the record
                                ApplyPayloadToRecord(Payload);

                            'demo.action':
                                // React triggered a named action
                                HandleAction(Payload);
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
                Caption = 'Toggle Read-Only in React';
                ApplicationArea = All;
                Image = Lock;
                ToolTip = 'Toggle the React form between read-only and editable mode.';

                trigger OnAction()
                begin
                    ReactReadOnly := not ReactReadOnly;
                    // Send the read-only flag using the generic message channel
                    CurrPage.GenericAddin.SendMessage(
                        'demo.readonly',
                        Format(ReactReadOnly, 0, 9).ToLower());
                end;
            }
        }
    }

    var
        ReactReadOnly: Boolean;

    trigger OnAfterGetCurrRecord()
    begin
        PushRecordToReact();
    end;

    /// <summary>
    /// Serialises the current record to JSON and sends it to React via the
    /// generic 'demo.record.load' message.
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
        CurrPage.GenericAddin.SendMessage('demo.record.load', DataJson);
    end;

    /// <summary>
    /// Parses a JSON payload sent by the React 'demo.record.save' message and
    /// applies the field values to the current record.
    /// </summary>
    local procedure ApplyPayloadToRecord(Payload: Text)
    var
        JObj: JsonObject;
        JToken: JsonToken;
    begin
        if not JObj.ReadFrom(Payload) then
            exit;

        if JObj.Get('name', JToken) then
            Rec.Name := CopyStr(JToken.AsValue().AsText(), 1, MaxStrLen(Rec.Name));

        if JObj.Get('description', JToken) then
            Rec.Description :=
                CopyStr(JToken.AsValue().AsText(), 1, MaxStrLen(Rec.Description));

        if JObj.Get('amount', JToken) then
            Rec.Amount := JToken.AsValue().AsDecimal();

        Rec.Modify(true);
        CurrPage.Update(false);
    end;

    /// <summary>Handles named actions triggered from React.</summary>
    local procedure HandleAction(ActionName: Text)
    begin
        case ActionName of
            'refresh':
                PushRecordToReact();
        end;
    end;
}
