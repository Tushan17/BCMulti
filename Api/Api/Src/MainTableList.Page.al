page 50001 "Main Table List"
{
    Caption = 'Main Table List';
    PageType = List;
    SourceTable = "Main Table";
    ApplicationArea = All;
    UsageCategory = Lists;

    layout
    {
        area(Content)
        {
            repeater(Records)
            {
                field("No."; Rec."No.")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the unique identifier for this record.';
                }

                field(Name; Rec.Name)
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the name of the record.';
                }
                field(Description; Rec.Description)
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies a description of the record.';
                }
                field(Amount; Rec.Amount)
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the amount for this record.';
                }
                field("Entry Date"; Rec."Entry Date")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the entry date for this record.';
                }
            }
        }
    }

    actions
    {
        area(Processing)
        {
            action(ConstructJson)
            {
                Caption = 'Construct JSON';
                ApplicationArea = All;
                Image = Information;
                ToolTip = 'Construct JSON for the selected record.';

                trigger OnAction()
                var
                    jsonObjectCodeunit: Codeunit JsonObject;
                begin
                    jsonObjectCodeunit.Run(Rec);
                end;
            }
        }
    }
}
