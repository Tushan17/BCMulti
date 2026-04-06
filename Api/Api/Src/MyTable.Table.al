table 50000 "My Table"
{
    Caption = 'My Table';
    DataClassification = CustomerContent;

    fields
    {
        field(1; "No."; Code[20])
        {
            Caption = 'No.';
        }
        field(2; Name; Text[100])
        {
            Caption = 'Name';
        }
        field(3; Description; Text[250])
        {
            Caption = 'Description';
        }
        field(4; Quantity; Integer)
        {
            Caption = 'Quantity';
        }
        field(5; "Created Date"; Date)
        {
            Caption = 'Created Date';
        }
        field(6; "Main Table No."; Code[20])
        {
            Caption = 'Main Table No.';
            TableRelation = "Main Table"."No.";
        }
    }

    keys
    {
        key(PK; "Main Table No.", "No.")
        {
            Clustered = true;
        }
    }
}
