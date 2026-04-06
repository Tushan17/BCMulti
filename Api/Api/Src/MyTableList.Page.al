page 50000 "My Table List"
{
    Caption = 'My Table List';
    PageType = List;
    SourceTable = "My Table";
    ApplicationArea = All;
    UsageCategory = Lists;

    layout
    {
        area(Content)
        {
            repeater(Records)
            {
                field("Main Table No."; Rec."Main Table No.")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the linked Main Table record.';
                }
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
                field(Quantity; Rec.Quantity)
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the quantity.';
                }
                field("Created Date"; Rec."Created Date")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the date the record was created.';
                }
            }
        }
    }

    actions
    {
        area(Processing)
        {
            action(NewRecord)
            {
                Caption = 'New';
                ApplicationArea = All;
                Image = New;
                ToolTip = 'Create a new record.';

                trigger OnAction()
                begin
                    Rec.Init();
                    Rec.Insert(true);
                end;
            }
            action(ImportXML)
            {
                Caption = 'Import XML';
                ApplicationArea = All;
                Image = ImportExcel;
                ToolTip = 'Import records from an XML file using the Data Exchange Definition (MYTBL-XML).';

                trigger OnAction()
                var
                    MyTableImportMgt: Codeunit "My Table Import Mgt.";
                begin
                    MyTableImportMgt.ImportXMLFile();
                    CurrPage.Update(false);
                end;
            }
            action(setupDataExchDef)
            {
                Caption = 'Setup Data Exchange Def.';
                ApplicationArea = All;
                Image = Setup;
                ToolTip = 'Create or repair the Data Exchange Definition (MYTBL-XML) used for importing XML files.';

                trigger OnAction()
                var
                    setup: codeunit "Camt054 DataExch Setup";
                begin
                    setup.CreateOrUpdateDataExchDef();
                    Message('Data Exchange Definition is set up and ready to use.');
                end;
            }
            action(ShowMainTable)
            {
                Caption = 'Main Table';
                ApplicationArea = All;
                Image = List;
                ToolTip = 'View Main Table records linked to the selected My Table record.';

                trigger OnAction()
                var
                    MainTable: Record "Main Table";
                    MainTableList: Page "Main Table List";
                begin
                    MainTable.Reset();
                    MainTable.SetRange("No.", Rec."Main Table No.");
                    MainTableList.SetTableView(MainTable);
                    MainTableList.Run();
                end;
            }
            //  action(setupDataExchDefMyTable)
            // {
            //     Caption = 'Setup Data Exchange My Table Def.';
            //     ApplicationArea = All;
            //     Image = Setup;
            //     ToolTip = 'Create or repair the Data Exchange Definition (MYTBL-XML) used for importing XML files.';

            //     trigger OnAction()
            //     var
            //         setup: codeunit "My Table XML Handler";
            //     begin
            //         setup.CreateOrUpdateDataExchDef();
            //         Message('Data Exchange Definition is set up and ready to use.');
            //     end;
            // }
        }
    }
}
