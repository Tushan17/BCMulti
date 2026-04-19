namespace Tushan.ReactApp;

table 51000 "React Demo Record"
{
    Caption = 'React Demo Record';
    DataClassification = CustomerContent;
    LookupPageId = "React Demo List";
    DrillDownPageId = "React Demo List";

    fields
    {
        field(1; "Entry No."; Integer)
        {
            Caption = 'Entry No.';
            AutoIncrement = true;
        }
        field(2; Name; Text[100])
        {
            Caption = 'Name';
        }
        field(3; Description; Text[250])
        {
            Caption = 'Description';
        }
        field(4; Amount; Decimal)
        {
            Caption = 'Amount';
            DecimalPlaces = 2 : 2;
        }
    }

    keys
    {
        key(PK; "Entry No.")
        {
            Clustered = true;
        }
    }

    fieldgroups
    {
        fieldgroup(DropDown; "Entry No.", Name, Amount) { }
    }
}
