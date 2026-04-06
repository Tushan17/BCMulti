table 50001 "Main Table"
{
    Caption = 'Main Table';
    DataClassification = CustomerContent;

    fields
    {
        field(1; "No."; Code[20])
        {
            Caption = 'No.';
        }

        field(3; Name; Text[100])
        {
            Caption = 'Name';
        }
        field(4; Description; Text[250])
        {
            Caption = 'Description';
        }
        field(5; Amount; Decimal)
        {
            Caption = 'Amount';
        }
        field(6; "Entry Date"; Date)
        {
            Caption = 'Entry Date';
        }
        field(2; NewID; Integer)
        {
            AutoIncrement = true;
        }
    }

    keys
    {
        key(PK; NewID)
        {
            Clustered = true;
        }
        // {
        //     Clustered = true;
        // }

    }
}
