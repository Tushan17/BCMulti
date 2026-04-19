/// <summary>
/// Angular Demo List
/// Lists all Angular Demo Records and links to the Angular Demo Card.
/// </summary>
page 51501 "Angular Demo List"
{
    PageType    = List;
    SourceTable = "Angular Demo Record";
    Caption     = 'Angular Demo Records';
    ApplicationArea = All;
    UsageCategory   = Lists;
    CardPageId  = "Angular Demo Card";

    layout
    {
        area(content)
        {
            repeater(Records)
            {
                field("Entry No."; Rec."Entry No.")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the entry number.';
                }
                field(Name; Rec.Name)
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the name.';
                }
                field(Description; Rec.Description)
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the description.';
                }
                field(Amount; Rec.Amount)
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the amount.';
                }
            }
        }
    }

    actions
    {
        area(processing)
        {
            action(NewRecord)
            {
                Caption     = 'New Demo Record';
                ApplicationArea = All;
                Image       = New;
                ToolTip     = 'Create a new Angular demo record.';

                trigger OnAction()
                var
                    DemoRec: Record "Angular Demo Record";
                begin
                    DemoRec.Init();
                    DemoRec.Insert(true);
                    Page.Run(Page::"Angular Demo Card", DemoRec);
                end;
            }
        }
    }
}
