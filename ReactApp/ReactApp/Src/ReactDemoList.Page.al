page 51001 "React Demo List"
{
    PageType = List;
    SourceTable = "React Demo Record";
    Caption = 'React Demo Records';
    ApplicationArea = All;
    UsageCategory = Lists;
    CardPageId = "React Demo Card";

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
                Caption = 'New Demo Record';
                ApplicationArea = All;
                Image = New;
                ToolTip = 'Create a new demo record.';

                trigger OnAction()
                var
                    DemoRec: Record "React Demo Record";
                begin
                    DemoRec.Init();
                    DemoRec.Insert(true);
                    Page.Run(Page::"React Demo Card", DemoRec);
                end;
            }
        }
    }
}
