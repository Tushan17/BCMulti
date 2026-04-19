/// <summary>
/// Angular Demo Record
/// Stores demo data used by the AngularApp control addin example.
/// </summary>
table 51501 "Angular Demo Record"
{
    Caption              = 'Angular Demo Record';
    DataClassification   = CustomerContent;
    LookupPageId         = "Angular Demo List";
    DrillDownPageId      = "Angular Demo List";

    fields
    {
        field(1; "Entry No."; Integer)
        {
            Caption       = 'Entry No.';
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
            Caption       = 'Amount';
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
